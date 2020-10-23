import express from "express";
import cors from "cors";
import slowDown from "express-slow-down";
import * as fs from "fs";

const app = express();
app.use(cors());
const port = 3000; // default port to listen
const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 100, // allow 100 requests per 15 minutes, then...
  delayMs: 500, // begin adding 500ms of delay per request above 100:
  // request # 101 is delayed by  500ms
  // request # 102 is delayed by 1000ms
  // request # 103 is delayed by 1500ms
  // etc.
});
app.use(speedLimiter);

app.get("/oppgaver", (req, res) => {
  res.header("transfer-encoding", "chunked");
  var stream = fs.createReadStream("./fixtures/oppgaver.json");

  stream.on("data", function (data) {
    res.write(data);
  });

  stream.on("end", function () {
    res.end();
  });
});
// define a route handler for the default home page
app.get("/token", (req, res) => {
  res.send(require("../fixtures/token.txt"));
});
// define a route handler for the default home page
app.get("/me", (req, res) => {
  res.send(require("../fixtures/me.json"));
});

// start the Express server
app.listen(port, () => {
  /*tslint:disable*/
  console.log(`server started at http://localhost:${port}`);
});
