import { ActionsObservable, StateObservable } from "redux-observable";
import { TestScheduler } from "rxjs/testing";
import { marbles } from "rxjs-marbles/jest";
import { of, Subject, throwError } from "rxjs";
import {
  OppgaveRad,
  oppgaveRequest,
  oppgaveSorterFristStigende,
  oppgaveSorterFristStigendeEpos,
  oppgaveSorterFristSynkende,
  oppgaveSorterFristSynkendeEpos,
  oppgaveFiltrerHjemmel,
  oppgaveFiltrerHjemmelEpos,
} from "./oppgave";

describe("Oppgave Sortering epos", () => {
  let ts: TestScheduler;

  beforeEach(() => {
    ts = new TestScheduler((actual, expected) =>
      expect(actual).toEqual(expected)
    );
  });

  afterEach(() => {
    ts.flush();
  });

  test(
    "+++ SORTER ETTER SYNKENDE FRIST",
    marbles(() => {
      ts.run((m) => {
        const inputMarble = "a-";
        const expectedMarble = "c-";

        const inputValues = {
          a: oppgaveSorterFristSynkende(),
        };
        const initState = {
          oppgaver: {
            rader: [
              { frist: "2019-09-12" },
              { frist: "2020-12-15" },
              { frist: "2018-12-21" },
            ],
          },
        };
        const resultPayload = [
          { frist: "2018-12-21" },
          { frist: "2019-09-12" },
          { frist: "2020-12-15" },
        ];

        const observableValues = {
          a: initState,
          c: {
            payload: resultPayload,
            type: "oppgaver/OPPGAVER_UTSNITT",
          },
        };

        const action$ = new ActionsObservable(
          ts.createHotObservable(inputMarble, inputValues)
        );
        const state$ = new StateObservable(
          m.hot("a", observableValues),
          initState
        );
        const actual$ = oppgaveSorterFristSynkendeEpos(action$, state$);
        ts.expectObservable(actual$).toBe(expectedMarble, observableValues);

        //@ts-ignore
        expect(state$.value.oppgaver.rader).toStrictEqual(
          initState.oppgaver.rader
        );
      });
    })
  );

  test(
    "+++ SORTER ETTER STIGENDE FRIST",
    marbles(() => {
      ts.run((m) => {
        const inputMarble = "a-";
        const expectedMarble = "c-";

        const inputValues = {
          a: oppgaveSorterFristStigende(),
        };
        const initState = {
          oppgaver: {
            rader: [
              { frist: "2019-09-12" },
              { frist: "2020-12-15" },
              { frist: "2018-12-21" },
            ],
          },
        };
        const resultPayload = [
          { frist: "2020-12-15" },
          { frist: "2019-09-12" },
          { frist: "2018-12-21" },
        ];

        const observableValues = {
          a: initState,
          c: {
            payload: resultPayload,
            type: "oppgaver/OPPGAVER_UTSNITT",
          },
        };

        const action$ = new ActionsObservable(
          ts.createHotObservable(inputMarble, inputValues)
        );
        const state$ = new StateObservable(
          m.hot("a", observableValues),
          initState
        );
        const actual$ = oppgaveSorterFristStigendeEpos(action$, state$);
        ts.expectObservable(actual$).toBe(expectedMarble, observableValues);
        //@ts-ignore
        expect(state$.value.oppgaver.rader).toStrictEqual(
          initState.oppgaver.rader
        );
      });
    })
  );

  test(
    "+++ SORTER ETTER HJEMMEL",
    marbles(() => {
      ts.run((m) => {
        const inputMarble = "a-";
        const expectedMarble = "c-";

        const inputValues = {
          a: oppgaveFiltrerHjemmel("8-4"),
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
        const payload = [{ frist: "2019-09-12", hjemmel: "8-4" }];

        const observableValues = {
          a: initState,
          c: {
            payload: payload,
            type: "oppgaver/OPPGAVER_UTSNITT",
          },
        };

        const action$ = new ActionsObservable(
          ts.createHotObservable(inputMarble, inputValues)
        );
        const state$ = new StateObservable(
          m.hot("a", observableValues),
          initState
        );
        const actual$ = oppgaveFiltrerHjemmelEpos(action$, state$);
        ts.expectObservable(actual$).toBe(expectedMarble, observableValues);
        //@ts-ignore
        expect(state$.value.oppgaver.rader).toStrictEqual(
          initState.oppgaver.rader
        );
      });
    })
  );
});
