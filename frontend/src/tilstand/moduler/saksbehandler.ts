import { createAction, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootStateOrAny } from "react-redux";
import { ActionsObservable, ofType, StateObservable } from "redux-observable";
import { of } from "rxjs";
import { catchError, map, switchMap, withLatestFrom } from "rxjs/operators";
import { AjaxCreationMethod } from "rxjs/internal-compatibility";

//==========
// Type defs
//==========
export type TildelType = {
  id: string;
  versjon: number;
  saksbehandler: {
    navn: string;
    ident: string;
  };
};
export type PayloadType = {
  ident: string;
  oppgaveId: string;
  versjon: number;
};

//==========
// Reducer
//==========
export const saksbehandlerSlice = createSlice({
  name: "saksbehandler",
  initialState: {
    id: "0",
    versjon: 1,
    saksbehandler: {
      navn: "",
      ident: "",
    },
  },
  reducers: {
    HENTET: (state, action: PayloadAction<TildelType>) => {
      state.id = action.payload.id;
      state.versjon = action.payload.versjon;
      state.saksbehandler = action.payload.saksbehandler;
      return state;
    },
    FEILET: (state, action: PayloadAction<string>) => {
      console.error(action.payload);
    },
  },
});

export default saksbehandlerSlice.reducer;

//==========
// Actions
//==========
export const { HENTET, FEILET } = saksbehandlerSlice.actions;
export const tildelMegHandling = createAction<PayloadType>("saksbehandler/TILDEL_MEG");
export const tildeltHandling = createAction<TildelType>("saksbehandler/TILDELT");
export const feiletHandling = createAction("saksbehandler/FEILET");

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
      const tildelMegUrl = `/api/ansatte/${action.payload.ident}/oppgaver/${action.payload.oppgaveId}/saksbehandlertildeling`;
      return post(
        tildelMegUrl,
        { navIdent: action.payload.ident, oppgaveversjon: action.payload.versjon },
        { "Content-Type": "application/json" }
      )
        .pipe(
          map(({ response }) => {
            return tildeltHandling(response);
          })
        )
        .pipe(catchError((error) => of(FEILET(JSON.stringify(error)))));
    })
  );
}

export const TILDEL_EPICS = [tildelEpos];
