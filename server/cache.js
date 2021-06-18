const redis = require("redis");
const { promisify } = require("util");

const envVar = ({ name, required = true }) => {
  if (!process.env[name] && required) {
    process.exit(1);
  }
  return process.env[name];
};

const REDIS_URL = envVar({ name: "REDIS_SERVICE", required: true });

function lagreIRedis(key, value) {
  const client = redis.createClient(REDIS_URL);

  client.on("error", function (error) {
    console.error(error);
  });
  const bufferData = Buffer.from(value);

  client.select(1, function (err, res) {
    if (err) {
      return err;
    }
    client.set(key, bufferData);
    //client.expire(key, process.env.CACHE_EXP || 600);
  });
}

async function hentFraRedis(key) {
  const client = redis.createClient(REDIS_URL);
  const getAsync = promisify(client.get).bind(client);
  const selectAsync = promisify(client.select).bind(client);

  return new Promise((resolve, reject) => {
    client.select(1, function (err, res) {
      if (err) {
        reject(err);
      }
      resolve(getAsync(key));
    });
  });
}

function cacheMiddleWare(req, res, next) {
  if (req.path !== "/oppgaver") next();
  else {
    return hentFraRedis("oppgaver")
      .then((oppgaver) => {
        if (oppgaver) {
          res.setHeader("content-type", "application/json");
          res.status(200).end(oppgaver);
        } else {
          next();
        }
      })
      .catch((err) => {
        next();
      });
  }
}

function handleProxyRes(proxyRes, req, res) {
  if (req.path === "/oppgaver" && req.method === "GET") {
    let dataSet = "";
    proxyRes.on("data", function (data) {
      dataSet += data;
    });
    proxyRes.on("end", function () {
      lagreIRedis("oppgaver", dataSet);
    });
  }
}

module.exports = {
  hentFraRedis,
  lagreIRedis,
  handleProxyRes,
  cacheMiddleWare,
};
