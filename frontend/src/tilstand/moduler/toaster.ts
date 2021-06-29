import { createAction, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ActionsObservable, ofType, StateObservable } from "redux-observable";
import { catchError, delay, retryWhen, switchMap, withLatestFrom } from "rxjs/operators";
import { concat, of } from "rxjs";
import { RootStateOrAny } from "react-redux";
import { AlertStripeType } from "nav-frontend-alertstriper";
import { provIgjenStrategi } from "../../utility/rxUtils";
import { feiletHandling } from "./klagebehandling";

//==========
// Type defs
//==========
interface IToaster {
  display: boolean;
  type: AlertStripeType;
  feilmelding: string;
}

//==========
// Reducer
//==========
export const toasterInitialState = {
  display: false,
  type: "feil" as AlertStripeType,
  feilmelding: "Generisk feilmelding",
};
export const toasterSlice = createSlice({
  name: "toaster",
  initialState: toasterInitialState,
  reducers: {
    SETT: (state, action: PayloadAction<IToaster>) => ({
      display: false,
      type: action.payload.type,
      feilmelding: action.payload.feilmelding,
    }),
    SATT: (state, action: PayloadAction<IToaster>) => ({
      display: action.payload.display,
      type: action.payload.type,
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
export const toasterSkjul = createAction<number>("toaster/SKJUL");

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
      of(
        toasterSatt({
          display: true,
          type: action.payload.type,
          feilmelding: action.payload.feilmelding,
        })
      )
    )
  );
}

export function skjulToasterEpos(action$: ActionsObservable<PayloadAction<number>>) {
  return action$.pipe(
    ofType(toasterSkjul.type),
    switchMap((action) => {
      return of(toasterSatt(toasterInitialState)).pipe(delay(action.payload * 1000));
    })
  );
}

export const TOASTER_EPICS = [visToasterEpos, skjulToasterEpos];
