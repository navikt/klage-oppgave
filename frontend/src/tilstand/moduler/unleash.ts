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
export interface IFeatureToggle {
  navn: string;
  isEnabled: boolean;
}

export interface IFeatureToggles {
  features: [IFeatureToggle?];
}

//==========
// Reducer
//==========
export const unleashSlice = createSlice({
  name: "unleash",
  initialState: {
    features: [],
  } as IFeatureToggles,
  reducers: {
    HENTET: (state, action: PayloadAction<IFeatureToggle>) => {
      if (state.features[action.payload.navn]) {
        state.features[action.payload.navn].isEnabled = action.payload.isEnabled;
      } else {
        state.features.push({
          navn: action.payload.navn,
          isEnabled: action.payload.isEnabled,
        });
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
const featureUrl = (toggleName: string) => `/api/featuretoggle/${toggleName}`;
var resultData: IFeatureToggle;

export function unleashEpos(
  action$: ActionsObservable<PayloadAction<string>>,
  state$: StateObservable<RootState>,
  { getJSON }: AjaxCreationMethod
) {
  return action$.pipe(
    ofType(hentFeatureToggleHandling.type),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      return getJSON<boolean>(featureUrl(action.payload))
        .pipe(
          timeout(5000),
          map((response: boolean) => {
            return {
              navn: action.payload,
              isEnabled: response,
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
            return of(feiletHandling(error.response.detail));
          })
        );
    })
  );
}

export const UNLEASH_EPICS = [unleashEpos];
