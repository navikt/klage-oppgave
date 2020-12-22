import { createAction, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootStateOrAny } from "react-redux";
import { ActionsObservable, ofType, StateObservable } from "redux-observable";
import { concat, from, of } from "rxjs";
import {
  catchError,
  concatAll,
  map,
  mergeMap,
  retryWhen,
  timeout,
  withLatestFrom,
} from "rxjs/operators";
import { provIgjenStrategi } from "../../utility/rxUtils";
import { AjaxCreationMethod, AjaxObservable } from "rxjs/internal-compatibility";
import { oppgaveHentingFeilet as oppgaveFeiletHandling } from "./oppgave";

//==========
// Interfaces
//==========
export interface IFeatureToggle {
  navn: string;
  isEnabled: boolean;
}

export interface IFeatureToggles {
  features: [IFeatureToggle];
}

//==========
// Reducer
//==========
export const unleashSlice = createSlice({
  name: "unleash",
  initialState: {
    features: [{}],
  } as IFeatureToggles,
  reducers: {
    HENTET: (state, action: PayloadAction<IFeatureToggle>) => {
      if (state.features[action.payload.navn]) {
        state.features[action.payload.navn].isEnabled = action.payload.isEnabled;
      }
      return state;
    },
    FEILET: (state, action: PayloadAction<string>) => {
      console.error(action.payload);
    },
  },
});

export default unleashSlice.reducer;

//==========
// Actions
//==========
export const { HENTET, FEILET } = unleashSlice.actions;
export const hentFeatureToggleHandling = createAction<string>("unleash/HENT_FEATURE");
export const hentetHandling = createAction<IFeatureToggle>("unleash/HENTET");
export const feiletHandling = createAction<string>("unleash/FEILET");

//==========
// Epos
//==========
const featureUrl = (toggleName: string) => `/featuretoggle/${toggleName}`;
var resultData: IFeatureToggle;

export function unleashEpos(
  action$: ActionsObservable<PayloadAction<string>>,
  state$: StateObservable<RootStateOrAny>,
  { getJSON }: AjaxCreationMethod
) {
  return action$.pipe(
    ofType(hentFeatureToggleHandling.type),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      return getJSON<IFeatureToggle>(featureUrl(action.payload))
        .pipe(
          timeout(5000),
          map((response: IFeatureToggle) => {
            return {
              navn: response.navn,
              isEnabled: response.isEnabled,
            };
          })
        )
        .pipe(
          map((data) => {
            return hentetHandling(data);
          })
        )
        .pipe(
          retryWhen(provIgjenStrategi({ maksForsok: 3 })),
          catchError((error) => {
            return of(feiletHandling(error.message));
          })
        );
    })
  );
}

export const UNLEASH_EPICS = [unleashEpos];
