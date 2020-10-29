import { ActionsObservable, StateObservable } from "redux-observable";
import { TestScheduler } from "rxjs/testing";
import { marbles } from "rxjs-marbles/jest";
import { ajax } from "rxjs/ajax";
import { of } from "rxjs";
import { hentMineSakerEpos, hentMineSakerHandling } from "./mine_saker";
import { AjaxCreationMethod } from "rxjs/internal-compatibility";

describe("Mine Saker epos", () => {
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
    "+++ HENT MINE SAKER",
    marbles(() => {
      ts.run((m) => {
        const inputMarble = "a-";
        const expectedMarble = "c-";

        const saksbehandlerId = "ZAK";
        const inputValues = {
          a: hentMineSakerHandling(saksbehandlerId),
        };
        const initState = {
          oppgaver: {
            rad: {},
          },
        };

        const mockedResponse = [
          {
            id: 12345,
            bruker: {
              fnr: "",
              navn: "",
            },
            type: "",
            ytelse: "",
            hjemmel: "",
            frist: "",
            saksbehandler: "ZAK",
          },
        ];

        const dependencies = {
          getJSON: (url: string) => of(mockedResponse),
        };

        const observableValues = {
          a: initState,
          c: {
            payload: mockedResponse,
            type: "mineSaker/MOTTATT",
          },
        };

        const action$ = new ActionsObservable(ts.createHotObservable(inputMarble, inputValues));
        const state$ = new StateObservable(m.hot("a", observableValues), initState);
        const actual$ = hentMineSakerEpos(action$, state$, <AjaxCreationMethod>dependencies);
        ts.expectObservable(actual$).toBe(expectedMarble, observableValues);
      });
    })
  );
});
