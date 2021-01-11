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
  MegType,
} from "./meg";
import { ajax } from "rxjs/ajax";
import { of, throwError } from "rxjs";
import { AjaxCreationMethod } from "rxjs/internal-compatibility";
import { oppgaveHentingFeilet } from "./oppgave";
import { toasterSett, toasterSkjul } from "./toaster";

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
          meg: {},
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
          enhetId: "42",
          enhetNavn: "test",
          lovligeTemaer: ["test"],
        });

        const enhetResponse = hentetEnhetHandling([
          {
            navn: "test",
            id: "42",
            lovligeTemaer: ["test"],
          },
        ]);

        const dependencies = {
          getJSON: (url: string) => {
            if (url.endsWith("enheter")) {
              return of([
                {
                  navn: "test",
                  id: "42",
                  lovligeTemaer: ["test"],
                },
              ]);
            } else {
              return of(mockedResponse);
            }
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
        const actual$ = hentMegEpos(action$, state$, <AjaxCreationMethod>dependencies);
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
          a: hentInnstillingerHandling("en_navIdent"),
        };
        const initState = {
          meg: {
            innstillinger: undefined,
          },
        };
        const mockedResponse = {
          aktiveHjemler: [{ navn: "8-1", label: "8-1" }],
          aktiveTemaer: [{ navn: "SYK", label: "Sykepenger" }],
          aktiveTyper: [{ navn: "test-enhet", label: "42" }],
        };
        const reducerResponse = hentetInnstillingerHandling(mockedResponse);

        const dependencies = {
          getJSON: (navIdent: string) => {
            return of(mockedResponse);
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
        const actual$ = hentInnstillingerEpos(action$, state$, <AjaxCreationMethod>dependencies);
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
          enhetId: "",
          enhetNavn: "",
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
    });
  });

  it("test meg slice feil", () => {
    const consoleSpy = spyOn(console, "error");
    megTilstand(
      {
        id: "",
        navn: "",
        fornavn: "",
        mail: "",
        etternavn: "",
        enhetId: "",
        enhetNavn: "",
      },
      {
        type: feiletHandling.type,
        payload: {
          message: "FEIL",
        },
      }
    );
    expect(consoleSpy).toBeCalled();
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
          getJSON: (url: string) => of({}),
        };

        const observableValues = {
          a: {},
          t: {
            payload: "meg feilet",
            type: feiletHandling.type,
          },
          s: {
            payload: undefined,
            type: oppgaveHentingFeilet.type,
          },
          x: {
            payload: {
              display: true,
              feilmelding: "meg feilet",
            },
            type: toasterSett.type,
          },
          y: {
            payload: undefined,
            type: toasterSkjul.type,
          },
        };

        const state$ = new StateObservable(hot("-a", observableValues), {});
        spyOn(dependencies, "getJSON").and.returnValue(
          throwError({ message: "meg feilet", status: 503 })
        );
        expectObservable(hentMegEpos(action$, state$, <AjaxCreationMethod>dependencies)).toBe(
          "12001ms (tsxy)",
          observableValues
        );
      });
    })
  );
});
