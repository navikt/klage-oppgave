import { ActionsObservable, StateObservable } from "redux-observable";
import { TestScheduler } from "rxjs/testing";
import { marbles } from "rxjs-marbles/jest";
import saksbehandlerTilstand, {
  fradelEpos,
  fradelMegHandling,
  tildelEpos,
  tildelMegHandling,
  TildelType,
} from "./saksbehandler";
import { ajax } from "rxjs/ajax";
import { of, Subject, throwError } from "rxjs";
import { OppgaveParams, Projeksjon } from "./oppgave";
import { AjaxCreationMethod } from "rxjs/internal-compatibility";
import { AlertStripeType } from "nav-frontend-alertstriper";
import { RootState } from "../root";
import { PayloadAction } from "@reduxjs/toolkit";
import { IOppgaveLaster } from "./oppgavelaster";

describe("TILDEL 'Meg' epos", () => {
  let ts: TestScheduler;
  const originalAjaxPost = ajax.post;
  const initState: RootState = {
    meg: {
      id: "ZAKSBEHANDLER",
      navn: "Test User",
      fornavn: "Test",
      etternavn: "User",
      mail: "",
      enheter: [
        {
          navn: "Enhetsnavn",
          id: "42",
        },
      ],
      valgtEnhet: 0,
    },
    routing: {
      prevRoute: "",
    },
    klagebehandling: {
      currentPDF: "",
      dokumenterAlleHentet: true,
      dokumenterOppdatert: "",
      dokumenterTilordnedeHentet: true,
      foedselsnummer: "",
      fraNAVEnhet: "",
      fraNAVEnhetNavn: "",
      frist: "",
      hasMore: true,
      historyNavigate: true,
      hjemler: [],
      id: "",
      internVurdering: "",
      klageLastet: true,
      klageLastingFeilet: false,
      kommentarFraFoersteinstans: "",
      lasterDokumenter: false,
      mottatt: "",
      mottattFoersteinstans: "",
      pageIdx: 0,
      pageReference: "",
      pageRefs: [],
      sakenGjelderFoedselsnummer: "",
      sakenGjelderKjoenn: "",
      sakenGjelderNavn: {},
      tema: "",
      type: "",
      vedtak: [],
    },
    toaster: {
      display: false,
      feilmelding: "",
      type: "advarsel",
    },
    featureToggles: {
      features: [],
    },
    token: {
      expire: "",
    },
    admin: {
      laster: false,
      response: "",
    },
    saksbehandler: {
      id: "",
      klagebehandlingVersjon: 0,
      saksbehandler: {
        navn: "",
        ident: "",
      },
    },
    oppgavelaster: {
      laster: false,
    },
    klagebehandlinger: {
      lasterData: false,
      kodeverk: {},
      meta: {
        start: 0,
        antall: 5,
        sider: 0,
        side: 0,
        totalAntall: 15,
        projeksjon: Projeksjon.UTVIDET,
        tildeltSaksbehandler: "ZAKSBEHANDLER",
      },
      // ident: "ZAKSBEHANDLER",
      transformasjoner: {
        filtrering: {
          hjemler: [],
          temaer: [],
          typer: [],
        },
        sortering: {
          frist: "synkende",
          mottatt: "stigende",
          type: "frist",
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
        const resultPayload: TildelType = {
          saksbehandler: {
            ident: "ZAKSBEHANDLER",
            navn: "",
          },
          klagebehandlingVersjon: 5,
          id: "123456",
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

        const observableValues: {
          a: RootState;
          c: PayloadAction<TildelType>;
          e: PayloadAction<IOppgaveLaster>;
          d: PayloadAction<OppgaveParams>;
        } = {
          a: initState,
          c: {
            payload: resultPayload,
            type: "saksbehandler/TILDELT",
          },
          e: {
            payload: {
              laster: false,
            },
            type: "klagebehandlinger/SETT_FERDIGLASTET",
          },
          d: {
            payload: {
              start: initState.klagebehandlinger.meta.start,
              antall: initState.klagebehandlinger.meta.antall,
              transformasjoner: initState.klagebehandlinger.transformasjoner,
              ident: initState.meg.id,
              projeksjon: initState.klagebehandlinger.meta.projeksjon as Projeksjon,
              tildeltSaksbehandler: initState.klagebehandlinger.meta.tildeltSaksbehandler,
              enhetId: "42",
            },
            type: "klagebehandlinger/HENT",
          },
        };

        const action$ = new ActionsObservable(ts.createHotObservable(inputMarble, inputValues));
        const state$ = new StateObservable(m.hot(inputMarble, observableValues), initState);
        // const state$: StateObservable<RootState> = new StateObservable(
        //   m.hot("a", observableValues),
        //   initState
        // );
        const actual$ = tildelEpos(action$, state$ as any, <any>dependencies);
        ts.expectObservable(actual$).toBe(expectedMarble, observableValues);
      });
    })
  );

  /* test(
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
            type: "klagebehandlinger/SETT_FERDIGLASTET",
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
            type: "klagebehandlinger/SETT_FERDIGLASTET",
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
            type: "klagebehandlinger/SETT_FERDIGLASTET",
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
            type: "klagebehandlinger/SETT_FERDIGLASTET",
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
            type: "klagebehandlinger/SETT_FERDIGLASTET",
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
  ); */
});
