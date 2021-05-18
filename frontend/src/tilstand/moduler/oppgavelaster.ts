import { createAction, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ActionsObservable, ofType, StateObservable } from "redux-observable";
import { switchMap, withLatestFrom } from "rxjs/operators";
import { of } from "rxjs";
import { RootStateOrAny } from "react-redux";
import { oppgaveSlice } from "./oppgave";

//==========
// Type defs
//==========
export interface IOppgaveLaster {
  laster: boolean;
}

//==========
// Reducer
//==========
export const initialState = <IOppgaveLaster>{
  laster: false,
};
export const slice = createSlice({
  name: "oppgavelaster",
  initialState: initialState,
  reducers: {
    SETT_LASTET: (state, action) => ({
      laster: action.payload,
    }),
  },
});

export default slice.reducer;

//==========
// Actions
//==========
export const { SETT_LASTET } = slice.actions;
export const settOppgaverLaster = createAction("oppgavelaster/SETT_LASTER");
export const settOppgaverFerdigLastet = createAction("oppgavelaster/SETT_FERDIG_LASTET");

//==========
// Epos
//==========
export function settLasterEpos(
  action$: ActionsObservable<PayloadAction>,
  state$: StateObservable<RootStateOrAny>
) {
  return action$.pipe(
    ofType(settOppgaverLaster.type),
    withLatestFrom(state$),
    switchMap(() => of(SETT_LASTET(true)))
  );
}
export function settFerdigLastetEpos(
  action$: ActionsObservable<PayloadAction>,
  state$: StateObservable<RootStateOrAny>
) {
  return action$.pipe(
    ofType(settOppgaverFerdigLastet.type),
    withLatestFrom(state$),
    switchMap(() => of(SETT_LASTET(false)))
  );
}

export const OPPGAVELASTER_EPOS = [settLasterEpos, settFerdigLastetEpos];
