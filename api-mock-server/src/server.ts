import express from "express";
import cors from "cors";
import slowDown from "express-slow-down";
import * as fs from "fs";
import bodyParser from "body-parser";
import { eqNumber } from "fp-ts/lib/Eq";
import JSONStream from "jsonstream";
import es from "event-stream";
import chalk from "chalk";

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

app.get("/ansatte/:id/oppgaver", (req, res) => {
  const { type, antall, start, rekkefoelge } = req.query;
  console.log(chalk.yellow("type", type));
  console.log(chalk.red("antall", antall));
  console.log(chalk.red("start", start));
  console.log(chalk.red("slutt", Number(start) + Number(antall)));
  console.log(chalk.cyan("rekkefølge", rekkefoelge));
  const buffer = fs.readFileSync("./fixtures/oppgaver.json");
  const antallTreffTotalt = JSON.parse(buffer.toString("utf8"))
    .antallTreffTotalt;
  let oppgaver = JSON.parse(buffer.toString("utf8")).oppgaver;

  if (rekkefoelge === "SYNKENDE")
    oppgaver = oppgaver.slice().sort(function (a: any, b: any) {
      return new Date(a.frist).getTime() - new Date(b.frist).getTime();
    });
  else
    oppgaver = oppgaver.slice().sort(function (a: any, b: any) {
      return new Date(b.frist).getTime() - new Date(a.frist).getTime();
    });

  let filtrerteOppgaver: any = [];
  oppgaver.forEach((oppgave: any) => {
    if ("undefined" !== typeof type) {
      const typer = (type as string).split(",");
      typer.forEach((t) => {
        if (oppgave.type.toLocaleLowerCase() === t.toLocaleLowerCase()) {
          filtrerteOppgaver.push(oppgave);
        }
      });
    } else {
      filtrerteOppgaver = oppgaver;
    }
  });

  res.send({
    antallTreffTotalt,
    oppgaver: filtrerteOppgaver.slice(start, Number(start) + Number(antall)),
  });
});

app.get("/ansatte/:id/tildelteoppgaver", (req, res) => {
  const saksbehandler = req.params.id;
  console.log(req.params, saksbehandler);

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
            data.oppgaver.saksbehandler.ident === saksbehandler
              ? "[" + JSON.stringify(data)
              : "["
          );
          first = false;
          if (data.oppgaver.saksbehandler.ident === saksbehandler)
            written = true;
        } else {
          if (written) {
            cb(
              null,
              data.oppgaver.saksbehandler.ident == saksbehandler
                ? "," + JSON.stringify(data)
                : ""
            );
          } else {
            cb(
              null,
              data.oppgaver.saksbehandler.ident == saksbehandler
                ? JSON.stringify(data)
                : ""
            );
          }
          if (!written && data.oppgaver.saksbehandler.ident === saksbehandler)
            written = true;
        }
      })
    )
    .on("data", (data: string) => {
      res.write(data);
      res.flushHeaders();
    })
    .on("end", () => {
      res.write("]");
      res.end();
    });
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
  const oppgave = await data.oppgaver.filter((rad: { id: number }) =>
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
