import { createAction, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootStateOrAny } from "react-redux";
import { ActionsObservable, ofType, StateObservable } from "redux-observable";
import { concat, of } from "rxjs";
import { catchError, mergeMap, switchMap, timeout, withLatestFrom } from "rxjs/operators";
import { OppgaveParams, oppgaveRequest } from "./oppgave";
import { settOppgaverFerdigLastet, settOppgaverLaster } from "./oppgavelaster";
import { displayToast, skjulToaster } from "./meg";
import { Dependencies } from "../konfigurerTilstand";

//==========
// Type defs
//==========
export type TildelType = {
  id: string;
  klagebehandlingVersjon: number;
  saksbehandler: {
    navn: string;
    ident: string;
  };
};
export type ITildelOppgave = {
  ident: string;
  oppgaveId: string;
  klagebehandlingVersjon: number;
  enhetId: string;
  kjorOppgavesokVedSuksess: boolean;
};

//==========
// Reducer
//==========
export const saksbehandlerSlice = createSlice({
  name: "saksbehandler",
  initialState: {
    id: "0",
    tildeler: false,
    klagebehandlingVersjon: 1,
    saksbehandler: {
      navn: "",
      ident: "",
    },
  },
  reducers: {
    TILDEL_MEG: (state, action: PayloadAction) => {
      state.tildeler = true;
      return state;
    },
    TILDELT: (state, action: PayloadAction) => {
      state.tildeler = false;
      return state;
    },
  },
});

export default saksbehandlerSlice.reducer;

//==========
// Actions
//==========
export const tildelMegHandling = createAction<ITildelOppgave>("saksbehandler/TILDEL_MEG");
export const fradelMegHandling = createAction<ITildelOppgave>("saksbehandler/FRADEL_MEG");
const fradeltHandling = createAction<string>("saksbehandler/FRADELT");
const tildeltHandling = createAction<TildelType>("saksbehandler/TILDELT");

//==========
// Epos
//==========
export function tildelEpos(
  action$: ActionsObservable<PayloadAction<ITildelOppgave>>,
  state$: StateObservable<RootStateOrAny>,
  { ajax }: Dependencies
) {
  return action$.pipe(
    ofType(tildelMegHandling.type),
    withLatestFrom(state$),
    switchMap(([action]) => {
      const tildelMegUrl = `/api/ansatte/${action.payload.ident}/klagebehandlinger/${action.payload.oppgaveId}/saksbehandlertildeling`;
      return ajax
        .post(
          tildelMegUrl,
          {
            navIdent: action.payload.ident,
            enhetId: action.payload.enhetId,
            klagebehandlingVersjon: action.payload.klagebehandlingVersjon,
          },
          { "Content-Type": "application/json" }
        )
        .pipe(
          switchMap(({ response }) => {
            let params = {
              start: state$.value.klagebehandlinger.meta.start,
              antall: state$.value.klagebehandlinger.meta.antall,
              transformasjoner: state$.value.klagebehandlinger.transformasjoner,
              ident: action.payload.ident,
              enhetId: state$.value.meg.valgtEnhet.id,
              projeksjon: state$.value.klagebehandlinger.meta.projeksjon,
              tildeltSaksbehandler: state$.value.klagebehandlinger.meta.tildeltSaksbehandler,
            } as OppgaveParams;
            if (action.payload.kjorOppgavesokVedSuksess) {
              return concat([
                tildeltHandling(response),
                oppgaveRequest(params),
                displayToast("Oppgaven er tildelt og er flyttet til Mine Oppgaver", "suksess"),
                skjulToaster(),
              ]);
            } else
              return concat([
                tildeltHandling(response),
                settOppgaverFerdigLastet(),
                displayToast("Oppgaven er tildelt og er flyttet til Mine Oppgaver", "suksess"),
                skjulToaster(),
              ]);
          })
        )
        .pipe(
          catchError((error) =>
            concat([displayToast(error), settOppgaverFerdigLastet(), skjulToaster()])
          )
        );
    })
  );
}

export function settLasterEpos(action$: ActionsObservable<PayloadAction<ITildelOppgave>>) {
  return action$.pipe(
    ofType(fradelMegHandling.type, tildelMegHandling.type),
    mergeMap(() => {
      return of(settOppgaverLaster());
    })
  );
}

export function fradelEpos(
  action$: ActionsObservable<PayloadAction<ITildelOppgave>>,
  state$: StateObservable<RootStateOrAny>,
  { ajax }: Dependencies
) {
  return action$.pipe(
    ofType(fradelMegHandling.type),
    withLatestFrom(state$),
    mergeMap(([action]) => {
      const url = `/api/ansatte/${action.payload.ident}/klagebehandlinger/${action.payload.oppgaveId}/saksbehandlerfradeling`;
      return ajax
        .post(
          url,
          {
            navIdent: action.payload.ident,
            enhetId: action.payload.enhetId,
            klagebehandlingVersjon: action.payload.klagebehandlingVersjon,
          },
          { "Content-Type": "application/json" }
        )
        .pipe(
          timeout(500),
          mergeMap((response) => {
            let params = {
              start: state$.value.klagebehandlinger.meta.start,
              antall: state$.value.klagebehandlinger.meta.antall,
              transformasjoner: state$.value.klagebehandlinger.transformasjoner,
              ident: action.payload.ident,
              enhetId: state$.value.meg.valgtEnhet.id,
              projeksjon: state$.value.klagebehandlinger.meta.projeksjon,
              tildeltSaksbehandler: state$.value.klagebehandlinger.meta.tildeltSaksbehandler,
            } as OppgaveParams;
            if (action.payload.kjorOppgavesokVedSuksess) {
              return concat([fradeltHandling(response.response), oppgaveRequest(params)]);
            } else return concat([fradeltHandling(response.response)]);
          })
        )
        .pipe(
          catchError((error) =>
            concat([displayToast(error), settOppgaverFerdigLastet(), skjulToaster()])
          )
        );
    })
  );
}

interface IError {
  message?: string;
  response?: {
    detail?: {
      feilmelding?: string;
    };
  };
}

export const TILDEL_EPICS = [tildelEpos, fradelEpos, settLasterEpos];
