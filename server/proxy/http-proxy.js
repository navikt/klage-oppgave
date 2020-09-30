let config = require("../config");
let Agent = require("https-proxy-agent");
let { HttpsProxyAgent } = Agent;

const agent = () => {
  const proxyUri = config.server.proxy;
  if (proxyUri) {
    console.log(`Proxying requests via ${proxyUri} for openid-cilent`);
    const agent = new HttpsProxyAgent(proxyUri);
    return {
      http: agent,
      https: agent,
    };
  } else {
    console.log(
      `Environment variable HTTP_PROXY is not set, not proxying requests for openid-client`
    );
    return null;
  }
};

module.exports = { agent: agent() };
