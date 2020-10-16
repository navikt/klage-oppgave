import { ActionsObservable, StateObservable } from "redux-observable";
import { TestScheduler } from "rxjs/testing";
import { marbles } from "rxjs-marbles/jest";
import { of, Subject, throwError } from "rxjs";
import {
  OppgaveRad,
  oppgaveRequest,
  oppgaveSorterFristStigende,
  oppgaveSorterFristStigendeEpic,
  oppgaveSorterFristSynkende,
  oppgaveSorterFristSynkendeEpic,
} from "./oppgave";

describe("Oppgave Sortering epic", () => {
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
        const resultState = {
          oppgaver: {
            rader: [
              { frist: "2018-12-21" },
              { frist: "2019-09-12" },
              { frist: "2020-12-15" },
            ],
          },
        };

        const observableValues = {
          a: initState,
          c: {
            payload: resultState.oppgaver.rader,
            type: "oppgaver/OPPGAVER_MOTTATT",
          },
        };

        const action$ = new ActionsObservable(
          ts.createHotObservable(inputMarble, inputValues)
        );
        const state$ = new StateObservable(
          m.hot("a", observableValues),
          initState
        );
        const actual$ = oppgaveSorterFristSynkendeEpic(action$, state$);
        ts.expectObservable(actual$).toBe(expectedMarble, observableValues);
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
        const resultState = {
          oppgaver: {
            rader: [
              { frist: "2020-12-15" },
              { frist: "2019-09-12" },
              { frist: "2018-12-21" },
            ],
          },
        };

        const observableValues = {
          a: initState,
          c: {
            payload: resultState.oppgaver.rader,
            type: "oppgaver/OPPGAVER_MOTTATT",
          },
        };

        const action$ = new ActionsObservable(
          ts.createHotObservable(inputMarble, inputValues)
        );
        const state$ = new StateObservable(
          m.hot("a", observableValues),
          initState
        );
        const actual$ = oppgaveSorterFristStigendeEpic(action$, state$);
        ts.expectObservable(actual$).toBe(expectedMarble, observableValues);
      });
    })
  );
});
