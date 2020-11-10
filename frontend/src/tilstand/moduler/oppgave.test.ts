import { ActionsObservable, StateObservable } from "redux-observable";
import { TestScheduler } from "rxjs/testing";
import { marbles } from "rxjs-marbles/jest";
import { oppgaveTransformerRader, oppgaveTransformerEpos, buildQuery } from "./oppgave";

describe("Oppgave epos", () => {
  let ts: TestScheduler;

  beforeEach(() => {
    ts = new TestScheduler((actual, expected) => expect(actual).toEqual(expected));
  });

  afterEach(() => {
    ts.flush();
  });

  /**
   * Test queryBuilder
   */
  test("+++ QUERYBUILDER", () => {
    const inputValues = {
      ident: "ZATHRAS",
      antall: 2,
      start: 0,
      transformasjoner: {
        sortering: {
          frist: "ASC" as "ASC",
        },
        filtrering: {
          ytelse: ["Sykepenger"],
        },
      },
    };
    const url = buildQuery("/ansatte", inputValues);
    expect(url).toStrictEqual(
      "/ansatte/ZATHRAS/ikketildelteoppgaver?type=klage&ytelse=helse&hjemmel=8-1&order=asc&pagesize=10&offset=10"
    );
  });

  /**
   * Tester filtrering
   */

  xtest(
    "+++ FILTRER ETTER YTELSE",
    marbles(() => {
      ts.run((m) => {
        const inputMarble = "a-";
        const expectedMarble = "c-";

        const inputValues = {
          a: oppgaveTransformerRader({
            ident: "ZATHRAS",
            limit: 2,
            offset: 0,
            transformasjoner: {
              sortering: {
                frist: "ASC",
              },
              filtrering: {
                ytelse: ["Sykepenger"],
              },
            },
          }),
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
        const resultPayload = {
          utsnitt: [{ frist: "2019-09-12", ytelse: "SYK", hjemmel: "8-4" }],
          transformasjoner: {
            sortering: {
              frist: "ASC",
            },
            filtrering: {
              ytelse: ["Sykepenger"],
            },
          },
        };

        const observableValues = {
          a: initState,
          c: {
            payload: resultPayload,
            type: "oppgaver/UTSNITT",
          },
        };

        const action$ = new ActionsObservable(ts.createHotObservable(inputMarble, inputValues));
        const state$ = new StateObservable(m.hot("a", observableValues), initState);
        const actual$ = oppgaveTransformerEpos(action$, state$);
        ts.expectObservable(actual$).toBe(expectedMarble, observableValues);
        //@ts-ignore
        expect(state$.value.oppgaver.rader).toStrictEqual(initState.oppgaver.rader);
      });
    })
  );
});
