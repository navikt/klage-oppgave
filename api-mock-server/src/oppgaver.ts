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

function fullfortFiltrering(hasWhere: boolean, ferdigstiltFom: string) {
  if (ferdigstiltFom)
    return `${
      !hasWhere ? "WHERE" : " AND"
    } ferdigstiltFom >= date(${ferdigstiltFom})`;
  else return "";
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

export async function toggleDokument({
  id,
  dokumentInfoId,
  journalpostId,
}: {
  id: string;
  dokumentInfoId: string;
  journalpostId: string;
}) {
  let fetch_sql = `SELECT valgt from Dokumenter WHERE dokumentInfoId LIKE ?`;
  let params = [dokumentInfoId];
  let db = new sqlite3.Database(path.join(__dirname, "../oppgaver.db"));
  let erValgt = await new Promise((resolve, reject) =>
    db.all(fetch_sql, params, (err: any, rad: any) => {
      if (err) {
        console.log({ fetch_sql, params });
        reject(err);
      }
      resolve(rad[0].valgt);
    })
  );
  let endret_sql = `UPDATE Dokumenter set valgt = ? WHERE dokumentInfoId LIKE ?`;
  let nyValgt = erValgt === 1 ? 0 : 1;
  let params2 = [nyValgt, dokumentInfoId];
  await new Promise((resolve, reject) =>
    db.run(endret_sql, params2, (err: any) => {
      if (err) {
        console.log({ endret_sql, params });
        reject(err);
      }
      resolve("");
    })
  );
  db.close((err: { message: string }) => {
    if (err) {
      throw err.message;
    }
  });
  return `${erValgt} endret til ${nyValgt}`;
}

export async function toggleVedlegg({
  id,
  dokumentInfoId,
  journalpostId,
}: {
  id: string;
  dokumentInfoId: string;
  journalpostId: string;
}) {
  let fetch_sql = `SELECT valgt from Vedlegg WHERE dokumentInfoId LIKE ?`;
  let params = [dokumentInfoId];
  let db = new sqlite3.Database(path.join(__dirname, "../oppgaver.db"));
  let erValgt = await new Promise((resolve, reject) =>
    db.all(fetch_sql, params, (err: any, rad: any) => {
      if (err) {
        console.log({ fetch_sql, params });
        reject(err);
      }
      resolve(rad[0].valgt);
    })
  );
  let endret_sql = `UPDATE Vedlegg set valgt = ? WHERE dokumentInfoId LIKE ?`;
  let nyValgt = erValgt === 1 ? 0 : 1;
  let params2 = [nyValgt, dokumentInfoId];
  await new Promise((resolve, reject) =>
    db.run(endret_sql, params2, (err: any) => {
      if (err) {
        console.log({ endret_sql, params });
        reject(err);
      }
      resolve("");
    })
  );
  db.close((err: { message: string }) => {
    if (err) {
      throw err.message;
    }
  });
  return `${erValgt} endret til ${nyValgt}`;
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
    ferdigstiltFom,
  } = query;

  let filterTyper = typer?.split(",");
  let filterTemaer = temaer?.split(",");
  let filterHjemler = hjemler?.replace(/ og /, ",").split(",");
  let db = new sqlite3.Database(path.join(__dirname, "../oppgaver.db"));
  let params: any = [];
  let harTyper = "undefined" !== typeof typer;
  let harTemaer = "undefined" !== typeof temaer;
  let harHjemler = "undefined" !== typeof hjemler;

  let sql = `SELECT count(*) OVER() AS totaltAntall, Id as id, type, 
                 hjemmel, tema, frist, mottatt, saksbehandler, fnr, navn, klagebehandlingVersjon, avsluttetAvSaksbehandler, utfall, erMedunderskriver
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
                  ${
                    ferdigstiltFom
                      ? fullfortFiltrering(
                          harTyper ||
                            harTemaer ||
                            harHjemler ||
                            tildeltSaksbehandler !== "",
                          ferdigstiltFom
                        )
                      : ""
                  }
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
        reject(err);
      }

      if (ferdigstiltFom) {
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
            erMedunderskriver: rad.erMedunderskriver,
            avsluttetAvSaksbehandler: rad.avsluttetAvSaksbehandler,
            utfall: rad.utfall,
          }))
        );
      } else if ("undefined" === typeof tildeltSaksbehandler)
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
            erMedunderskriver: rad.erMedunderskriver,
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
            erMedunderskriver: rad.erMedunderskriver,
            avsluttetAvSaksbehandler: rad.avsluttetAvSaksbehandler,
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
