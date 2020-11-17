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

function typeQuery(filter: Array<string> | undefined) {
  if (filter) {
    return `${filter?.map(
      (_, it) => `${it === 0 ? "WHERE" : " OR"} type LIKE ?`
    )}`;
  }
  return "";
}

export async function filtrerOppgaver(query: OppgaveQuery) {
  const { typer, ytelser, hjemler, antall, start, rekkefoelge } = query;
  let filterTyper = typer?.split(",");
  let filterYtelser = ytelser?.split(",");
  let filterHjemler = hjemler?.replace(/ og /, ",").split(",");
  let db = new sqlite3.Database(path.join(__dirname, "../oppgaver.db"));
  let params: any = [];

  let sql = `SELECT count(*) OVER() AS totaltAntall, Id as id, type, hjemmel, ytelse, frist
                 FROM Oppgaver 
                 ${typeQuery(filterTyper).replace(/,/g, "")}
                 ${generiskFilterSpoerring(
                   (typer?.length as unknown) as boolean,
                   filterYtelser,
                   "ytelse"
                 ).replace(/,/g, "")}
                 ${generiskFilterSpoerring(
                   ((typer?.length as unknown) as boolean) ||
                     ((ytelser?.length as unknown) as boolean),
                   filterHjemler,
                   "hjemmel"
                 ).replace(/,/g, "")}
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
    params = params.filter((f: any) => f !== undefined);
    params.push(start);
    params.push(antall);
    db.all(sql, params, (err: any, rad: any) => {
      if (err) {
        console.log(sql);
        console.log(params);
        reject(err);
      }
      resolve(rad);
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
