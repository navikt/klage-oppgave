import { App } from "@tinyhttp/app";
import { logger } from "@tinyhttp/logger";
import { cors } from "@tinyhttp/cors";
let bodyParser = require("body-parser");

import {
  filtrerOppgaver,
  fradelSaksbehandler,
  ISaksbehandler,
  tildelSaksbehandler,
} from "./oppgaver";
import { OppgaveQuery } from "./types";

const app = new App()
  .use(cors({ origin: "*" }))
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

app.get("/kodeverk", (req, res) => {
  let data = require("fs")
    .readFileSync(
      require("path").resolve(__dirname, "../fixtures/kodeverk.json")
    )
    .toString("utf8");
  let kodeverk = JSON.parse(data);
  res.send(kodeverk);
});

app.get("/klagebehandlinger/:id/detaljer", async (req, res) => {
  res.send({
    id: "61db624d-88fb-4422-abdd-93f8e58f760f",
    klageInnsendtdato: "2021-02-01",
    fraNAVEnhet: "0104",
    mottattFoersteinstans: "2021-02-02",
    foedselsnummer: "27458422236",
    tema: "SYK",
    sakstype: "Klage",
    mottatt: "2021-03-25",
    startet: "2021-03-25",
    avsluttet: null,
    frist: "2021-08-02",
    tildeltSaksbehandlerident: "Z994488",
    hjemler: [
      {
        kapittel: 8,
        paragraf: 21,
        ledd: null,
        bokstav: null,
        original: "8-21",
      },
      {
        kapittel: 8,
        paragraf: 4,
        ledd: null,
        bokstav: null,
        original: "8-4",
      },
    ],
    modified: "2021-03-26T15:50:50.126524",
    created: "2021-03-25T14:48:38.131717",
    fraSaksbehandlerident: "Z994674",
    grunn: null,
    eoes: null,
    raadfoertMedLege: null,
    internVurdering: null,
    sendTilbakemelding: null,
    tilbakemelding: null,
    klagebehandlingVersjon: 5,
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

app.get(
  "/klagebehandlinger/:id/journalposter/:journalPostId/dokumenter/:dokumentId",
  (req, res) => {
    let path = require("path");
    res.sendFile(path.resolve(__dirname, "../fixtures/testdocument.pdf"));
  }
);

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

app.get("/aapenfeaturetoggle/:feature", (req, res) => {
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
app.listen(
  port,
  () => {
    /*tslint:disable*/
    console.log(`server started at http://localhost:${port}`);
  },
  "0.0.0.0"
);
