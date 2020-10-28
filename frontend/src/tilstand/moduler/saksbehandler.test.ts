import { ActionsObservable, StateObservable } from "redux-observable";
import { TestScheduler } from "rxjs/testing";
import { marbles } from "rxjs-marbles/jest";
import { tildelMegHandling, tildelEpos, TildelType } from "./saksbehandler";
import { ajax } from "rxjs/ajax";
import { of } from "rxjs";
import { AjaxCreationMethod } from "rxjs/internal-compatibility";

describe("TILDEL 'Meg' epos", () => {
  let ts: TestScheduler;
  const originalAjaxPut = ajax.put;

  beforeEach(() => {
    ts = new TestScheduler((actual, expected) => expect(actual).toEqual(expected));
  });

  afterEach(() => {
    ts.flush();
    ajax.put = originalAjaxPut;
  });

  /**
   * Tester henting
   */
  test(
    "+++ TILDEL 'MEG' OPPGAVE",
    marbles(() => {
      ts.run((m) => {
        const inputMarble = "a-";
        const expectedMarble = "c-";

        const inputValues = {
          a: tildelMegHandling({ oppgaveId: 123456, ident: "ZAKSBEHANDLER" }),
        };
        const initState = {
          oppgaver: {
            rad: {},
          },
        };
        const resultPayload = {
          saksbehandler: {
            ident: "ZAKSBEHANDLER",
          },
          id: 123456,
        };
        const mockedResponse = {
          response: {
            id: 123456,
            saksbehandler: {
              ident: "ZAKSBEHANDLER",
            },
          },
        };
        const dependencies = {
          put: (url: string) => of(mockedResponse),
        };

        const observableValues = {
          a: initState,
          c: {
            payload: resultPayload,
            type: "saksbehandler/TILDELT",
          },
        };

        const action$ = new ActionsObservable(ts.createHotObservable(inputMarble, inputValues));
        const state$ = new StateObservable(m.hot("a", observableValues), initState);
        const actual$ = tildelEpos(action$, state$, <any>dependencies);
        ts.expectObservable(actual$).toBe(expectedMarble, observableValues);
      });
    })
  );
});
