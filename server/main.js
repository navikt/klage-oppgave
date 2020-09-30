let azure = require("./auth/azure");
let config = require("./config");
let routes = require("./routes");
let cors = require("./cors");
let express = require("express");
let helmet = require("helmet");
let passport = require("passport");
let session = require("./session");

// for debugging during development
let morganBody = require("morgan-body");
let morgan = require("morgan");

const server = express();
const port = config.server.port;

async function startApp() {
  try {
    morganBody(server);
    morgan("dev");

    session.setup(server);

    server.use(express.json());
    server.use(express.urlencoded({ extended: true }));

    // setup sane defaults for CORS and HTTP headers
    server.use(
      helmet({
        contentSecurityPolicy: false,
      })
    );
    server.use(cors);

    // initialize passport and restore authentication state, if any, = require(the session
    server.use(passport.initialize());
    server.use(passport.session());

    const azureAuthClient = await azure.client();
    const azureOidcStrategy = azure.strategy(azureAuthClient);

    passport.use("azureOidc", azureOidcStrategy);
    passport.serializeUser((user, done) => done(null, user));
    passport.deserializeUser((user, done) => done(null, user));

    // setup routes
    server.use("/", routes.setup(azureAuthClient));
    server.listen(port, () => console.log(`Listening on port ${port}`));
  } catch (error) {
    console.error("Error during start-up", error);
  }
}

startApp().catch((err) => console.log(err));
