import { createAction, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ActionsObservable, ofType, StateObservable } from "redux-observable";
import { delay, map, switchMap, withLatestFrom } from "rxjs/operators";
import { of } from "rxjs";
import { RootStateOrAny } from "react-redux";
import { AlertStripeType } from "nav-frontend-alertstriper";

//==========
// Type defs
//==========
interface IToaster {
  feilmelding: Feilmelding | null;
}

interface Feilmelding {
  type: AlertStripeType;
  beskrivelse: string;
}

const initialState: IToaster = {
  feilmelding: null,
};

//==========
// Reducer
//==========

export const toasterSlice = createSlice({
  name: "toaster",
  initialState: initialState,
  reducers: {
    SETT: (state, action: PayloadAction<Feilmelding>) => ({
      ...state,
      feilmelding: {
        type: action.payload.type,
        beskrivelse: action.payload.beskrivelse,
      },
    }),
    SATT: (state, action: PayloadAction<Feilmelding>) => ({
      ...state,
      feilmelding: {
        type: action.payload.type,
        beskrivelse: action.payload.beskrivelse,
      },
    }),
    FJERN: (state) => ({
      ...state,
      feilmelding: null,
    }),
  },
});

export default toasterSlice.reducer;

//==========
// Actions
//==========
export const initierToaster = createAction<Feilmelding>("toaster/SETT");
export const toasterSatt = createAction<Feilmelding | null>("toaster/SATT");
export const toasterFjern = createAction("toaster/FJERN");

//==========
// Epos
//==========

const ERROR_DISPLAY_DURATION = 15 * 1000;

export function visToasterEpos(
  action$: ActionsObservable<PayloadAction<Feilmelding>>,
  state$: StateObservable<RootStateOrAny>
) {
  return action$.pipe(
    ofType(initierToaster.type),
    withLatestFrom(state$),
    switchMap(([action]) =>
      of(
        toasterSatt({
          type: action.payload.type,
          beskrivelse: action.payload.beskrivelse,
        })
      )
    ),
    delay(ERROR_DISPLAY_DURATION),
    switchMap(() => of(toasterFjern()))
  );
}

export function fjernToasterEpos(action$: ActionsObservable<PayloadAction>) {
  return action$.pipe(
    ofType(toasterFjern.type),
    delay(15 * 1000),
    switchMap(() => of(toasterSatt(null)))
  );
}

export const TOASTER_EPICS = [visToasterEpos, fjernToasterEpos];
