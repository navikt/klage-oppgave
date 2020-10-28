import express from "express";
import cors from "cors";
import slowDown from "express-slow-down";
import * as fs from "fs";
import bodyParser from "body-parser";
import { eqBoolean, eqDate, eqNumber, eqString } from "fp-ts/lib/Eq";
import JSONStream from "JSONStream";
import es from "event-stream";
import chalk from "chalk";
import { callbackify } from "util";

const JSONStreamStringify = require("json-stream-stringify");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const port = 3000; // default port to listen
const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 10, // allow 100 requests per 15 minutes, then...
  delayMs: 500, // begin adding 500ms of delay per request above 100:
});
app.use(speedLimiter);

app.get("/oppgaver", (req, res) => {
  // klage-oppgave-api har to definert to parametre: "erTildelt" og "saksbehandler"
  // "erTildelt" virker ikke å ha noen funksjon enda

  const saksbehandler = req.query.saksbehandler;
  res.header("transfer-encoding", "chunked");
  res.header("content-type", "application/json");

  if (!saksbehandler) {
    var stream = fs.createReadStream("./fixtures/oppgaver.json");

    stream.on("data", function (data) {
      res.write(data);
    });
    stream.on("end", function () {
      res.end();
    });
  }

  if (saksbehandler) {
    let first = true;
    let written = false;
    return fs
      .createReadStream("./fixtures/oppgaver.json")
      .pipe(JSONStream.parse("*"))
      .pipe(
        es.map(function (data: any, cb: Function) {
          if (first) {
            cb(
              null,
              data.saksbehandler === saksbehandler
                ? "[" + JSON.stringify(data)
                : "["
            );
            first = false;
            if (data.saksbehandler === saksbehandler) written = true;
          } else {
            if (written) {
              cb(
                null,
                data.saksbehandler.ident == saksbehandler
                  ? "," + JSON.stringify(data)
                  : ""
              );
            } else {
              cb(
                null,
                data.saksbehandler.ident == saksbehandler
                  ? JSON.stringify(data)
                  : ""
              );
            }
            if (!written && data.saksbehandler === saksbehandler)
              written = true;
          }
        })
      )
      .on("data", (data: string) => {
        res.write(data);
        res.flushHeaders();
      })
      .on("end", (data: string) => {
        res.write("]");
        res.end();
      });
  }
});

interface OppgaveModell {
  ident: String;
}

app.put("/oppgaver/:id/saksbehandler", async (req, res) => {
  const id = parseInt(req.params.id, 10) as number;
  const body = req.body as OppgaveModell;
  console.log(chalk.greenBright(id));
  console.log(chalk.green(JSON.stringify(body)));

  const data = require("../fixtures/oppgaver.json");
  const oppgave = await data.filter((rad: { id: number }) =>
    eqNumber.equals(rad.id, id)
  )[0];
  if (!oppgave) {
    res.send({});
  } else {
    res.send({
      ...oppgave,
      saksbehandler: {
        ident: body.ident,
        navn: oppgave.saksbehandler.navn,
      },
    });
  }
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
