import { App } from "@tinyhttp/app";
import { logger } from "@tinyhttp/logger";
import { cors } from "@tinyhttp/cors";
import {
  filtrerOppgaver,
  fradelSaksbehandler,
  ISaksbehandler,
  tildelSaksbehandler,
} from "./oppgaver";
import { OppgaveQuery } from "./types";

let bodyParser = require("body-parser");

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

async function hentDokumenter(offset: number) {
  const sqlite3 = require("sqlite3");
  let db = new sqlite3.Database("./oppgaver.db");
  let sql = `SELECT journalpostId, dokumentInfoId, tittel, tema, registrert, harTilgangTilArkivvariant, valgt FROM Dokumenter LIMIT ${offset},10`;

  let dokumenter = await new Promise((resolve, reject) => {
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

  let i = 0;
  for (; i < 10; i++) {
    // @ts-ignore
    dokumenter[i].vedlegg = await hentVedlegg();
  }

  return dokumenter;
}

async function hentVedlegg() {
  const sqlite3 = require("sqlite3");
  let db = new sqlite3.Database("./oppgaver.db");
  let limit = Math.floor(Math.random() * 4);
  let sql = `SELECT dokumentInfoId, tittel,harTilgangTilArkivvariant, valgt FROM Vedlegg ORDER BY RANDOM() LIMIT ${limit}`;

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
    id: "a6257f0d-c79c-4844-bfc6-a45ae6d6976f",
    klageInnsendtdato: "2020-08-11",
    fraNAVEnhet: "0104",
    fraNAVEnhetNavn: "NAV Moss",
    mottattFoersteinstans: "2020-08-14",
    sakenGjelderFoedselsnummer: "17457337760",
    sakenGjelderNavn: {
      fornavn: "Anders",
      mellomnavn: "Jørgen",
      etternavn: "Andersen",
    },
    sakenGjelderKjoenn: "MANN",
    sakenGjelderVirksomhetsnummer: null,
    foedselsnummer: "17457337760",
    virksomhetsnummer: null,
    tema: "43",
    type: "1",
    mottatt: "2021-04-26",
    startet: "2021-04-27",
    avsluttet: null,
    frist: null,
    tildeltSaksbehandlerident: "Z994488",
    medunderskriverident: null,
    hjemler: ["1000.008.004"],
    modified: "2021-04-27T08:56:30.679251",
    created: "2021-04-26T18:25:08.859951",
    fraSaksbehandlerident: "Z994674",
    eoes: null,
    raadfoertMedLege: null,
    internVurdering: null,
    sendTilbakemelding: null,
    tilbakemelding: null,
    klagebehandlingVersjon: 3,
    vedtak: [
      {
        id: "214d1485-5a26-4aec-86e4-19395fa54f87",
        utfall: "Opprettholdt",
        grunn: "Feil i bevisvurderingen",
        hjemler: [],
        brevMottakere: [],
      },
    ],
    kommentarFraFoersteinstans: null,
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

  let data = await hentDokumenter(start);
  res.send({
    forrigeSide,
    dokumenter: data,
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
      lovligeTemaer: ["43", "30", "56", "7"],
    },
    { id: "0118", navn: "NAV Aremark", lovligeTemaer: ["30"] },
  ]);
});

app.get("/featuretoggle/:feature", (req, res) => {
  if (req.params?.feature === "klage.generellTilgang")
    res.status(200).send("true");
  else res.status(200).send("false");
});

app.get("/aapenfeaturetoggle/:feature", (req, res) => {
  console.log(req.params?.feature);
  if (req.params?.feature === "klage.generellTilgang")
    res.status(200).send("true");
  else res.status(200).send("false");
});

app.post("/klagebehandlinger/:oppgaveid/dokumenter", async (req, res) => {
  res.status(200).send("OK");
});

app.post(
  "/ansatte/:id/klagebehandlinger/:oppgaveid/saksbehandlertildeling",
  async (req, res) => {
    const result = await tildelSaksbehandler({
      oppgaveId: req.params?.oppgaveid,
      navIdent: req.params?.id,
      klagebehandlingVersjon: req.body.klagebehandlingVersjon,
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
      klagebehandlingVersjon: req.body.klagebehandlingVersjon,
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
