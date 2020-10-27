import { ActionsObservable, StateObservable } from "redux-observable";
import { TestScheduler } from "rxjs/testing";
import { marbles } from "rxjs-marbles/jest";
import { hentMegEpos, hentMegHandling, MegType } from "./meg";
import { ajax } from "rxjs/ajax";
import { of } from "rxjs";
import { AjaxCreationMethod } from "rxjs/internal-compatibility";
describe("'Meg' epos", () => {
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
   * Tester henting
   */
  test(
    "+++ HENT 'MEG'",
    marbles(() => {
      ts.run((m) => {
        const inputMarble = "a-";
        const expectedMarble = "c-";

        const inputValues = {
          a: hentMegHandling(),
        };
        const initState = {
          oppgaver: {
            meg: {},
          },
        };
        const resultPayload = {
          navn: "Rboert dEniro",
          fornavn: "rBot",
          mail: "rbo@de.ninro",
          etternavn: "dENiro",
          id: "Z994488",
        };
        const mockedResponse = {
          displayName: "Rboert dEniro",
          givenName: "rBot",
          onPremisesSamAccountName: "Z994488",
          mail: "rbo@de.ninro",
          surname: "dENiro",
        };
        const dependencies = {
          getJSON: (url: string) => of(mockedResponse),
        };

        const observableValues = {
          a: initState,
          c: {
            payload: resultPayload,
            type: "meg/HENTET",
          },
        };

        const action$ = new ActionsObservable(ts.createHotObservable(inputMarble, inputValues));
        const state$ = new StateObservable(m.hot("a", observableValues), initState);
        const actual$ = hentMegEpos(action$, state$, <AjaxCreationMethod>dependencies);
        ts.expectObservable(actual$).toBe(expectedMarble, observableValues);
      });
    })
  );
});
