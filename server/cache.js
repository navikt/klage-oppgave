const redis = require("redis");
const { promisify } = require("util");

const envVar = ({ name, required = true }) => {
  if (!process.env[name] && required) {
    console.error(`Missing required environment variable '${name}'`);
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
  client.set(key, bufferData);
  client.expire(key, 600);
}

async function hentFraRedis(key) {
  const client = redis.createClient(REDIS_URL);
  const getAsync = promisify(client.get).bind(client);
  return getAsync(key);
}

function cacheMiddleWare(req, res, next) {
  return hentFraRedis("oppgaver")
    .then((oppgaver) => {
      if (oppgaver) {
        const data = JSON.stringify(oppgaver.replace("\\", ""));
        res.setHeader("content-type", "application/json");
        res.status(200).end(oppgaver);
      } else {
        next();
      }
    })
    .catch((err) => {
      console.error(err);
      next();
    });
}

function handleProxyRes(proxyRes, req, res) {
  if (req.path.startsWith("/oppgaver")) {
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
