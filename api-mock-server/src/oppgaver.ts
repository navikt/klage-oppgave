import { OppgaveQuery } from "./types";

const sqlite3 = require("sqlite3");
const path = require("path");

interface Oppgave {
  frist: string;
  type: string;
  tema: string;
  hjemmel: string;
}

interface Oppgaver {
  antallTreffTotalt: number;
  klagebehandlinger: [Oppgave];
}

function generiskFilterSpoerring(
  where: boolean,
  filter: Array<string> | undefined,
  felt: string
) {
  if (filter && !where) {
    return `${filter?.map(
      (_, it) => `${it === 0 ? "WHERE" : " OR"} ${felt} LIKE ?`
    )}`;
  }
  if (filter) {
    return `${filter?.map(
      (_, it) => `${it === 0 ? "AND" : " OR"} ${felt} LIKE ?`
    )}`;
  }
  return "";
}

function saksbehandlerFiltrering(
  where: boolean,
  saksbehandler: string | undefined
) {
  if (!saksbehandler) {
    return `${!where ? "WHERE" : " AND"} saksbehandler != ?`;
  }
  return `${!where ? "WHERE" : " AND"} saksbehandler = ?`;
}

function typeQuery(filter: Array<string> | undefined) {
  if (filter) {
    return `${filter?.map(
      (_, it) => `${it === 0 ? "WHERE" : " OR"} type LIKE ?`
    )}`;
  }
  return "";
}

export interface ISaksbehandler {
  oppgaveId: string;
  navIdent: string;
  klagebehandlingVersjon: number;
}

export async function tildelSaksbehandler(params: ISaksbehandler) {
  let db = new sqlite3.Database(path.join(__dirname, "../oppgaver.db"));
  let sql =
    "UPDATE Oppgaver SET saksbehandler = ? WHERE Id = ? AND klagebehandlingVersjon = ?";
  return await new Promise((resolve, reject) => {
    db.all(
      sql,
      [params.navIdent, params.oppgaveId, params.klagebehandlingVersjon],
      (err: any, rader: any) => {
        if (err) {
          console.log(sql);
          console.log(params);
          reject(err);
        }
        resolve(rader);
      }
    );
  })
    .then((result) => ({
      status: 200,
      body: {
        result,
      },
    }))
    .catch((err) => ({
      status: 500,
      body: {
        err,
      },
    }));
}

export async function fradelSaksbehandler(params: ISaksbehandler) {
  let db = new sqlite3.Database(path.join(__dirname, "../oppgaver.db"));
  let sql =
    "UPDATE Oppgaver SET saksbehandler = '' WHERE Id = ? AND klagebehandlingVersjon = ?";
  return await new Promise((resolve, reject) => {
    db.all(
      sql,
      [params.oppgaveId, params.klagebehandlingVersjon],
      (err: any, rader: any) => {
        if (err) {
          console.log(sql);
          console.log(params);
          reject(err);
        }
        resolve(rader);
      }
    );
  })
    .then((result) => ({
      status: 200,
      body: {
        result,
      },
    }))
    .catch((err) => ({
      status: 500,
      body: {
        err,
      },
    }));
}

export async function filtrerOppgaver(query: OppgaveQuery) {
  const {
    typer,
    temaer,
    hjemler,
    antall,
    start,
    rekkefoelge,
    navIdent,
    tildeltSaksbehandler,
  } = query;
  console.log({
    typer,
    temaer,
    hjemler,
    antall,
    start,
    rekkefoelge,
    navIdent,
    tildeltSaksbehandler,
  });
  let filterTyper = typer?.split(",");
  let filterTemaer = temaer?.split(",");
  let filterHjemler = hjemler?.replace(/ og /, ",").split(",");
  let db = new sqlite3.Database(path.join(__dirname, "../oppgaver.db"));
  let params: any = [];
  let harTyper = "undefined" !== typeof typer;
  let harTemaer = "undefined" !== typeof temaer;
  let harHjemler = "undefined" !== typeof hjemler;

  let sql = `SELECT count(*) OVER() AS totaltAntall, Id as id, type, 
                 hjemmel, tema, frist, mottatt, saksbehandler, fnr, navn, klagebehandlingVersjon
                 FROM Oppgaver 
                 ${typeQuery(filterTyper).replace(/,/g, "")}
                 ${generiskFilterSpoerring(
                   harTyper,
                   filterTemaer,
                   "tema"
                 ).replace(/,/g, "")}
                  ${generiskFilterSpoerring(
                    harTyper || harTemaer,
                    filterHjemler,
                    "hjemmel"
                  ).replace(/,/g, "")}
                  ${saksbehandlerFiltrering(
                    harTyper || harTemaer || harHjemler,
                    tildeltSaksbehandler
                  )}
                 ORDER BY frist ${rekkefoelge === "STIGENDE" ? "ASC" : "DESC"}
                 LIMIT ?,? 
                 `;
  const oppgaver = await new Promise((resolve, reject) => {
    filterTyper?.forEach((filter: string) => {
      params.push(filter);
    });
    filterTemaer?.forEach((filter: string) => {
      params.push(filter);
    });
    filterHjemler?.forEach((filter: string) => {
      params.push(filter);
    });
    if (tildeltSaksbehandler) params.push(tildeltSaksbehandler);
    if (!tildeltSaksbehandler) params.push(navIdent);
    params = params.filter((f: any) => f !== undefined);
    params.push(start);
    params.push(antall);
    db.all(sql, params, (err: any, rader: any) => {
      if (err) {
        console.log(sql);
        console.log(params);
        reject(err);
      }
      if ("undefined" === typeof tildeltSaksbehandler)
        resolve(
          rader.map((rad: any) => ({
            totaltAntall: rad.totaltAntall ?? 0,
            id: rad.id,
            type: rad.type,
            hjemmel: rad.hjemmel,
            tema: rad.tema,
            frist: rad.frist,
            mottatt: rad.mottatt,
            klagebehandlingVersjon: rad.klagebehandlingVersjon,
          }))
        );
      else
        resolve(
          rader.map((rad: any) => ({
            totaltAntall: rad.totaltAntall ?? 0,
            id: rad.id,
            type: rad.type,
            hjemmel: rad.hjemmel,
            tema: rad.tema,
            frist: rad.frist,
            mottatt: rad.mottatt,
            person: { fnr: rad.fnr, navn: rad.navn },
            klagebehandlingVersjon: rad.klagebehandlingVersjon,
          }))
        );
    });
    db.close((err: { message: string }) => {
      if (err) {
        throw err.message;
      }
    });
  });

  let antallTreffTotalt = 0;
  try {
    antallTreffTotalt = (oppgaver as Oppgave)[0].totaltAntall;
  } catch (e) {
    console.error(e);
    console.log(sql);
    console.log(params);
  }

  return {
    antallTreffTotalt,
    klagebehandlinger: oppgaver,
  } as Oppgaver;
}
