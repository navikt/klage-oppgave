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

const envVar = ({ name, required = true }) => {
  if (!process.env[name] && required) {
    console.error(`Missing required environment variable '${name}'`);
    process.exit(1);
  }
  return process.env[name];
};

const setup = (authClient) => {
  router.use(
    "/api",
    cacheMiddleWare,
    createProxyMiddleware({
      target: "http://localhost:3000",
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

  router.get("/", (req, res) => {
    return res
      .status(200)
      .sendFile(path.resolve(__dirname, "../frontend/dist/index.html"));
  });

  router.use(
    "/me",
    createProxyMiddleware({
      target: "http://localhost:3000",
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
