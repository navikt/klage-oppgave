import { ActionsObservable, StateObservable } from "redux-observable";
import { TestScheduler } from "rxjs/testing";
import { marbles } from "rxjs-marbles/jest";
import { klagebehandlingEpos, hentKlageHandling, hentetKlageHandling } from "./klagebehandling";
import { ajax } from "rxjs/ajax";
import { of, throwError } from "rxjs";
import { AjaxCreationMethod } from "rxjs/internal-compatibility";
import {
  hentetInnstillingerHandling,
  hentInnstillingerEpos,
  hentInnstillingerHandling,
} from "./meg";

describe("Oppgave epos", () => {
  let ts: TestScheduler;
  const originalAjaxGet = ajax.get;

  const mockApi = jest.fn();

  beforeEach(() => {
    ts = new TestScheduler((actual, expected) => expect(actual).toEqual(expected));
  });

  afterEach(() => {
    ts.flush();
    ajax.get = originalAjaxGet;
  });

  /** Test henting av innstillinger */
  test(
    "+++ HENT KLAGE",
    marbles(() => {
      ts.run((m) => {
        const inputMarble = "a-";
        const expectedMarble = "c-";

        const inputValues = {
          a: hentKlageHandling("Kattulf"),
        };
        const initState = {
          klagebehandling: {
            navn: "",
          },
        };
        const mockedResponse = {
          navn: "Kattulf",
        };
        const reducerResponse = hentetKlageHandling(mockedResponse);

        const dependencies = {
          getJSON: (navIdent: string, enhetId: string) => {
            return of(mockedResponse);
          },
        };

        const observableValues = {
          a: initState,
          c: {
            payload: reducerResponse.payload,
            type: hentetKlageHandling.type,
          },
        };

        const action$ = new ActionsObservable(ts.createHotObservable(inputMarble, inputValues));
        const state$ = new StateObservable(m.hot("a", observableValues), initState);
        const actual$ = klagebehandlingEpos(action$, state$, <AjaxCreationMethod>dependencies);
        ts.expectObservable(actual$).toBe(expectedMarble, observableValues);
      });
    })
  );
});
