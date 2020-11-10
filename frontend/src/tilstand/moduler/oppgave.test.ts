import { ActionsObservable, StateObservable } from "redux-observable";
import { TestScheduler } from "rxjs/testing";
import { marbles } from "rxjs-marbles/jest";
import {
  oppgaveTransformerRader,
  buildQuery,
  hentOppgaverEpos,
  oppgaveRequest,
  MOTTATT,
  UTSNITT,
  RaderMedMetadata,
} from "./oppgave";
import { ajax } from "rxjs/ajax";
import { of } from "rxjs";
import { AjaxCreationMethod } from "rxjs/internal-compatibility";

describe("Oppgave epos", () => {
  let ts: TestScheduler;
  const originalAjaxGet = ajax.get;

  beforeEach(() => {
    ts = new TestScheduler((actual, expected) => expect(actual).toEqual(expected));
  });

  afterEach(() => {
    ts.flush();
    ajax.get = originalAjaxGet;
  });

  /**
   * Test queryBuilder
   */
  test("+++ QUERYBUILDER ytelse", () => {
    const inputValues = {
      ident: "ZATHRAS",
      antall: 2,
      start: 0,
      transformasjoner: {
        sortering: {
          frist: "synkende" as "synkende",
        },
        filtrering: {
          ytelse: ["Sykepenger", "Dagpenger"],
        },
      },
    };
    const url = buildQuery("/ansatte/ZATHRAS/ikketildelteoppgaver", inputValues);
    expect(url).toStrictEqual(
      "/ansatte/ZATHRAS/ikketildelteoppgaver?ytelse=Sykepenger%2CDagpenger&antall=2&start=0&rekkefoelge=SYNKENDE"
    );
  });

  test("+++ QUERYBUILDER type", () => {
    const inputValues = {
      ident: "ZATHRAS",
      antall: 2,
      start: 0,
      transformasjoner: {
        sortering: {
          frist: "synkende" as "synkende",
        },
        filtrering: {
          type: ["klage"],
          ytelse: ["Sykepenger", "Dagpenger"],
        },
      },
    };
    const url = buildQuery("/ansatte/ZATHRAS/ikketildelteoppgaver", inputValues);
    expect(url).toStrictEqual(
      "/ansatte/ZATHRAS/ikketildelteoppgaver?type=klage&ytelse=Sykepenger%2CDagpenger&antall=2&start=0&rekkefoelge=SYNKENDE"
    );
  });

  test("+++ QUERYBUILDER type", () => {
    const inputValues = {
      ident: "ZATHRAS",
      antall: 2,
      start: 0,
      transformasjoner: {
        sortering: {
          frist: "stigende" as "stigende",
        },
        filtrering: {
          type: ["klage"],
          ytelse: ["Sykepenger", "Dagpenger"],
          hjemmel: ["8-12", "9-31"],
        },
      },
    };
    const url = buildQuery("/ansatte/ZATHRAS/ikketildelteoppgaver", inputValues);
    expect(url).toStrictEqual(
      "/ansatte/ZATHRAS/ikketildelteoppgaver?type=klage&ytelse=Sykepenger%2CDagpenger&hjemmel=8-12%2C9-31&antall=2&start=0&rekkefoelge=STIGENDE"
    );
  });

  /**
   * Tester filtrering
   */

  test(
    "+++ FILTRER ETTER YTELSE",
    marbles(() => {
      ts.run((m) => {
        const inputMarble = "a-";
        const expectedMarble = "c-";

        const inputValues = {
          a: oppgaveRequest({
            ident: "ZATHRAS",
            antall: 2,
            start: 0,
            transformasjoner: {
              sortering: {
                frist: "synkende",
              },
              filtrering: {
                ytelse: ["Sykepenger"],
              },
            },
          }),
        };
        const mockedResponse = <RaderMedMetadata>{
          antallTreffTotalt: 2,
          oppgaver: [
            { frist: "2019-09-12", ytelse: "SYK", hjemmel: "8-4" },
            { frist: "2020-11-15", ytelse: "SYK", hjemmel: "10-12" },
          ],
        };

        const dependencies = {
          getJSON: (url: string) => of(mockedResponse),
        };

        const initState = {
          oppgaver: {
            rader: [
              { frist: "2019-09-12", ytelse: "SYK", hjemmel: "8-4" },
              { frist: "2020-11-15", ytelse: "SYK", hjemmel: "10-12" },
              { frist: "2018-12-21", ytelse: "FOR", hjemmel: "9-11" },
              { frist: "2019-11-13", ytelse: "SYK", hjemmel: "10-1" },
              { frist: "2018-12-21", ytelse: "DAG", hjemmel: "mangler" },
            ],
          },
        };
        const resultPayload = MOTTATT(mockedResponse);

        const observableValues = {
          a: initState,
          c: {
            payload: resultPayload.payload,
            type: "oppgaver/MOTTATT",
          },
        };

        const action$ = new ActionsObservable(ts.createHotObservable(inputMarble, inputValues));
        const state$ = new StateObservable(m.hot("a", observableValues), initState);
        const actual$ = hentOppgaverEpos(action$, state$, <AjaxCreationMethod>dependencies);
        ts.expectObservable(actual$).toBe(expectedMarble, observableValues);
      });
    })
  );
});
