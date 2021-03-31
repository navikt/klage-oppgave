import { ActionsObservable, StateObservable } from "redux-observable";
import { TestScheduler } from "rxjs/testing";
import { marbles } from "rxjs-marbles/jest";
import { klagebehandlingEpos, hentKlageHandling, hentetKlageHandling } from "./klagebehandling";
import { ajax } from "rxjs/ajax";
import { of, throwError } from "rxjs";
import { AjaxCreationMethod } from "rxjs/internal-compatibility";

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

  /** Test henting av klageoppgave */
  test(
    "+++ HENT KLAGE",
    marbles(() => {
      ts.run((m) => {
        const inputMarble = "a-";
        const expectedMarble = "c-";

        const inputValues = {
          a: hentKlageHandling("123"),
        };
        const initState = {
          klagebehandling: {
            id: "123",
          },
        };
        const mockedResponse = {
          id: "64848",
          fraNAVEnhet: "4416",
          mottattFoersteinstans: "2019-08-22",
          foedselsnummer: "29125639036",
          tema: "SYK",
          sakstype: "Klage",
          mottatt: "2021-01-26",
          frist: "2019-12-05",
          pageReference: "id...",
          pageRefs: [],
          historyNavigate: false,
          hasMore: true,
          currentPDF: "",
          klageLastingFeilet: false,
          lasterDokumenter: false,
          klageLastet: false,
          dokumenterAlleHentet: false,
          dokumenterTilordnedeHentet: false,
          pageIdx: 0,
          hjemler: [{ kapittel: 8, paragraf: 14, original: "8-14" }],
        };
        const reducerResponse = hentetKlageHandling(mockedResponse);

        const dependencies = {
          getJSON: (id: string) => {
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
