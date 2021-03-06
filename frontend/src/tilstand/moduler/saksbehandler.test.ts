import { ActionsObservable, StateObservable } from "redux-observable";
import { TestScheduler } from "rxjs/testing";
import { marbles } from "rxjs-marbles/jest";
import { fradelEpos, fradelMegHandling, tildelEpos, tildelMegHandling } from "./saksbehandler";
import { ajax } from "rxjs/ajax";
import { of, throwError } from "rxjs";
import { OppgaveParams } from "./oppgave";
import { Dependencies } from "../konfigurerTilstand";

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
      valgtEnhet: {
        id: "42",
      },
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
        const expectedMarble = "(cdfg)-";

        const inputValues = {
          a: tildelMegHandling({
            oppgaveId: "123456",
            ident: "ZAKSBEHANDLER",
            kjorOppgavesokVedSuksess: true,
            klagebehandlingVersjon: 5,
            enhetId: "",
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
          ajax: {
            post: (url: string) => of(mockedResponse),
          },
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
          f: {
            payload: {
              display: true,
              feilmelding: "Oppgaven er tildelt og er flyttet til Mine Oppgaver",
              type: "suksess",
            },
            type: "toaster/SETT",
          },
          g: {
            payload: 15,
            type: "toaster/SKJUL",
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
            kjorOppgavesokVedSuksess: true,
            klagebehandlingVersjon: 5,
            enhetId: "",
          }),
        };
        const resultPayload = {};
        const mockedResponse = {
          response: {},
        };
        const dependencies = {
          ajax: {
            post: (url: string) => of(mockedResponse),
          },
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
        const actual$ = fradelEpos(action$, state$, <Dependencies>dependencies);
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
            kjorOppgavesokVedSuksess: true,
            klagebehandlingVersjon: 5,
            enhetId: "",
          }),
        };
        const resultPayload = {};
        const mockedResponse = {
          response: {},
        };
        const dependencies = {
          ajax: {
            post: (url: string) => of(mockedResponse),
          },
        };

        const observableValues = {
          a: initState,
          t: {
            payload: {
              display: true,
              type: "feil",
              feilmelding: { message: "fradeling feilet", status: 503 },
            },
            type: "toaster/SETT",
          },
          x: {
            payload: undefined,
            type: "oppgavelaster/SETT_FERDIG_LASTET",
          },
          u: {
            payload: 15,
            type: "toaster/SKJUL",
          },
        };
        spyOn(dependencies.ajax, "post").and.returnValue(
          throwError({ message: "fradeling feilet", status: 503 })
        );

        const action$ = new ActionsObservable(ts.createHotObservable(inputMarble, inputValues));
        const state$ = new StateObservable(m.hot("a", observableValues), initState);
        const actual$ = fradelEpos(action$, state$, <Dependencies>dependencies);
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
            kjorOppgavesokVedSuksess: true,
            klagebehandlingVersjon: 5,
            enhetId: "",
          }),
        };
        const action$ = new ActionsObservable(hot("-a", inputValues));

        const dependencies = {
          ajax: {
            post: (url: string) => of({}),
          },
        };

        const observableValues = {
          a: {},
          t: {
            payload: {
              display: true,
              type: "feil",
              feilmelding: { message: "tildeling feilet", status: 503 },
            },
            type: "toaster/SETT",
          },
          x: {
            payload: undefined,
            type: "oppgavelaster/SETT_FERDIG_LASTET",
          },
          u: {
            payload: 15,
            type: "toaster/SKJUL",
          },
        };

        const state$ = new StateObservable(hot("-a", observableValues), {});
        spyOn(dependencies.ajax, "post").and.returnValue(
          throwError({ message: "tildeling feilet", status: 503 })
        );
        expectObservable(tildelEpos(action$, state$, <Dependencies>dependencies)).toBe(
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
            kjorOppgavesokVedSuksess: true,
            klagebehandlingVersjon: 5,
            enhetId: "",
          }),
        };
        const action$ = new ActionsObservable(hot("-a", inputValues));

        const dependencies = {
          ajax: {
            post: (url: string) => of({}),
          },
        };

        const observableValues = {
          a: {},
          t: {
            payload: {
              display: true,
              type: "feil",
              feilmelding: { message: "tildeling feilet", status: 503 },
            },
            type: "toaster/SETT",
          },
          x: {
            payload: undefined,
            type: "oppgavelaster/SETT_FERDIG_LASTET",
          },
          u: {
            payload: 15,
            type: "toaster/SKJUL",
          },
        };

        const state$ = new StateObservable(hot("-a", observableValues), {});
        spyOn(dependencies.ajax, "post").and.returnValue(
          throwError({
            message: "tildeling feilet",
            status: 503,
          })
        );
        expectObservable(tildelEpos(action$, state$, <Dependencies>dependencies)).toBe(
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
            kjorOppgavesokVedSuksess: true,
            klagebehandlingVersjon: 5,
            enhetId: "",
          }),
        };
        const action$ = new ActionsObservable(hot("-a", inputValues));

        const dependencies = {
          ajax: {
            post: (url: string) => of({}),
          },
        };

        const observableValues = {
          a: {},
          t: {
            payload: {
              display: true,
              type: "feil",
              feilmelding: { message: "tildeling feilet", status: 503 },
            },
            type: "toaster/SETT",
          },
          x: {
            payload: undefined,
            type: "oppgavelaster/SETT_FERDIG_LASTET",
          },
          u: {
            payload: 15,
            type: "toaster/SKJUL",
          },
        };

        const state$ = new StateObservable(hot("-a", observableValues), {});
        spyOn(dependencies.ajax, "post").and.returnValue(
          throwError({
            message: "tildeling feilet",
            status: 503,
          })
        );
        expectObservable(tildelEpos(action$, state$, <Dependencies>dependencies)).toBe(
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
            kjorOppgavesokVedSuksess: true,
            klagebehandlingVersjon: 5,
            enhetId: "",
          }),
        };
        const action$ = new ActionsObservable(hot("-a", inputValues));

        const dependencies = {
          ajax: {
            post: (url: string) => of({}),
          },
        };

        const observableValues = {
          a: {},
          t: {
            payload: {
              display: true,
              type: "feil",
              feilmelding: {
                status: 503,
              },
            },
            type: "toaster/SETT",
          },
          x: {
            payload: undefined,
            type: "oppgavelaster/SETT_FERDIG_LASTET",
          },
          u: {
            payload: 15,
            type: "toaster/SKJUL",
          },
        };

        const state$ = new StateObservable(hot("a", observableValues), {});
        spyOn(dependencies.ajax, "post").and.returnValue(
          throwError({
            status: 503,
          })
        );
        expectObservable(tildelEpos(action$, state$, <Dependencies>dependencies)).toBe(
          "-(txu)",
          observableValues
        );
      });
    })
  );
});
