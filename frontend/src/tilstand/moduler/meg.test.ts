import { ActionsObservable, StateObservable } from "redux-observable";
import { TestScheduler } from "rxjs/testing";
import { marbles } from "rxjs-marbles/jest";
import megTilstand, {
  feiletHandling,
  hentetMegHandling,
  hentetInnstillingerHandling,
  hentetUtenEnheterHandling,
  hentInnstillingerEpos,
  hentInnstillingerHandling,
  hentMegEpos,
  hentMegHandling,
  hentMegUtenEnheterEpos,
  hentMegUtenEnheterHandling,
  IInnstillinger,
} from "./meg";
import { ajax } from "rxjs/ajax";
import { of, throwError } from "rxjs";
import { oppgaveHentingFeilet } from "./oppgave";
import { toasterSett, toasterSkjul } from "./toaster";
import { Dependencies } from "../konfigurerTilstand";
import { RootStateOrAny } from "react-redux";

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
        const expectedMarble = "d-";

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
            valgtEnhet: {
              id: "",
              navn: "",
              lovligeTemaer: undefined,
            },
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
        const reducerResponse = hentetMegHandling({
          graphData: {
            fornavn: mockedResponse.givenName,
            id: mockedResponse.onPremisesSamAccountName,
            etternavn: mockedResponse.surname,
            navn: mockedResponse.displayName,
            mail: mockedResponse.mail,
          },
          enheter: [
            {
              id: "42",
              navn: "test",
              lovligeTemaer: [{ label: "test", value: "5" }],
            },
          ],
          valgtEnhet: {
            navn: "valgtenhet",
            id: "50",
            lovligeTemaer: [{ label: "gyldigtema", value: "1" }],
          },
        });

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
              } else if (url.endsWith("valgtenhet")) {
                return of({
                  navn: "valgtenhet",
                  id: "50",
                  lovligeTemaer: [{ label: "gyldigtema", value: "1" }],
                });
              } else {
                return of(mockedResponse);
              }
            },
          },
        };

        const observableValues = {
          a: initState,
          d: {
            payload: reducerResponse.payload,
            type: hentetMegHandling.type,
          },
        };

        const action$ = new ActionsObservable(ts.createHotObservable(inputMarble, inputValues));
        const state$ = new StateObservable(m.hot("a", observableValues), initState);
        const actual$ = hentMegEpos(action$, state$ as RootStateOrAny, <Dependencies>dependencies);
        ts.expectObservable(actual$).toBe(expectedMarble, observableValues);
      });
    })
  );

  /** Test henting av meg med /enheter slått av */
  test(
    "+++ HENT 'MEG' uten enheter",
    marbles(() => {
      ts.run((m) => {
        const inputMarble = "a-";
        const expectedMarble = "d-";

        const inputValues = {
          a: hentMegUtenEnheterHandling(),
        };
        const initState = {
          meg: {
            id: "",
            navn: "",
            fornavn: "",
            mail: "",
            etternavn: "",
            valgtEnhet: {
              id: "",
              navn: "",
              lovligeTemaer: undefined,
            },
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
        const reducerResponse = hentetMegHandling({
          graphData: {
            fornavn: mockedResponse.givenName,
            id: mockedResponse.onPremisesSamAccountName,
            etternavn: mockedResponse.surname,
            navn: mockedResponse.displayName,
            mail: mockedResponse.mail,
          },
          enheter: undefined,
        });

        const dependencies = {
          ajax: {
            getJSON: (url: string) => {
              return of(mockedResponse);
            },
          },
        };

        const observableValues = {
          a: initState,
          d: {
            payload: reducerResponse.payload,
            type: hentetUtenEnheterHandling.type,
          },
        };

        const action$ = new ActionsObservable(ts.createHotObservable(inputMarble, inputValues));
        const state$ = new StateObservable(m.hot("a", observableValues), initState);
        const actual$ = hentMegUtenEnheterEpos(action$, state$, <Dependencies>dependencies);
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
          graphData: {
            id: "",
            navn: "",
            fornavn: "",
            mail: "",
            etternavn: "",
          },
          valgtEnhet: {
            id: "",
            navn: "",
            lovligeTemaer: undefined,
          },
          enheter: [
            {
              id: "",
              navn: "",
              lovligeTemaer: [{ label: "", value: "" }],
            },
          ],
        },
        {
          type: hentetMegHandling.type,
          payload: {
            graphData: {
              id: "1",
              navn: "Robert Hansen",
              fornavn: "Robert",
              mail: "rob@han.no",
              etternavn: "Hansen",
            },
          },
        }
      )
    ).toEqual({
      graphData: {
        id: "1",
        navn: "Robert Hansen",
        fornavn: "Robert",
        mail: "rob@han.no",
        etternavn: "Hansen",
      },

      valgtEnhet: undefined,
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
              display: true,
              type: "feil",
              feilmelding: "ukjent feil",
            },
            type: toasterSett.type,
          },
          y: {
            payload: undefined,
            type: toasterSkjul.type,
          },
        };

        const state$ = new StateObservable(hot("-a", observableValues), {});
        spyOn(dependencies.ajax, "getJSON").and.returnValue(
          throwError({ message: "ukjent feil", status: 503 })
        );
        expectObservable(
          hentMegEpos(action$, state$ as RootStateOrAny, <Dependencies>dependencies)
        ).toBe("12001ms (tsxy)", observableValues);
      });
    })
  );
});
