import { createAction, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ActionsObservable, ofType } from "redux-observable";
import { delay, switchMap } from "rxjs/operators";
import { of } from "rxjs";

//==========
// Type defs
//==========

//==========
// Reducer
//==========
export const toasterSlice = createSlice({
  name: "toaster",
  initialState: {
    display: false,
  },
  reducers: {
    SETT: (state) => state,
    SKJUL: (state) => state,
    SATT: (state, action) => {
      state.display = action.payload;
      return state;
    },
  },
});

export default toasterSlice.reducer;

//==========
// Actions
//==========
export const { SETT, SKJUL } = toasterSlice.actions;
export const toasterSett = createAction("toaster/SETT");
const toasterSatt = createAction<boolean>("toaster/SATT");
export const toasterSkjul = createAction("toaster/SKJUL");

//==========
// Epos
//==========
export function visToasterEpos(action$: ActionsObservable<PayloadAction<boolean>>) {
  return action$.pipe(
    ofType(toasterSett.type),
    switchMap(() => of(toasterSatt(true)))
  );
}

export function skjulToasterEpos(action$: ActionsObservable<PayloadAction<boolean>>) {
  return action$.pipe(
    ofType(toasterSkjul.type),
    delay(15 * 1000),
    switchMap(() => of(toasterSatt(false)))
  );
}

export const TOASTER_EPICS = [visToasterEpos, skjulToasterEpos];
