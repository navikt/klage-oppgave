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

const app = new App().use(logger()).use(bodyParser.json());
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
  res.sendFile(
    require("path").resolve(__dirname, "../fixtures/dokumenter.json")
  );
});

app.get("/ansatte/:id/oppgaver", async (req, res) => {
  const result = await filtrerOppgaver({
    navIdent: req.params?.id,
    ...req.query,
  } as OppgaveQuery);
  res.send(result);
});

app.get("/ansatte/:id/enheter", async (req, res) => {
  res.send([
    {
      navn: "test-enhet",
      id: "42",
      lovligeTemaer: ["Foreldrepenger"],
    },
    {
      navn: "test-enhet 2",
      id: "43",
      lovligeTemaer: ["Sykepenger"],
    },
  ]);
});

app.get("/featuretoggle/:feature", (req, res) => {
  res.status(200).send("true");
});

app.post(
  "/ansatte/:id/oppgaver/:oppgaveid/saksbehandlertildeling",
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
  "/ansatte/:id/oppgaver/:oppgaveid/saksbehandlerfradeling",
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
