import { ActionsObservable, StateObservable } from "redux-observable";
import { TestScheduler } from "rxjs/testing";
import { marbles } from "rxjs-marbles/jest";
import { oppgaveTransformerRader, oppgaveTransformerEpos } from "./oppgave";

describe("Oppgave epos", () => {
  let ts: TestScheduler;

  beforeEach(() => {
    ts = new TestScheduler((actual, expected) => expect(actual).toEqual(expected));
  });

  afterEach(() => {
    ts.flush();
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
          a: oppgaveTransformerRader({
            sortering: {
              frist: "ASC",
            },
            filtrering: {
              ytelse: "SYK",
            },
          }),
        };
        const initState = {
          oppgaver: {
            rader: [
              { frist: "2019-09-12", ytelse: "SYK", hjemmel: "8-4" },
              { frist: "2020-12-15", ytelse: "FOR", hjemmel: "10-12" },
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
              ytelse: "SYK",
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

  test(
    "+++ FILTRER ETTER TYPE (KLAGE)",
    marbles(() => {
      ts.run((m) => {
        const inputMarble = "a-";
        const expectedMarble = "c-";

        const inputValues = {
          a: oppgaveTransformerRader({
            sortering: {
              frist: "ASC",
            },
            filtrering: {
              type: "KLAGE",
            },
          }),
        };
        const initState = {
          oppgaver: {
            rader: [
              { frist: "2019-09-12", type: "Klage", ytelse: "SYK", hjemmel: "8-4" },
              { frist: "2020-12-15", type: "klage", ytelse: "FOR", hjemmel: "10-12" },
              { frist: "2018-12-21", type: "anke", ytelse: "DAG", hjemmel: "mangler" },
            ],
          },
        };
        const resultPayload = {
          utsnitt: [
            { frist: "2019-09-12", type: "Klage", ytelse: "SYK", hjemmel: "8-4" },
            { frist: "2020-12-15", type: "klage", ytelse: "FOR", hjemmel: "10-12" },
          ],
          transformasjoner: {
            sortering: {
              frist: "ASC",
            },
            filtrering: {
              type: "KLAGE",
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

  test(
    "+++ FILTRER ETTER TYPE (KLAGE) VIS ALLE",
    marbles(() => {
      ts.run((m) => {
        const inputMarble = "a-";
        const expectedMarble = "c-";

        const inputValues = {
          a: oppgaveTransformerRader({
            sortering: {
              frist: "ASC",
            },
            filtrering: {
              type: undefined,
            },
          }),
        };
        const initState = {
          oppgaver: {
            rader: [
              { frist: "2018-12-21", type: "anke", ytelse: "DAG", hjemmel: "mangler" },
              { frist: "2019-09-12", type: "Klage", ytelse: "SYK", hjemmel: "8-4" },
              { frist: "2020-12-15", type: "klage", ytelse: "FOR", hjemmel: "10-12" },
            ],
          },
        };
        const resultPayload = {
          utsnitt: initState.oppgaver.rader,
          transformasjoner: {
            sortering: {
              frist: "ASC",
            },
            filtrering: {
              type: undefined,
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

  test(
    "+++ FILTRER ETTER HJEMMEL",
    marbles(() => {
      ts.run((m) => {
        const inputMarble = "a-";
        const expectedMarble = "c-";

        const inputValues = {
          a: oppgaveTransformerRader({
            sortering: {
              frist: "ASC",
            },
            filtrering: {
              hjemmel: "8-4",
            },
          }),
        };
        const initState = {
          oppgaver: {
            rader: [
              { frist: "2019-09-12", hjemmel: "8-4" },
              { frist: "2020-12-15", hjemmel: "10-12" },
              { frist: "2018-12-21", hjemmel: "mangler" },
            ],
            transformasjoner: {
              filtrering: {
                type: undefined,
                ytelse: undefined,
                hjemmel: undefined,
              },
              sortering: {
                frist: "ASC",
              },
            },
          },
        };
        const resultPayload = {
          utsnitt: [{ frist: "2019-09-12", hjemmel: "8-4" }],
          transformasjoner: {
            ...initState.oppgaver.transformasjoner,
            filtrering: {
              ...initState.oppgaver.transformasjoner.filtrering,
              hjemmel: "8-4",
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

  test(
    "+++ FILTRER ETTER HJEMMEL, VIS ALLE",
    marbles(() => {
      ts.run((m) => {
        const inputMarble = "a-";
        const expectedMarble = "c-";

        const inputValues = {
          a: oppgaveTransformerRader({
            sortering: {
              frist: "ASC",
            },
            filtrering: {
              hjemmel: undefined,
            },
          }),
        };
        const initState = {
          oppgaver: {
            rader: [
              { frist: "2018-12-21", hjemmel: "mangler" },
              { frist: "2019-09-12", hjemmel: "8-4" },
              { frist: "2020-12-15", hjemmel: "10-12" },
            ],
            transformasjoner: {
              filtrering: {
                hjemmel: undefined,
              },
              sortering: {
                frist: "ASC",
              },
            },
          },
        };
        const resultPayload = {
          utsnitt: [
            { frist: "2018-12-21", hjemmel: "mangler" },
            { frist: "2019-09-12", hjemmel: "8-4" },
            { frist: "2020-12-15", hjemmel: "10-12" },
          ],
          transformasjoner: initState.oppgaver.transformasjoner,
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

  /**
   * Tester sortering
   */
  test(
    "+++ SORTER ETTER FRIST - NYESTE FØRST (DESC)",
    marbles(() => {
      ts.run((m) => {
        const inputMarble = "a-";
        const expectedMarble = "c-";

        const inputValues = {
          a: oppgaveTransformerRader({
            sortering: {
              frist: "DESC",
            },
          }),
        };
        const initState = {
          oppgaver: {
            rader: [
              { frist: "2019-09-12", hjemmel: "8-4" },
              { frist: "2020-12-15", hjemmel: "10-12" },
              { frist: "2018-12-21", hjemmel: "mangler" },
            ],
          },
        };
        const resultPayload = {
          utsnitt: [
            { frist: "2020-12-15", hjemmel: "10-12" },
            { frist: "2019-09-12", hjemmel: "8-4" },
            { frist: "2018-12-21", hjemmel: "mangler" },
          ],
          transformasjoner: {
            sortering: {
              frist: "DESC",
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

  test(
    "+++ SORTER ETTER FRIST - ELDST FØRST (ASC)",
    marbles(() => {
      ts.run((m) => {
        const inputMarble = "a-";
        const expectedMarble = "c-";

        const inputValues = {
          a: oppgaveTransformerRader({
            sortering: {
              frist: "ASC",
            },
          }),
        };
        const initState = {
          oppgaver: {
            rader: [
              { frist: "2019-09-12", hjemmel: "8-4" },
              { frist: "2020-12-15", hjemmel: "10-12" },
              { frist: "2018-12-21", hjemmel: "mangler" },
            ],
          },
        };
        const resultPayload = {
          utsnitt: [
            { frist: "2018-12-21", hjemmel: "mangler" },
            { frist: "2019-09-12", hjemmel: "8-4" },
            { frist: "2020-12-15", hjemmel: "10-12" },
          ],
          transformasjoner: {
            sortering: {
              frist: "ASC",
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
