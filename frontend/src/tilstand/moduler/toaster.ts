import { createAction, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ActionsObservable, ofType, StateObservable } from "redux-observable";
import { catchError, delay, switchMap, withLatestFrom } from "rxjs/operators";
import { of } from "rxjs";
import { RootStateOrAny } from "react-redux";

//==========
// Type defs
//==========
interface IToaster {
  display: boolean;
  feilmelding: string;
}

//==========
// Reducer
//==========
export const toasterInitialState = {
  display: false,
  feilmelding: "Oppgaven kan ikke tildeles da den allerede er tildelt en annen saksbehandler",
};
export const toasterSlice = createSlice({
  name: "toaster",
  initialState: toasterInitialState,
  reducers: {
    SATT: (state, action: PayloadAction<IToaster>) => ({
      display: action.payload.display,
      feilmelding: action.payload.feilmelding,
    }),
  },
});

export default toasterSlice.reducer;

//==========
// Actions
//==========
export const toasterSett = createAction<IToaster>("toaster/SETT");
export const toasterSatt = createAction<IToaster>("toaster/SATT");
export const toasterSkjul = createAction("toaster/SKJUL");

//==========
// Epos
//==========
export function visToasterEpos(
  action$: ActionsObservable<PayloadAction<IToaster>>,
  state$: StateObservable<RootStateOrAny>
) {
  return action$.pipe(
    ofType(toasterSett.type),
    withLatestFrom(state$),
    switchMap(([action]) =>
      of(toasterSatt({ display: true, feilmelding: action.payload.feilmelding }))
    )
  );
}

export function skjulToasterEpos(action$: ActionsObservable<PayloadAction>) {
  return action$.pipe(
    ofType(toasterSkjul.type),
    delay(15 * 1000),
    switchMap(() => of(toasterSatt(toasterInitialState)))
  );
}

export const TOASTER_EPICS = [visToasterEpos, skjulToasterEpos];
