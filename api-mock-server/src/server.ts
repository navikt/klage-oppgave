import { App } from "@tinyhttp/app";
import { logger } from "@tinyhttp/logger";
import { cors } from "@tinyhttp/cors";
import formidable, { File } from "formidable";
import { filtrerOppgaver, toggleDokument, toggleVedlegg } from "./oppgaver";
import { OppgaveQuery } from "./types";
import fs from "fs";
import path from "path";
import { klagebehandlingDetaljerView } from "./klagebehandlingDetaljerView";

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
    .readFileSync(path.resolve(__dirname, "../fixtures/kodeverk.json"))
    .toString("utf8");
  let kodeverk = JSON.parse(data);
  res.send(kodeverk);
});
app.post("/ansatte/:navIdent/klagebehandlinger/personsoek", (req, res) => {
  let navIdent = req.params?.navIdent;
  let { fnr, start, antall } = req.body;
  let data = require("fs")
    .readFileSync(path.resolve(__dirname, "../fixtures/personsok.json"))
    .toString("utf8");
  console.log({ fnr, start, antall, navIdent });
  res.send(data);
});

app.get("/klagebehandlinger/:id/detaljer", async (req, res) =>
  res.send(klagebehandlingDetaljerView)
);

app.get("/klagebehandlinger/:id/alledokumenter", async (req, res) => {
  const query = req.query;
  const forrigeSide =
    typeof query.forrigeSide === "string" ? query.forrigeSide : "";
  let pageReference: string | null;
  let start: number;

  switch (forrigeSide) {
    case "":
      pageReference = "side1";
      start = 0;
      break;
    case "side1":
      pageReference = "side2";
      start = 10;
      break;
    case "side2":
      pageReference = "side3";
      start = 20;
      break;
    case "side3":
      pageReference = "side4";
      start = 30;
      break;
    default:
      start = 40;
      pageReference = null;
      break;
  }

  const dokumenter = await hentDokumenter(start);
  res.json({
    dokumenter,
    pageReference,
  });
});

app.get("/klagebehandlinger/:id/dokumenter", async (req, res) => {
  const data = fs.readFileSync(
    path.resolve(__dirname, "../fixtures/dokumenter.json"),
    { encoding: "utf-8" }
  );
  const dokumenter = JSON.parse(data);
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

app.post("/internal/elasticadmin/rebuild", async (req, res) => {
  let random = Math.floor(Math.random() * 2);
  if (random === 0) return res.status(403).send("");
  else return res.status(200).send("");
});

app.post(
  "/klagebehandlinger/:behandlingsid/toggledokument",
  async (req, res) => {
    let id = req.params?.behandlingsid;
    let { dokumentInfoId, journalpostId, erVedlegg } = req.body;
    if (!id || !dokumentInfoId || !journalpostId || erVedlegg === undefined) {
      return res
        .status(400)
        .send(
          `mangler data (${id}, ${dokumentInfoId}, ${journalpostId}, ${erVedlegg})`
        );
    }
    let result;
    if (id) {
      result = (await erVedlegg)
        ? toggleVedlegg({ id, dokumentInfoId, journalpostId })
        : toggleDokument({ id, dokumentInfoId, journalpostId });
      return res.status(200).send(result);
    } else return res.status(403).send("");
  }
);

app.get(
  "/ansatte/:id/antallklagebehandlingermedutgaattefrister",
  async (req, res) => {
    res.send([]);
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
  else if (req.params?.feature === "klage.admin") res.status(200).send("true");
  else res.status(200).send("false");
});

app.get("/aapenfeaturetoggle/:feature", (req, res) => {
  console.log(req.params?.feature);
  if (req.params?.feature === "klage.generellTilgang")
    res.status(200).send("true");
  else res.status(200).send("false");
});

// Slette vedtak.
app.delete(
  "/klagebehandlinger/:klagebehandlingId/vedtak/:vedtakId/vedlegg",
  async (req, res) => {
    await sleep(1000);
    res.sendStatus(200);
  }
);

// Opplasting av vedtak.
app.post(
  "/klagebehandlinger/:klagebehandlingId/vedtak/:vedtakId/vedlegg",
  async (req, res, next) => {
    const form = formidable({
      multiples: true,
      allowEmptyFiles: true,
      keepExtensions: true,
      maxFields: 3,
    });
    // @ts-ignore
    form.parse(req, async (err, fields, files) => {
      if (typeof err !== "undefined" && err !== null) {
        console.error("Upload error", err);
        if (next) {
          next(err);
        }
        return;
      }

      let vedlegg: File | null = null;

      if (Array.isArray(files.vedlegg)) {
        if (files.vedlegg.length !== 1) {
          res
            .status(400)
            .send(`Too many files uploaded. ${files.vedlegg.length}`);
          return;
        }
        vedlegg = files.vedlegg[0];
      } else {
        vedlegg = files.vedlegg;
      }

      if (!vedlegg.name?.endsWith(".pdf") ?? false) {
        res.status(400).send(`Wrong file extension. ${vedlegg.name}`);
        return;
      }

      const { journalfoerendeEnhet, klagebehandlingVersjon } = fields;

      if (
        typeof journalfoerendeEnhet === "undefined" ||
        journalfoerendeEnhet.length === 0
      ) {
        res.status(400).send("Missing journalfoerendeEnhet.");
        return;
      }

      if (
        typeof klagebehandlingVersjon === "undefined" ||
        klagebehandlingVersjon.length === 0
      ) {
        res.status(400).send("Missing klagebehandlingVersjon.");
        return;
      }

      await sleep(1000);

      res.status(200).json({
        id: "UUID",
        modified: new Date().toISOString(),
        klagebehandlingVersjon: 0,
        file: {
          name: vedlegg.name,
          size: vedlegg.size,
          opplastet: new Date().toISOString(),
        },
      });
    });
  }
);

app.post("/klagebehandlinger/:oppgaveid/dokumenter", async (req, res) => {
  res.status(200).send("OK");
});

app.post(
  "/klagebehandlinger/:klagebehandlingid/vedtak/:vedtakid/vedlegg",
  async (req, res) => {
    res.status(200).send("OK");
  }
);

app.put(
  "/klagebehandlinger/:klagebehandlingid/detaljer/editerbare",
  async (req, res) => {
    res.status(200).json({
      ...klagebehandlingDetaljerView,
      klagebehandlingVersjon: req.body.klagebehandlingVersjon,
      internVurdering: req.body.internVurdering,
      tilknyttedeDokumenter: req.body.tilknyttedeDokumenter,
      vedtak: [
        {
          ...klagebehandlingDetaljerView.vedtak[0],
          utfall: req.body.utfall,
          grunn: req.body.grunn,
          hjemler: req.body.hjemler,
        },
      ],
    });
  }
);

app.post(
  "/klagebehandlinger/:klagebehandlingid/vedtak/:vedtakid/fullfoer",
  async (req, res) => {
    await sleep(500);
    const { journalfoerendeEnhet, klagebehandlingVersjon } = req.body;
    if (
      typeof journalfoerendeEnhet !== "string" ||
      journalfoerendeEnhet.length === 0
    ) {
      res.sendStatus(400);
      return;
    }
    if (typeof klagebehandlingVersjon !== "number") {
      res.sendStatus(400);
      return;
    }
    res.json({
      ...klagebehandlingDetaljerView,
      avsluttetAvSaksbehandler: "2021-05-17T15:00:59",
    });
  }
);

app.get("/ansatte/:id/medunderskrivere/:tema", (req, res) =>
  delay(
    () =>
      res.json({
        tema: req.params?.tema ?? "UKJENT_TEMA",
        medunderskrivere: [
          {
            navn: "Ingrid Oksavik",
            ident: "123",
          },
          {
            navn: "Saksbehandler A",
            ident: "a",
          },
          {
            navn: "Saksbehandler B",
            ident: "b",
          },
          {
            navn: "Saksbehandler C",
            ident: "c",
          },
        ],
      }),
    500
  )
);

app.put("/klagebehandlinger/:id/detaljer/medunderskriverident", (req, res) =>
  delay(
    () =>
      res.json({
        medunderskriverident: req.body.medunderskriverident,
      }),
    500
  )
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

const delay = async (fn: () => void, ms: number) => {
  await sleep(ms);
  return fn();
};

const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));
