/* https://klage-oppgave-api.dev.nav.no/oppgaver/315993177/saksbehandler */

import { createAction, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootStateOrAny } from "react-redux";
import { ActionsObservable, ofType, StateObservable } from "redux-observable";
import { of } from "rxjs";
import { catchError, map, retryWhen, switchMap, tap, withLatestFrom } from "rxjs/operators";
import { provIgjenStrategi } from "../../utility/rxUtils";
import { AjaxCreationMethod } from "rxjs/internal-compatibility";

//==========
// Type defs
//==========

//==========
// Reducer
//==========
export const megSlice = createSlice({
  name: "meg",
  initialState: {},
  reducers: {
    HENTET: (state, action: PayloadAction) => {
      //state = { ...action.payload };
      return state;
    },
    FEILET: (state, action: PayloadAction<string>) => {
      console.error(action.payload);
    },
  },
});

export default megSlice.reducer;

//==========
// Actions
//==========
export const { HENTET, FEILET } = megSlice.actions;
export const hentMegHandling = createAction("saksbehandler/HENT_MEG");
export const hentetHandling = createAction("saksbehandler/HENTET");
export const feiletHandling = createAction("saksbehandler/FEILET");

//==========
// Epos
//==========
const megUrl = `/me`;

export function hentMegEpos(
  action$: ActionsObservable<PayloadAction>,
  state$: StateObservable<RootStateOrAny>,
  { getJSON }: AjaxCreationMethod
) {
  return action$.pipe(
    ofType(hentMegHandling.type),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      return getJSON<any>(megUrl)
        .pipe(
          map((response) => {
            return hentetHandling();
          })
        )
        .pipe(
          retryWhen(provIgjenStrategi()),
          catchError((error) => of(FEILET(error)))
        );
    })
  );
}

export const MEG_EPICS = [hentMegEpos];
