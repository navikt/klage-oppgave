import { App } from "@tinyhttp/app";
import { logger } from "@tinyhttp/logger";

let bodyParser = require("body-parser");

import {
  filtrerOppgaver,
  fradelSaksbehandler,
  ISaksbehandler,
  tildelSaksbehandler,
} from "./oppgaver";
import { OppgaveQuery } from "./types";

const app = new App()
  .use(logger())
  .use(bodyParser.json())
  .use(bodyParser.urlencoded({ extended: false }));
const port = 3000; // default port to listen

async function hentOppgaver() {
  const sqlite3 = require("sqlite3");
  let db = new sqlite3.Database("./oppgaver.db");
  let sql = `SELECT Id, frist FROM Oppgaver LIMIT 10`;
  return new Promise((resolve, reject) => {
    db.all(sql, (err: any, rad: any) => {
      if (err) {
        reject(err);
      }
      resolve(rad);
    });
    db.close((err: { message: string }) => {
      if (err) {
        console.error(err.message);
      }
      console.log("Close the database connection.");
    });
  });
}

app.get(
  "/klagebehandlinger/:id/journalposter/:journalPostId/dokumenter/:dokumentId",
  (req, res) => {
    let buff = new Buffer(
      "JVBERi0xLjUKJeLjz9MKNiAwIG9iago8PCAvQ3JlYXRvciAoT3BlblRleHQgRXhzdHJlYW0gVmVyc2lvbiA5LjUuMzA3IDMyLWJpdCkKL0NyZWF0aW9uRGF0ZSAoMy8xLzIwMjEgMDg6NTM6NDUpCi9BdXRob3IgKFJlZ2lzdGVyZWQgdG86IE5BViAgICAgKQovVGl0bGUgKEdPU1lTX0ZFUkRJR1NUSUxMX1pPUykKPj4KZW5kb2JqCjcgMCBvYmoKPDwvTGVuZ3RoIDU5NS9GaWx0ZXIvRmxhdGVEZWNvZGU"
    );
    res.send(buff.toJSON());
  }
);

app.get("/kodeverk", (req, res) => {
  let data = require("fs")
    .readFileSync(
      require("path").resolve(__dirname, "../fixtures/kodeverk.json")
    )
    .toString("utf8");
  let kodeverk = JSON.parse(data);
  res.send(kodeverk);
});

app.get("/klagebehandlinger/:id", async (req, res) => {
  res.send({
    id: "e1335d60-015a-487b-9bf3-9032a175a158",
    klageInnsendtdato: null,
    fraNAVEnhet: "4416",
    mottattFoersteinstans: "2019-08-22",
    foedselsnummer: "29125639036",
    tema: "SYK",
    sakstype: "Klage",
    mottatt: "2021-01-26",
    startet: null,
    avsluttet: null,
    frist: "2019-12-05",
    tildeltSaksbehandlerident: null,
    hjemler: [
      {
        kapittel: 8,
        paragraf: 14,
        ledd: null,
        bokstav: null,
        original: "8-14",
      },
    ],
    modified: "2021-01-26T22:09:35.041601",
    created: "2021-01-26T22:09:35.041607",
  });
});
app.get("/klagebehandlinger/:id/alledokumenter", async (req, res) => {
  let fs = require("fs");
  let path = require("path");
  const query = req.query;
  let forrigeSide = query.forrigeSide || undefined;
  let pageReference: string | null;
  let start: number;

  if (forrigeSide == "null") {
    pageReference = "side1";
    start = 0;
  } else if (forrigeSide == "side1") {
    pageReference = "side2";
    start = 10;
  } else if (forrigeSide == "side2") {
    pageReference = "side3";
    start = 20;
  } else if (forrigeSide == "side3") {
    pageReference = "side4";
    start = 30;
  } else {
    start = 40;
    pageReference = null;
  }

  let data = fs
    .readFileSync(path.resolve(__dirname, "../fixtures/dokumenter.json"))
    .toString("utf8");
  let dokumenter = JSON.parse(data);
  res.send({
    forrigeSide,
    dokumenter: dokumenter.dokumenter.slice(start, 10 + start),
    pageReference,
  });
});
app.get("/klagebehandlinger/:id/dokumenter", async (req, res) => {
  let fs = require("fs");
  let path = require("path");
  let data = fs
    .readFileSync(path.resolve(__dirname, "../fixtures/dokumenter.json"))
    .toString("utf8");
  let dokumenter = JSON.parse(data);
  res.send({
    dokumenter: dokumenter.dokumenter.slice(0, 5),
  });
});

app.get("/ansatte/:id/oppgaver", async (req, res) => {
  const result = await filtrerOppgaver({
    navIdent: req.params?.id,
    ...req.query,
  } as OppgaveQuery);
  res.send(result);
});

app.get("/ansatte/:id/klagebehandlinger", async (req, res) => {
  const result = await filtrerOppgaver({
    navIdent: req.params?.id,
    ...req.query,
  } as OppgaveQuery);
  res.send(result);
});

app.get(
  "/ansatte/:id/antallklagebehandlingermedutgaattefrister",
  async (req, res) => {
    const result = await filtrerOppgaver({
      navIdent: req.params?.id,
      ...req.query,
    } as OppgaveQuery);
    res.send(result);
  }
);

app.get("/ansatte/:id/enheter", async (req, res) => {
  res.send([
    {
      id: "4291",
      navn: "NAV Klageinstans Oslo og Akershus",
      lovligeTemaer: ["SYK", "PEN", "GOS", "DAG"],
    },
    { id: "0118", navn: "NAV Aremark", lovligeTemaer: ["PEN"] },
  ]);
});

app.get("/featuretoggle/:feature", (req, res) => {
  res.status(200).send("true");
});

app.post(
  "/ansatte/:id/klagebehandlinger/:oppgaveid/saksbehandlertildeling",
  async (req, res) => {
    const result = await tildelSaksbehandler({
      oppgaveId: req.params?.oppgaveid,
      navIdent: req.params?.id,
      oppgaveVersjon: req.body.oppgaveversjon,
    } as ISaksbehandler)
      .then((result) => res.status(200).send({ status: "OK" }))
      .catch((err) => res.status(err.status).send(err.body));
  }
);
app.post(
  "/ansatte/:id/klagebehandlinger/:oppgaveid/saksbehandlerfradeling",
  async (req, res) => {
    return await fradelSaksbehandler({
      oppgaveId: req.params?.oppgaveid,
      navIdent: req.params?.id,
      oppgaveVersjon: req.body.oppgaveversjon,
    } as ISaksbehandler)
      .then((result) => res.status(200).send({ status: "OK" }))
      .catch((err) => res.status(err.status).send(err.body));
  }
);

interface OppgaveModell {
  ident: String;
}

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
