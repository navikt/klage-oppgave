import fs from "fs";
import {OppgaveQuery} from "./types";
import R, {all, compose, curry, inc, includes, innerJoin, join, pipe, pluck, prop} from "ramda";
import _ from "lodash";

const {filter, complement, propSatisfies, lte, propEq, allPass, contains, equals, where, anyPass} = R;
const sqlite3 = require('sqlite3');
const path = require("path");

type Oppgaver = {
    antallTreffTotalt: number;
    oppgaver: [{
        frist: string;
        type: string;
        ytelse: string;
        hjemmel: string;
    }]
}

function ytelseQuery(where: boolean, filter: Array<string> | undefined) {
    if (!where) {
        return `${filter?.map((_, it) => `${it === 0 ? "WHERE" : "OR"} ytelse LIKE ?`)}`;
    }
    if (filter) {
        return `AND ytelse LIKE ${filter?.map(() => '?')}`
    }
    return "";
}

function typeQuery(filter: Array<string> | undefined) {
    if (filter) {
        return `WHERE type LIKE ${filter?.map(() => '?')}`
    }
    return "";
}


export async function filtrerOppgaver(query: OppgaveQuery) {
    const {typer, ytelser, hjemler, antall, start, rekkefoelge} = query;
    let filterTyper = typer?.split(",");
    let filterYtelser = ytelser?.split(",");
    let db = new sqlite3.Database(path.join(__dirname, '../oppgaver.db'));
    let sql = `SELECT Id, type, hjemmel, ytelse, frist 
                 FROM Oppgaver
                 ${typeQuery(filterTyper)}
                 ${ytelseQuery(typer?.length as unknown as boolean, filterYtelser).replace(","," ")}
                 LIMIT ?,?`;
    console.log(sql)

    const oppgaver = await new Promise((resolve, reject) => {
        let params: any = [];
        params.push(filterTyper?.reduce((a, b) => `${a},${b}`))
        filterYtelser?.forEach((filter: string) => {
            params.push(filter)
        })
        params = params.filter((f: any) => f !== undefined)
        params.push(start)
        params.push(antall)
        /*
                const _params = [
            filterTyper?.reduce((a,b)=>`${a},${b}`),
            filterYtelserArr(ytelser),
            start, antall].filter(f=>f !== undefined)

         */
        console.log(params)
        db.all(sql, params, (err: any, rad: any) => {
            if (err) {
                reject(err);
            }
            resolve(rad);
        });
        db.close((err: { message: string }) => {
            if (err) {
                throw(err.message);
            }
        });
    });
    return {
        antallTreffTotalt: (oppgaver as Array<any>).length,
        oppgaver
    } as Oppgaver;
}

/*
export function filtrerOppgaverRamda(query: OppgaveQuery) {
    const {typer, ytelser, hjemler, antall, start, rekkefoelge} = query;
    const buffer = fs.readFileSync("./fixtures/oppgaver.json");
    const antallTreffTotalt = JSON.parse(buffer.toString("utf8"))
        .antallTreffTotalt;
    let oppgaver = JSON.parse(buffer.toString("utf8")).oppgaver;

    if (rekkefoelge === "SYNKENDE")
        oppgaver = oppgaver.slice().sort(function (a: any, b: any) {
            return new Date(a.frist).getTime() - new Date(b.frist).getTime();
        });
    else
        oppgaver = oppgaver.slice().sort(function (a: any, b: any) {
            return new Date(b.frist).getTime() - new Date(a.frist).getTime();
        });

    let filtrerteOppgaver: any = [];
    oppgaver.forEach((o: any) => {
        if (typer) (
            typer?.split(",").every(t => {
                if (o.type === t.toLocaleLowerCase()) {
                    if (ytelser) {
                        ytelser?.split(",").every(t => {
                            if (o.ytelse === t)
                                if (hjemler) {
                                    hjemler?.split(",").every(t => {
                                        if (o.hjemmel === t)
                                            filtrerteOppgaver.push(o)
                                    })
                                } else {
                                    filtrerteOppgaver.push(o)

                                }
                        })
                    } else {
                        filtrerteOppgaver.push(o)

                    }
                }
            })
        )
    });
    if (!typer && !ytelser && !hjemler)
        filtrerteOppgaver = oppgaver;


    return {
        antallTreffTotalt,
        oppgaver: filtrerteOppgaver.slice(start, Number(start) + Number(antall)),
    };
}

 */