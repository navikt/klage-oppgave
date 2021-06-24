let url = require("url");

let authUtils = require("../auth/utils");
let config = require("../config");
let proxy = require("express-http-proxy");

const options = (api, authClient) => ({
  parseReqBody: false,
  proxyReqOptDecorator: (options, req) => {
    return new Promise((resolve, reject) =>
      authUtils.getOnBehalfOfAccessToken(authClient, req, api).then(
        (access_token) => {
          options.headers.Authorization = `Bearer ${access_token}`;
          resolve(options);
        },
        (error) => reject(error)
      )
    );
  },
  proxyReqPathResolver: (req) => {
    const urlFromApi = url.parse(api.url);
    const pathFromApi = urlFromApi.pathname === "/" ? "" : urlFromApi.pathname;

    const urlFromRequest = url.parse(req.originalUrl);
    const pathFromRequest = urlFromRequest.pathname.replace(
      `/${api.path}/`,
      "/"
    );

    const queryString = urlFromRequest.query;
    return (
      (pathFromApi ? pathFromApi : "") +
      (pathFromRequest ? pathFromRequest : "") +
      (queryString ? "?" + queryString : "")
    );
  },
});

const stripTrailingSlash = (str) =>
  str.endsWith("/") ? str.slice(0, -1) : str;

const setup = (router, authClient) => {
  config.reverseProxy.apis.forEach((api) =>
    router.use(`/${api.path}/*`, proxy(api.url, options(api, authClient)))
  );
};

module.exports = { setup };
