let OIDC_Client = require("openid-client");
let { custom, Issuer, Strategy } = OIDC_Client;
let authUtils = require("./utils");
let config = require("../config");

const metadata = {
  client_id: config.azureAd.clientId,
  redirect_uris: [config.azureAd.redirectUri],
  token_endpoint_auth_method: config.azureAd.tokenEndpointAuthMethod,
  token_endpoint_auth_signing_alg: config.azureAd.tokenEndpointAuthSigningAlg,
};

const client = async () => {
  const issuer = await Issuer.discover(config.azureAd.discoveryUrl);
  console.log(`Discovered issuer ${issuer.issuer}`);
  const jwks = config.azureAd.clientJwks;
  return new issuer.Client(metadata, jwks);
};

const strategy = (client) => {
  const verify = (tokenSet, done) => {
    if (tokenSet.expired()) {
      return done(null, false);
    }
    const user = {
      tokenSets: {
        [authUtils.tokenSetSelfId]: tokenSet,
      },
      claims: tokenSet.claims(),
    };
    return done(null, user);
  };
  const options = {
    client: client,
    params: {
      response_types: config.azureAd.responseTypes,
      response_mode: config.azureAd.responseMode,
      scope: `openid ${authUtils.appendDefaultScope(config.azureAd.clientId)}`,
    },
    passReqToCallback: false,
    usePKCE: "S256",
  };
  return new Strategy(options, verify);
};

module.exports = { client, strategy };
