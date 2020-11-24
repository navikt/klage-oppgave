import { createAction, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootStateOrAny } from "react-redux";
import { ActionsObservable, ofType, StateObservable } from "redux-observable";
import { concat, of } from "rxjs";
import { catchError, map, retryWhen, switchMap, tap, withLatestFrom } from "rxjs/operators";
import { provIgjenStrategi } from "../../utility/rxUtils";
import { AjaxCreationMethod, AjaxObservable } from "rxjs/internal-compatibility";
import { oppgaveHentingFeilet as oppgaveFeiletHandling } from "./oppgave";

//==========
// Type defs
//==========
export type MegType = {
  navn: string;
  fornavn: string;
  mail: string;
  id: string;
  etternavn: string;
};
type Graphdata = {
  givenName: string;
  surname: string;
  onPremisesSamAccountName: string;
  displayName: string;
  mail: string;
};

//==========
// Reducer
//==========
export const megSlice = createSlice({
  name: "meg",
  initialState: {
    navn: "",
    fornavn: "",
    mail: "",
    etternavn: "",
  } as MegType,
  reducers: {
    HENTET: (state, action: PayloadAction<MegType>) => {
      state = { ...action.payload };
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
export const hentMegHandling = createAction("meg/HENT_MEG");
export const hentetHandling = createAction<MegType>("meg/HENTET");
export const feiletHandling = createAction<string>("meg/FEILET");

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
      return getJSON<Graphdata>(megUrl)
        .pipe(
          map((response) => {
            return hentetHandling({
              fornavn: response.givenName,
              id: response.onPremisesSamAccountName,
              etternavn: response.surname,
              navn: response.displayName,
              mail: response.mail,
            });
          })
        )
        .pipe(
          retryWhen(provIgjenStrategi({ maksForsok: 5 })),
          catchError((error) => {
            return concat([feiletHandling(error.message), oppgaveFeiletHandling()]);
          })
        );
    })
  );
}

export const MEG_EPICS = [hentMegEpos];
