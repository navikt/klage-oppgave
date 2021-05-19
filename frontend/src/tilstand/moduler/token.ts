import { createAction, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ActionsObservable, ofType, StateObservable } from "redux-observable";
import { of } from "rxjs";
import { catchError, map, mergeMap, retryWhen, timeout, withLatestFrom } from "rxjs/operators";
import { provIgjenStrategi } from "../../utility/rxUtils";
import { AjaxCreationMethod } from "rxjs/internal-compatibility";
import { RootState } from "../root";

//==========
// Interfaces
//==========

//==========
// Reducer
//==========
export const tokenSlice = createSlice({
  name: "token",
  initialState: {
    expire: "",
  },
  reducers: {
    HENTET: (state, action: PayloadAction<string>) => {
      state.expire = action.payload;
      return state;
    },
    FEILET: (state, action: PayloadAction<string>) => {
      console.error(action.payload);
    },
  },
});

export default tokenSlice.reducer;

//==========
// Actions
//==========
export const { HENTET, FEILET } = tokenSlice.actions;
export const hentExpiry = createAction("expireToken/HENT_EXPIRE");
export const hentetHandling = createAction<string>("expireToken/HENTET");
export const feiletHandling = createAction<string>("expireToken/FEILET");

//==========
// Epos
//==========
export function expireTokenEpos(
  action$: ActionsObservable<PayloadAction<string>>,
  state$: StateObservable<RootState>,
  { getJSON }: AjaxCreationMethod
) {
  return action$.pipe(
    ofType(hentExpiry.type),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      return getJSON<string>(`/internal/token_expiration`)
        .pipe(
          timeout(5000),
          map((response: string) => response)
        )
        .pipe(
          map((expireResult) => {
            return hentetHandling(expireResult);
          })
        )
        .pipe(
          retryWhen(provIgjenStrategi({ maksForsok: 3 })),
          catchError((error) => {
            return of(feiletHandling(error.response.detail));
          })
        );
    })
  );
}

export const EXPIRE_EPICS = [expireTokenEpos];
