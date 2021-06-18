import { ActionsObservable, StateObservable } from "redux-observable";
import { TestScheduler } from "rxjs/testing";
import { marbles } from "rxjs-marbles/jest";
import megTilstand, {
  feiletHandling,
  hentetEnhetHandling,
  hentetHandling,
  hentetInnstillingerHandling,
  hentInnstillingerEpos,
  hentInnstillingerHandling,
  hentMegEpos,
  hentMegHandling,
  IInnstillinger,
} from "./meg";
import { ajax } from "rxjs/ajax";
import { of, throwError } from "rxjs";
import { oppgaveHentingFeilet } from "./oppgave";
import { initierToaster } from "./toaster/toaster";
import { Dependencies } from "../konfigurerTilstand";

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
        const expectedMarble = "(cd)-";

        const inputValues = {
          a: hentMegHandling(),
        };
        const initState = {
          meg: {
            id: "",
            navn: "",
            fornavn: "",
            mail: "",
            etternavn: "",
            valgtEnhet: 0,
            lovligeTemaer: undefined,
            enheter: [],
            innstillinger: undefined,
          },
        };
        const mockedResponse = {
          displayName: "Rboert dEniro",
          givenName: "rBot",
          onPremisesSamAccountName: "Z994488",
          mail: "rbo@de.ninro",
          surname: "dENiro",
        };
        const reducerResponse = hentetHandling({
          fornavn: mockedResponse.givenName,
          id: mockedResponse.onPremisesSamAccountName,
          etternavn: mockedResponse.surname,
          navn: mockedResponse.displayName,
          mail: mockedResponse.mail,
          enheter: [
            {
              id: "42",
              navn: "test",
              lovligeTemaer: [{ label: "test", value: "5" }],
            },
          ],
        });

        const enhetResponse = hentetEnhetHandling([
          {
            navn: "test",
            id: "42",
            lovligeTemaer: [{ label: "test", value: "5" }],
          },
        ]);

        const dependencies = {
          ajax: {
            getJSON: (url: string) => {
              if (url.endsWith("enheter")) {
                return of([
                  {
                    navn: "test",
                    id: "42",
                    lovligeTemaer: [{ label: "test", value: "5" }],
                  },
                ]);
              } else {
                return of(mockedResponse);
              }
            },
          },
        };

        const observableValues = {
          a: initState,
          c: {
            payload: enhetResponse.payload,
            type: hentetEnhetHandling.type,
          },
          d: {
            payload: reducerResponse.payload,
            type: hentetHandling.type,
          },
        };

        const action$ = new ActionsObservable(ts.createHotObservable(inputMarble, inputValues));
        const state$ = new StateObservable(m.hot("a", observableValues), initState);
        const actual$ = hentMegEpos(action$, state$, <Dependencies>dependencies);
        ts.expectObservable(actual$).toBe(expectedMarble, observableValues);
      });
    })
  );

  /** Test henting av innstillinger */
  test(
    "+++ HENT 'INNSTILLINGER'",
    marbles(() => {
      ts.run((m) => {
        const inputMarble = "a-";
        const expectedMarble = "c-";

        const inputValues = {
          a: hentInnstillingerHandling({ navIdent: "en_navIdent", enhetId: "42" }),
        };
        const initState = {
          meg: {
            innstillinger: undefined,
          },
        };
        const mockedResponse: IInnstillinger = {
          aktiveHjemler: [{ value: "8-1", label: "8-1" }],
          aktiveTemaer: [{ value: "43", label: "Sykepenger" }],
          aktiveTyper: [{ value: "test-enhet", label: "42" }],
          aktiveFaner: { dokumenter: { checked: true } },
        };
        const reducerResponse = hentetInnstillingerHandling(mockedResponse);

        const dependencies = {
          ajax: {
            getJSON: (navIdent: string, enhetId: string) => {
              return of(mockedResponse);
            },
          },
        };

        const observableValues = {
          a: initState,
          c: {
            payload: reducerResponse.payload,
            type: hentetInnstillingerHandling.type,
          },
        };

        const action$ = new ActionsObservable(ts.createHotObservable(inputMarble, inputValues));
        const state$ = new StateObservable(m.hot("a", observableValues), initState);
        const actual$ = hentInnstillingerEpos(action$, state$, <Dependencies>dependencies);
        ts.expectObservable(actual$).toBe(expectedMarble, observableValues);
      });
    })
  );

  it("test meg slice suksess", () => {
    expect(
      megTilstand(
        {
          id: "",
          navn: "",
          fornavn: "",
          mail: "",
          etternavn: "",
          valgtEnhet: 0,
          enheter: [
            {
              id: "",
              navn: "",
              lovligeTemaer: [{ label: "", value: "" }],
            },
          ],
        },
        {
          type: hentetHandling.type,
          payload: {
            id: "1",
            navn: "Robert Hansen",
            fornavn: "Robert",
            mail: "rob@han.no",
            etternavn: "Hansen",
          },
        }
      )
    ).toEqual({
      id: "1",
      navn: "Robert Hansen",
      fornavn: "Robert",
      mail: "rob@han.no",
      etternavn: "Hansen",
      valgtEnhet: 0,
      enheter: undefined,
    });
  });

  test(
    "+++ HENT 'MEG' RETRY 3 ganger og så returner FEIL",
    marbles(() => {
      ts.run(({ hot, cold, expectObservable, expectSubscriptions }) => {
        const inputValues = {
          a: hentMegHandling(),
        };
        const action$ = new ActionsObservable(hot("-a", inputValues));

        const dependencies = {
          ajax: {
            getJSON: (url: string) => of({}),
          },
        };

        const observableValues = {
          a: {},
          t: {
            payload: "ukjent feil",
            type: feiletHandling.type,
          },
          s: {
            payload: undefined,
            type: oppgaveHentingFeilet.type,
          },
          x: {
            payload: {
              type: "feil",
              beskrivelse: "ukjent feil",
            },
            type: initierToaster.type,
          },
        };

        const state$ = new StateObservable(hot("-a", observableValues), {});
        spyOn(dependencies.ajax, "getJSON").and.returnValue(
          throwError({ message: "ukjent feil", status: 503 })
        );
        expectObservable(hentMegEpos(action$, state$, <Dependencies>dependencies)).toBe(
          "12001ms (tsxy)",
          observableValues
        );
      });
    })
  );
});
