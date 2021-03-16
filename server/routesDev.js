let express = require("express");
let path = require("path");
let session = require("express-session");
const axios = require("axios");
const {
  lagreIRedis,
  hentFraRedis,
  cacheMiddleWare,
  handleProxyRes,
} = require("./cache");
const router = express.Router();
const { createProxyMiddleware } = require("http-proxy-middleware");
let bodyParser = require("body-parser");

const envVar = ({ name, required = true }) => {
  if (!process.env[name] && required) {
    console.error(`Missing required environment variable '${name}'`);
    process.exit(1);
  }
  return process.env[name];
};

const setup = (authClient) => {
  router.post(
    "/internal/innstillinger",
    bodyParser.json(),
    async (req, res) => {
      const { navIdent, enhetId, innstillinger } = req.body;
      let settings = "";
      try {
        await lagreIRedis(
          `innstillinger_${navIdent}_${enhetId}`,
          innstillinger
        );
        settings = await hentFraRedis(`innstillinger_${navIdent}_${enhetId}`);
        res.status(200).json(JSON.parse(settings));
      } catch (e) {
        res.status(500).json({ err: e });
      }
    }
  );
  router.get(
    "/internal/innstillinger/:navIdent/:enhetId",
    bodyParser.json(),
    async (req, res) => {
      const { navIdent, enhetId } = req.params;
      let settings = "";
      try {
        settings = await hentFraRedis(`innstillinger_${navIdent}_${enhetId}`);
        res.status(200).json(JSON.parse(settings));
      } catch (e) {
        res.status(500).json({ err: e });
      }
    }
  );

  router.use(
    "/api",
    cacheMiddleWare,
    createProxyMiddleware({
      target: "http://apimock:3000",
      //target: "https://klage-oppgave-api.dev.nav.no/",
      pathRewrite: {
        "^/api": "",
      },
      onError: function onError(err, req, res) {
        res.status(500);
        res.json({ error: "Kunne ikke koble til API" });
      },
      onProxyReq(proxyReq, req, res) {
        const token = ""; // legg inn ved beov
        proxyReq.setHeader("Authorization", `Bearer ${token}`);
      },
      async onProxyRes(proxyRes, req, res) {
        await handleProxyRes(proxyRes, req, res);
      },
      logLevel: "debug",
      changeOrigin: true,
    })
  );
  router.get("/internal/token_expiration", (req, res) => {
    let expiration = Math.round(new Date().getTime() / 1000) + 3600;
    res.send(expiration.toString());
  });

  /*
  router.get("/", (req, res) => {
    return res
      .status(200)
      .sendFile(path.resolve(__dirname, "../frontend/dist/index.html"));
  });
  */

  router.use(
    "/me",
    createProxyMiddleware({
      target: "http://apimock:3000",
      onError: function onError(err, req, res) {
        res.status(500);
        res.json({ error: "Kunne ikke koble til API" });
      },
      logLevel: "debug",
      changeOrigin: true,
    })
  );

  // serve static files
  const buildPath = path.resolve(__dirname, "../frontend/dist");
  router.use("/", express.static(buildPath, { index: false }));
  router.use("*", (req, res) => {
    res.sendFile("index.html", { root: buildPath });
  });
  return router;
};

module.exports = { setup };
