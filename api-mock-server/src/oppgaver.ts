import chalk from "chalk";
import fs from "fs";
import { OppgaveQuery } from "./types";
import R from "ramda";
const { filter, propSatisfies, lte, propEq, allPass } = R;

export function filtrerOppgaver(query: OppgaveQuery) {
  const { typer, ytelser, hjemler, antall, start, rekkefoelge } = query;
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
  oppgaver.forEach((oppgave: any) => {
    let predikater: R.Pred[] = [];

    const filterTyper =
      "undefined" !== typeof typer
        ? (typer as string).toLocaleLowerCase().split(",")
        : undefined;
    const filterYtelser =
      "undefined" !== typeof ytelser
        ? (ytelser as string).split(",")
        : undefined;
    const filterHjemler =
      "undefined" !== typeof hjemler
        ? (hjemler as string).split(",")
        : undefined;

    filterTyper?.forEach((t) => predikater.push(propEq("type", t)));
    filterYtelser?.forEach((t) => predikater.push(propEq("ytelse", t)));
    filterHjemler?.forEach((t) => predikater.push(propEq("hjemmel", t)));

    filtrerteOppgaver = filter(allPass(predikater), oppgaver);
  });

  return {
    antallTreffTotalt,
    oppgaver: filtrerteOppgaver.slice(start, Number(start) + Number(antall)),
  };
}
