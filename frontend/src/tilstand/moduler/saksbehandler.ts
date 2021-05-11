import { createAction, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootStateOrAny } from "react-redux";
import { ActionsObservable, ofType, StateObservable } from "redux-observable";
import { concat, from, of } from "rxjs";
import { catchError, concatMap, map, mergeMap, switchMap, withLatestFrom } from "rxjs/operators";
import { AjaxCreationMethod } from "rxjs/internal-compatibility";
import { toasterSett, toasterSkjul } from "./toaster";
import { OppgaveParams, oppgaveRequest } from "./oppgave";

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
export type PayloadType = {
  ident: string;
  oppgaveId: string;
  klagebehandlingVersjon: number;
};

//==========
// Reducer
//==========
export const saksbehandlerSlice = createSlice({
  name: "saksbehandler",
  initialState: {
    id: "0",
    klagebehandlingVersjon: 1,
    saksbehandler: {
      navn: "",
      ident: "",
    },
  },
  reducers: {},
});

export default saksbehandlerSlice.reducer;

//==========
// Actions
//==========
export const tildelMegHandling = createAction<PayloadType>("saksbehandler/TILDEL_MEG");
export const fradelMegHandling = createAction<PayloadType>("saksbehandler/FRADEL_MEG");
const fradeltHandling = createAction<string>("saksbehandler/FRADELT");
const tildeltHandling = createAction<TildelType>("saksbehandler/TILDELT");

//==========
// Epos
//==========
export function tildelEpos(
  action$: ActionsObservable<PayloadAction<PayloadType>>,
  state$: StateObservable<RootStateOrAny>,
  { post }: AjaxCreationMethod
) {
  return action$.pipe(
    ofType(tildelMegHandling.type),
    withLatestFrom(state$),
    switchMap(([action]) => {
      const tildelMegUrl = `/api/ansatte/${action.payload.ident}/klagebehandlinger/${action.payload.oppgaveId}/saksbehandlertildeling`;
      return post(
        tildelMegUrl,
        { navIdent: action.payload.ident, oppgaveversjon: action.payload.klagebehandlingVersjon },
        { "Content-Type": "application/json" }
      )
        .pipe(
          switchMap(({ response }) => {
            let params = {
              start: state$.value.klagebehandlinger.meta.start,
              antall: state$.value.klagebehandlinger.meta.antall,
              transformasjoner: state$.value.klagebehandlinger.transformasjoner,
              ident: state$.value.meg.id,
              enhetId: state$.value.meg.enheter[state$.value.meg.valgtEnhet].id,
              projeksjon: state$.value.klagebehandlinger.meta.projeksjon,
              tildeltSaksbehandler: state$.value.klagebehandlinger.meta.tildeltSaksbehandler,
            } as OppgaveParams;
            return concat([tildeltHandling(response), oppgaveRequest(params)]);
          })
        )
        .pipe(catchError((error) => concat([displayToast(error), skjulToaster()])));
    })
  );
}

export function fradelEpos(
  action$: ActionsObservable<PayloadAction<PayloadType>>,
  state$: StateObservable<RootStateOrAny>,
  { post }: AjaxCreationMethod
) {
  return action$.pipe(
    ofType(fradelMegHandling.type),
    withLatestFrom(state$),
    switchMap(([action]) => {
      const url = `/api/ansatte/${action.payload.ident}/klagebehandlinger/${action.payload.oppgaveId}/saksbehandlerfradeling`;
      return post(
        url,
        { navIdent: action.payload.ident, oppgaveversjon: action.payload.klagebehandlingVersjon },
        { "Content-Type": "application/json" }
      )
        .pipe(
          switchMap(({ response }) => {
            let params = {
              start: state$.value.klagebehandlinger.meta.start,
              antall: state$.value.klagebehandlinger.meta.antall,
              transformasjoner: state$.value.klagebehandlinger.transformasjoner,
              ident: state$.value.meg.id,
              enhetId: state$.value.meg.enheter[state$.value.meg.valgtEnhet].id,
              projeksjon: state$.value.klagebehandlinger.meta.projeksjon,
              tildeltSaksbehandler: state$.value.klagebehandlinger.meta.tildeltSaksbehandler,
            } as OppgaveParams;
            return concat([fradeltHandling(response), oppgaveRequest(params)]);
          })
        )
        .pipe(catchError((error) => concat([displayToast(error), skjulToaster()])));
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

function displayToast(error: IError) {
  const message =
    error?.response?.detail?.feilmelding ||
    error?.response?.detail ||
    error?.message ||
    "generisk feilmelding";
  return toasterSett({
    display: true,
    feilmelding: message as string,
  });
}

function skjulToaster() {
  return toasterSkjul();
}

export const TILDEL_EPICS = [tildelEpos, fradelEpos];
