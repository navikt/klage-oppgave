import express from "express";
import cors from "cors";
import * as fs from "fs";
import bodyParser from "body-parser";
import { eqNumber } from "fp-ts/lib/Eq";
import JSONStream from "jsonstream";
import es from "event-stream";
import chalk from "chalk";
import { filtrerOppgaver } from "./oppgaver";
import { OppgaveQuery } from "./types";

const app = express();
app.use(cors());
app.use(bodyParser.json());
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

app.get("/ansatte/:id/oppgaver", async (req, res) => {
  const result = await filtrerOppgaver((req.query as unknown) as OppgaveQuery);
  res.send(result);
});

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
