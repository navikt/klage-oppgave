let azure = require("./auth/azure");
let config = require("./config");
let routes = require("./routes");
let routesDev = require("./routesDev");
let cors = require("./cors");
let express = require("express");
let helmet = require("helmet");
let passport = require("passport");
let session = require("./session");
let slowDown = require("express-slow-down");

// for debugging during development
let morganBody = require("morgan-body");
let morgan = require("morgan");

const server = express();
const port = config.server.port;

const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 100, // allow 100 requests per 15 minutes, then...
  delayMs: 500, // begin adding 500ms of delay per request above 100:
});

async function startApp() {
  try {
    morganBody(server);
    const logger = morgan("combined");
    session.setup(server);

    server.use(speedLimiter);

    // setup sane defaults for CORS and HTTP headers
    server.use(
      helmet({
        contentSecurityPolicy: false,
      })
    );
    server.use(cors);

    if (process.env.NODE_ENV === "production") {
      // initialize passport and restore authentication state, if any, = require(the session
      server.use(passport.initialize());
      server.use(passport.session());
      const azureAuthClient = await azure.client();
      const azureOidcStrategy = azure.strategy(azureAuthClient);
      passport.use("azureOidc", azureOidcStrategy);
      passport.serializeUser((user, done) => done(null, user));
      passport.deserializeUser((user, done) => done(null, user));
      server.use("/", routes.setup(azureAuthClient));
    } else {
      server.use("/", routesDev.setup());
    }
    // setup routes
    server.listen(port, () => console.log(`Listening on port ${port}`));
  } catch (error) {
    console.error("Error during start-up", error);
  }
}

startApp().catch((err) => console.log(err));
