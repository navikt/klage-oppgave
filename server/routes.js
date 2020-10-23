let authUtils = require("./auth/utils");
let config = require("./config");
let express = require("express");
let passport = require("passport");
let path = require("path");
let session = require("express-session");
const axios = require("axios");
const { hentFraRedis, cacheMiddleWare, handleProxyRes } = require("./cache");
const router = express.Router();
const { createProxyMiddleware } = require("http-proxy-middleware");

const ensureAuthenticated = async (req, res, next) => {
  if (req.isAuthenticated() && authUtils.hasValidAccessToken(req)) {
    next();
  } else {
    session.redirectTo = req.url;
    res.redirect("/login");
  }
};

const envVar = ({ name, required = true }) => {
  if (!process.env[name] && required) {
    console.error(`Missing required environment variable '${name}'`);
    process.exit(1);
  }
  return process.env[name];
};

const setup = (authClient) => {
  router.get("/isAlive", (req, res) => res.send("Alive"));
  router.get("/isReady", (req, res) => res.send("Ready"));

  // Routes for passport to handle the authentication flow
  router.get(
    "/login",
    passport.authenticate("azureOidc", { failureRedirect: "/login" })
  );

  router.get("/error", (req, res) => {
    res.send("error");
  });

  router.use(
    "/oauth2/callback",
    passport.authenticate("azureOidc", { failureRedirect: "/error" }),
    (req, res) => {
      if (session.redirectTo) {
        res.redirect(session.redirectTo);
      } else {
        res.redirect("/");
      }
    }
  );

  router.use(ensureAuthenticated);

  router.use(async (req, res, next) => {
    if (req.path.startsWith("/api")) {
      const params = {
        clientId: "0bc199ef-35dd-4aa3-87e6-01506da3dd90",
        path: "api",
        url: "https://klage-oppgave-api.dev.nav.no/",
        scopes: [],
      };
      const token = await new Promise((resolve, reject) =>
        authUtils
          .getOnBehalfOfAccessToken(authClient, req, params)
          .then((userinfo) => resolve(userinfo))
          .catch((err) => reject(err))
      );
      req.headers["Authorization"] = `Bearer ${token}`;
      req.headers["Accept"] = `application/json`;
      console.log({ token });
      next();
    } else {
      next();
    }
  });

  router.use(
    "/api",
    cacheMiddleWare,
    createProxyMiddleware({
      target: "http://klage-oppgave-api",
      pathRewrite: {
        "^/api": "",
      },
      onError: function onError(err, req, res) {
        res.status(500);
        res.json({ error: "Kunne ikke koble til API" });
      },
      async onProxyRes(proxyRes, req, res) {
        await handleProxyRes(proxyRes, req, res);
      },
      logLevel: "debug",
      changeOrigin: true,
    })
  );

  router.get("/", (req, res) => {
    return res
      .status(200)
      .sendFile(path.resolve(__dirname, "../frontend/dist/index.html"));
  });

  /*
		router.get("/usertoken", (req, res) => {
			res.json(req.user);
		});
		router.get("/graphtoken", (req, res) => {
			const params = {
				clientId: "https://graph.microsoft.com",
				scopes: ["https://graph.microsoft.com/.default"],
			};
			authUtils
				.getOnBehalfOfAccessToken(authClient, req, params)
				.then((userinfo) => res.json(userinfo))
				.catch((err) => res.status(500).json(err));
		});
		router.get("/token", (req, res) => {
			const params = {
				clientId: "0bc199ef-35dd-4aa3-87e6-01506da3dd90",
				path: "api",
				url: "https://klage-oppgave-api.dev.nav.no/",
				scopes: [],
			};
			authUtils
				.getOnBehalfOfAccessToken(authClient, req, params)
				.then((userinfo) => res.json(userinfo))
				.catch((err) => res.status(500).json(err));
		});
	*/

  router.get("/me", (req, res) => {
    authUtils
      .getUserInfoFromGraphApi(authClient, req)
      .then((userinfo) => res.json(userinfo))
      .catch((err) => res.status(500).json(err));
  });

  // log the user out
  router.get("/logout", (req, res) => {
    req.logOut();
    res.redirect(
      authClient.endSessionUrl({
        post_logout_redirect_uri: config.azureAd.logoutRedirectUri,
      })
    );
  });

  // serve static files
  const buildPath = path.resolve(__dirname, "../frontend/dist");
  router.use("/", express.static(buildPath, { index: false }));
  router.use("*", (req, res) => {
    res.sendFile("index.html", { root: buildPath });
  });
  return router;
};

module.exports = { setup };
