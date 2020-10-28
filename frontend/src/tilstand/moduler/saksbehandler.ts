import { createAction, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootStateOrAny } from "react-redux";
import { ActionsObservable, ofType, StateObservable } from "redux-observable";
import { of } from "rxjs";
import { catchError, map, retryWhen, switchMap, tap, withLatestFrom } from "rxjs/operators";
import { ajax, AjaxCreationMethod } from "rxjs/internal-compatibility";

//==========
// Type defs
//==========
export type TildelType = {
  id: number;
  saksbehandler: {
    navn: string;
    ident: string;
  };
};
export type PayloadType = {
  ident: string;
  oppgaveId: number;
};

//==========
// Reducer
//==========
export const saksbehandlerSlice = createSlice({
  name: "saksbehandler",
  initialState: {
    id: 0,
    saksbehandler: {
      navn: "",
      ident: "",
    },
  },
  reducers: {
    HENTET: (state, action: PayloadAction<TildelType>) => {
      state.id = action.payload.id;
      state.saksbehandler = action.payload.saksbehandler;
      return state;
    },
    FEILET: (state, action: PayloadAction<string>) => {
      debugger;
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
  { put }: AjaxCreationMethod
) {
  return action$.pipe(
    ofType(tildelMegHandling.type),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      const tildelMegUrl = `/api/oppgaver/${action.payload.oppgaveId}/saksbehandler`;
      return put(
        tildelMegUrl,
        { ident: action.payload.ident },
        { "Content-Type": "application/json" }
      )
        .pipe(
          map(({ response }) => {
            return tildeltHandling({
              id: response.id,
              saksbehandler: {
                ident: response.saksbehandler.ident,
                navn: response.saksbehandler.navn,
              },
            });
          })
        )
        .pipe(catchError((error) => of(FEILET(error))));
    })
  );
}

export const TILDEL_EPICS = [tildelEpos];
