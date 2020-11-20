import { ActionsObservable, StateObservable } from "redux-observable";
import { TestScheduler } from "rxjs/testing";
import { marbles } from "rxjs-marbles/jest";
import { tildelMegHandling, tildelEpos, TildelType } from "./saksbehandler";
import { ajax } from "rxjs/ajax";
import { from, of } from "rxjs";
import { OppgaveParams } from "./oppgave";

describe("TILDEL 'Meg' epos", () => {
  let ts: TestScheduler;
  const originalAjaxPost = ajax.post;

  beforeEach(() => {
    ts = new TestScheduler((actual, expected) => expect(actual).toEqual(expected));
  });

  afterEach(() => {
    ts.flush();
    ajax.post = originalAjaxPost;
  });

  /**
   * Tester henting
   */
  xtest(
    "+++ TILDEL 'MEG' OPPGAVE FEILET",
    marbles(() => {
      ts.run((m) => {
        const inputMarble = "a-";
        const expectedMarble = "(cde)-";

        const inputValues = {
          a: tildelMegHandling({ oppgaveId: "123456", ident: "ZAKSBEHANDLER", versjon: 5 }),
        };
        const initState = {};
        const mockedResponse = {
          message: "oops",
        };
        const dependencies = {
          post: (url: string) => from(Promise.reject(mockedResponse)),
        };

        const observableValues = {
          a: initState,
          c: {
            payload: { display: true, feilmelding: "oops" },
            type: "toaster/SETT",
          },
          d: {
            payload: JSON.stringify(mockedResponse),
            type: "saksbehandler/FEILET",
          },
          e: {
            payload: undefined,
            type: "toaster/SKJUL",
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
    "+++ TILDEL 'MEG' OPPGAVE SUKSESS",
    marbles(() => {
      ts.run((m) => {
        const inputMarble = "a-";
        const expectedMarble = "(cd)-";

        const inputValues = {
          a: tildelMegHandling({ oppgaveId: "123456", ident: "ZAKSBEHANDLER", versjon: 5 }),
        };
        const initState = {
          meg: {
            id: "ZAKSBEHANDLER",
          },
          oppgaver: {
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
        const resultPayload = {
          saksbehandler: {
            ident: "ZAKSBEHANDLER",
          },
          versjon: 5,
          id: 123456,
        };
        const mockedResponse = {
          response: {
            id: 123456,
            versjon: 5,
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
          d: {
            payload: {
              start: initState.oppgaver.meta.start,
              antall: initState.oppgaver.meta.antall,
              transformasjoner: initState.oppgaver.transformasjoner,
              ident: initState.meg.id,
              projeksjon: initState.oppgaver.meta.projeksjon,
              tildeltSaksbehandler: initState.oppgaver.meta.tildeltSaksbehandler,
            } as OppgaveParams,
            type: "oppgaver/HENT",
          },
        };

        const action$ = new ActionsObservable(ts.createHotObservable(inputMarble, inputValues));
        const state$ = new StateObservable(m.hot("a", observableValues), initState);
        const actual$ = tildelEpos(action$, state$, <any>dependencies);
        ts.expectObservable(actual$).toBe(expectedMarble, observableValues);
      });
    })
  );
});
