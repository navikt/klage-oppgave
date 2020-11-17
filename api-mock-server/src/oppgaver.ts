import { OppgaveQuery } from "./types";

const sqlite3 = require("sqlite3");
const path = require("path");

interface Oppgave {
  frist: string;
  type: string;
  ytelse: string;
  hjemmel: string;
}

interface Oppgaver {
  antallTreffTotalt: number;
  oppgaver: [Oppgave];
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
    return "";
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

export async function filtrerOppgaver(query: OppgaveQuery) {
  const {
    typer,
    ytelser,
    hjemler,
    antall,
    start,
    rekkefoelge,
    tildeltSaksbehandler,
  } = query;
  let filterTyper = typer?.split(",");
  let filterYtelser = ytelser?.split(",");
  let filterHjemler = hjemler?.replace(/ og /, ",").split(",");
  let db = new sqlite3.Database(path.join(__dirname, "../oppgaver.db"));
  let params: any = [];
  let harTyper = "undefined" !== typeof typer;
  let harYtelser = "undefined" !== typeof ytelser;
  let harHjemler = "undefined" !== typeof hjemler;

  let sql = `SELECT count(*) OVER() AS totaltAntall, Id as id, type, 
                 hjemmel, ytelse, frist, saksbehandler, fnr, navn
                 FROM Oppgaver 
                 ${typeQuery(filterTyper).replace(/,/g, "")}
                 ${generiskFilterSpoerring(
                   harTyper,
                   filterYtelser,
                   "ytelse"
                 ).replace(/,/g, "")}
                  ${generiskFilterSpoerring(
                    harTyper || harYtelser,
                    filterHjemler,
                    "hjemmel"
                  ).replace(/,/g, "")}
                  ${saksbehandlerFiltrering(
                    harTyper || harYtelser,
                    tildeltSaksbehandler
                  )}
                 ORDER BY frist ${rekkefoelge === "STIGENDE" ? "ASC" : "DESC"}
                 LIMIT ?,? 
                 `;

  const oppgaver = await new Promise((resolve, reject) => {
    filterTyper?.forEach((filter: string) => {
      params.push(filter);
    });
    filterYtelser?.forEach((filter: string) => {
      params.push(filter);
    });
    filterHjemler?.forEach((filter: string) => {
      params.push(filter);
    });
    if (tildeltSaksbehandler) params.push(tildeltSaksbehandler);
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
            totaltAntall: rad.totaltAntall,
            id: rad.id,
            type: rad.type,
            hjemmel: rad.hjemmel,
            ytelse: rad.ytelse,
            frist: rad.frist,
          }))
        );
      else
        resolve(
          rader.map((rad: any) => ({
            totaltAntall: rad.totaltAntall,
            id: rad.id,
            type: rad.type,
            hjemmel: rad.hjemmel,
            ytelse: rad.ytelse,
            frist: rad.frist,
            person: { fnr: rad.fnr, navn: rad.navn },
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
    oppgaver,
  } as Oppgaver;
}
