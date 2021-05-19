import { ActionsObservable, StateObservable } from "redux-observable";
import { TestScheduler } from "rxjs/testing";
import { marbles } from "rxjs-marbles/jest";
import saksbehandlerTilstand, {
  fradelEpos,
  fradelMegHandling,
  tildelEpos,
  tildelMegHandling,
} from "./saksbehandler";
import { ajax } from "rxjs/ajax";
import { of, throwError } from "rxjs";
import { OppgaveParams } from "./oppgave";
import { AjaxCreationMethod } from "rxjs/internal-compatibility";
import { AlertStripeType } from "nav-frontend-alertstriper";

describe("TILDEL 'Meg' epos", () => {
  let ts: TestScheduler;
  const originalAjaxPost = ajax.post;
  let initState = {
    meg: {
      id: "ZAKSBEHANDLER",
      enheter: [
        {
          id: "42",
        },
      ],
      valgtEnhet: 0,
    },
    klagebehandlinger: {
      meta: {
        start: 0,
        antall: 5,
        projeksjon: "UTVIDET",
        tildeltSaksbehandler: "ZAKSBEHANDLER",
      },
      ident: "ZAKSBEHANDLER",
      transformasjoner: {
        filtrering: {},
        sortering: {
          frist: "synkende",
        },
      },
    },
  };

  beforeEach(() => {
    ts = new TestScheduler((actual, expected) => expect(actual).toEqual(expected));
  });

  afterEach(() => {
    ts.flush();
    ajax.post = originalAjaxPost;
  });

  test(
    "+++ TILDEL 'MEG' OPPGAVE SUKSESS",
    marbles(() => {
      ts.run((m) => {
        const inputMarble = "a-";
        const expectedMarble = "(cd)-";

        const inputValues = {
          a: tildelMegHandling({
            oppgaveId: "123456",
            ident: "ZAKSBEHANDLER",
            klagebehandlingVersjon: 5,
          }),
        };
        const resultPayload = {
          saksbehandler: {
            ident: "ZAKSBEHANDLER",
          },
          klagebehandlingVersjon: 5,
          id: 123456,
        };
        const mockedResponse = {
          response: {
            id: 123456,
            klagebehandlingVersjon: 5,
            saksbehandler: {
              ident: "ZAKSBEHANDLER",
            },
          },
        };
        const dependencies = {
          post: (url: string) => of(mockedResponse),
        };

        const observableValues = {
          a: initState,
          c: {
            payload: resultPayload,
            type: "saksbehandler/TILDELT",
          },
          e: {
            payload: undefined,
            type: "oppgavelaster/SETT_FERDIG_LASTET",
          },
          d: {
            payload: {
              start: initState.klagebehandlinger.meta.start,
              antall: initState.klagebehandlinger.meta.antall,
              transformasjoner: initState.klagebehandlinger.transformasjoner,
              ident: initState.meg.id,
              projeksjon: initState.klagebehandlinger.meta.projeksjon,
              tildeltSaksbehandler: initState.klagebehandlinger.meta.tildeltSaksbehandler,
              enhetId: "42",
            } as OppgaveParams,
            type: "klagebehandlinger/HENT",
          },
        };

        const action$ = new ActionsObservable(ts.createHotObservable(inputMarble, inputValues));
        const state$ = new StateObservable(m.hot("a", observableValues), initState);
        const actual$ = tildelEpos(action$, state$, <any>dependencies);
        ts.expectObservable(actual$).toBe(expectedMarble, observableValues);
      });
    })
  );

  test(
    "+++ FRADEL 'MEG' OPPGAVE SUKSESS",
    marbles(() => {
      ts.run((m) => {
        const inputMarble = "a";
        const expectedMarble = "(cd)";

        const inputValues = {
          a: fradelMegHandling({
            oppgaveId: "123456",
            ident: "ZAKSBEHANDLER",
            klagebehandlingVersjon: 5,
          }),
        };
        const resultPayload = {};
        const mockedResponse = {
          response: {},
        };
        const dependencies = {
          post: (url: string) => of(mockedResponse),
        };

        const observableValues = {
          a: initState,
          c: {
            payload: resultPayload,
            type: "saksbehandler/FRADELT",
          },
          d: {
            payload: {
              start: initState.klagebehandlinger.meta.start,
              antall: initState.klagebehandlinger.meta.antall,
              transformasjoner: initState.klagebehandlinger.transformasjoner,
              ident: initState.meg.id,
              projeksjon: initState.klagebehandlinger.meta.projeksjon,
              tildeltSaksbehandler: initState.klagebehandlinger.meta.tildeltSaksbehandler,
              enhetId: "42",
            } as OppgaveParams,
            type: "klagebehandlinger/HENT",
          },
        };

        const action$ = new ActionsObservable(ts.createHotObservable(inputMarble, inputValues));
        const state$ = new StateObservable(m.hot("a", observableValues), initState);
        const actual$ = fradelEpos(action$, state$, <any>dependencies);
        ts.expectObservable(actual$).toBe(expectedMarble, observableValues);
      });
    })
  );

  test(
    "+++ FRADEL 'MEG' OPPGAVE FEIL",
    marbles(() => {
      ts.run((m) => {
        const inputMarble = "a-";
        const expectedMarble = "(txu)";

        const inputValues = {
          a: fradelMegHandling({
            oppgaveId: "123456",
            ident: "ZAKSBEHANDLER",
            klagebehandlingVersjon: 5,
          }),
        };
        const resultPayload = {};
        const mockedResponse = {
          response: {},
        };
        const dependencies = {
          post: (url: string) => of(mockedResponse),
        };

        const observableValues = {
          a: initState,
          t: {
            payload: {
              display: true,
              type: "feil",
              feilmelding: "fradeling feilet",
            },
            type: "toaster/SETT",
          },
          x: {
            payload: undefined,
            type: "oppgavelaster/SETT_FERDIG_LASTET",
          },
          u: {
            payload: undefined,
            type: "toaster/SKJUL",
          },
        };
        spyOn(dependencies, "post").and.returnValue(
          throwError({ message: "fradeling feilet", status: 503 })
        );

        const action$ = new ActionsObservable(ts.createHotObservable(inputMarble, inputValues));
        const state$ = new StateObservable(m.hot("a", observableValues), initState);
        const actual$ = fradelEpos(action$, state$, <any>dependencies);
        ts.expectObservable(actual$).toBe(expectedMarble, observableValues);
      });
    })
  );

  test(
    "+++ HENT SAKSBEHANDLER FEIL error:message",
    marbles(() => {
      ts.run(({ hot, cold, expectObservable, expectSubscriptions }) => {
        const inputValues = {
          a: tildelMegHandling({
            oppgaveId: "123456",
            ident: "ZAKSBEHANDLER",
            klagebehandlingVersjon: 5,
          }),
        };
        const action$ = new ActionsObservable(hot("-a", inputValues));

        const dependencies = {
          post: (url: string) => of({}),
        };

        const observableValues = {
          a: {},
          t: {
            payload: {
              display: true,
              type: "feil",
              feilmelding: "tildeling feilet",
            },
            type: "toaster/SETT",
          },
          x: {
            payload: undefined,
            type: "oppgavelaster/SETT_FERDIG_LASTET",
          },
          u: {
            payload: undefined,
            type: "toaster/SKJUL",
          },
        };

        const state$ = new StateObservable(hot("-a", observableValues), {});
        spyOn(dependencies, "post").and.returnValue(
          throwError({ message: "tildeling feilet", status: 503 })
        );
        expectObservable(tildelEpos(action$, state$, <AjaxCreationMethod>dependencies)).toBe(
          "-(txu)",
          observableValues
        );
      });
    })
  );

  test(
    "+++ HENT SAKSBEHANDLER FEIL error: response.detail.feilmelding",
    marbles(() => {
      ts.run(({ hot, cold, expectObservable, expectSubscriptions }) => {
        const inputValues = {
          a: tildelMegHandling({
            oppgaveId: "123456",
            ident: "ZAKSBEHANDLER",
            klagebehandlingVersjon: 5,
          }),
        };
        const action$ = new ActionsObservable(hot("-a", inputValues));

        const dependencies = {
          post: (url: string) => of({}),
        };

        const observableValues = {
          a: {},
          t: {
            payload: {
              display: true,
              type: "feil",
              feilmelding: "tildeling feilet",
            },
            type: "toaster/SETT",
          },
          x: {
            payload: undefined,
            type: "oppgavelaster/SETT_FERDIG_LASTET",
          },
          u: {
            payload: undefined,
            type: "toaster/SKJUL",
          },
        };

        const state$ = new StateObservable(hot("-a", observableValues), {});
        spyOn(dependencies, "post").and.returnValue(
          throwError({
            response: { detail: { feilmelding: "tildeling feilet" } },
            status: 503,
          })
        );
        expectObservable(tildelEpos(action$, state$, <AjaxCreationMethod>dependencies)).toBe(
          "-(txu)",
          observableValues
        );
      });
    })
  );

  test(
    "+++ HENT SAKSBEHANDLER FEIL error: response.detail",
    marbles(() => {
      ts.run(({ hot, cold, expectObservable, expectSubscriptions }) => {
        const inputValues = {
          a: tildelMegHandling({
            oppgaveId: "123456",
            ident: "ZAKSBEHANDLER",
            klagebehandlingVersjon: 5,
          }),
        };
        const action$ = new ActionsObservable(hot("-a", inputValues));

        const dependencies = {
          post: (url: string) => of({}),
        };

        const observableValues = {
          a: {},
          t: {
            payload: {
              display: true,
              type: "feil",
              feilmelding: "tildeling feilet",
            },
            type: "toaster/SETT",
          },
          x: {
            payload: undefined,
            type: "oppgavelaster/SETT_FERDIG_LASTET",
          },
          u: {
            payload: undefined,
            type: "toaster/SKJUL",
          },
        };

        const state$ = new StateObservable(hot("-a", observableValues), {});
        spyOn(dependencies, "post").and.returnValue(
          throwError({
            response: { detail: "tildeling feilet" },
            status: 503,
          })
        );
        expectObservable(tildelEpos(action$, state$, <AjaxCreationMethod>dependencies)).toBe(
          "-(txu)",
          observableValues
        );
      });
    })
  );

  test(
    "+++ HENT SAKSBEHANDLER FEIL error: generisk",
    marbles(() => {
      ts.run(({ hot, cold, expectObservable, expectSubscriptions }) => {
        const inputValues = {
          a: tildelMegHandling({
            oppgaveId: "123456",
            ident: "ZAKSBEHANDLER",
            klagebehandlingVersjon: 5,
          }),
        };
        const action$ = new ActionsObservable(hot("-a", inputValues));

        const dependencies = {
          post: (url: string) => of({}),
        };

        const observableValues = {
          a: {},
          t: {
            payload: {
              display: true,
              type: "feil",
              feilmelding: "generisk feilmelding",
            },
            type: "toaster/SETT",
          },
          x: {
            payload: undefined,
            type: "oppgavelaster/SETT_FERDIG_LASTET",
          },
          u: {
            payload: undefined,
            type: "toaster/SKJUL",
          },
        };

        const state$ = new StateObservable(hot("a", observableValues), {});
        spyOn(dependencies, "post").and.returnValue(
          throwError({
            status: 503,
          })
        );
        expectObservable(tildelEpos(action$, state$, <AjaxCreationMethod>dependencies)).toBe(
          "-(txu)",
          observableValues
        );
      });
    })
  );
});
