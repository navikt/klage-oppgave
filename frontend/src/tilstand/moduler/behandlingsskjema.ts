import { combineReducers, createAction, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootStateOrAny } from "react-redux";
import { ActionsObservable, ofType, StateObservable } from "redux-observable";
import { AjaxCreationMethod } from "rxjs/internal-compatibility";
import { catchError, concat, map, retryWhen, switchMap, withLatestFrom } from "rxjs/operators";
import { provIgjenStrategi } from "../../utility/rxUtils";
import { feiletHandling } from "./meg";
import { toasterSett, toasterSkjul } from "./toaster";

//==========
// Interfaces
//==========

export interface IUtfallPayload {
  klagebehandlingid: string;
  vedtakid: string;
  utfall: string;
}

//==========
// Reducer
//==========

const initianStateBehandlingsskjema = {
  internVurdering: "",
};

export const behandlingsskjemaSlice = createSlice({
  name: "behandlingsskjema",
  initialState: initianStateBehandlingsskjema,
  reducers: {
    SETT_INTERN_VURDERING: (state, action: PayloadAction<string>) => {
      return { ...state, internVurdering: action.payload };
    },
  },
});

const initianStateBehandlingsVedtak = {
  id: "",
  utfall: "",
  brevMottakere: [],
  hjemler: [],
  grunn: "",
};

export const behandlingsvedtakSlice = createSlice({
  name: "behandlingsvedtak",
  initialState: initianStateBehandlingsVedtak,
  reducers: {
    SETT_UTFALL: (state, action: PayloadAction<IUtfallPayload>) => {
      return { ...state, utfall: action.payload.utfall };
    },
    UTFALL_SATT: () => {
      console.log("Utfall satt");
    },
  },
});

const behandlingsskjema = combineReducers({
  behandlingsskjema: behandlingsskjemaSlice.reducer,
  behandlingsvedtak: behandlingsvedtakSlice.reducer,
});

export default behandlingsskjema;

//==========
// Actions
//==========

export const lagreUtfall = createAction<IUtfallPayload>("behandlingsvedtak/SETT_UTFALL");

//==========
// Epos
//==========

export function lagreUtfallEpos(
  action$: ActionsObservable<PayloadAction<IUtfallPayload>>,
  state$: StateObservable<RootStateOrAny>,
  { put }: AjaxCreationMethod
) {
  return action$.pipe(
    ofType(lagreUtfall.type),
    withLatestFrom(state$),
    switchMap(([action]) => {
      const lagreUtfallUrl = `/api/klagebehandlinger/${action.payload.klagebehandlingid}/vedtak/${action.payload.vedtakid}/utfall`;
      return put(
        lagreUtfallUrl,
        { utfall: action.payload.utfall },
        { "Content-Type": "application/json" }
      )
        .pipe(map((payload: { response: any }) => lagreUtfall(payload.response)))
        .pipe(
          retryWhen(provIgjenStrategi({ maksForsok: 1 })),
          catchError((error) => {
            let err = error?.response?.detail || "ukjent feil";
            return concat([feiletHandling(err), displayToast(err), skjulToaster()]);
          })
        );
    })
  );
}

export const BEHANDLINGSSKJEMA_EPICS = [lagreUtfallEpos];

//==========
// Vis feilmeldinger ved feil
//==========

function displayToast(error: string) {
  const message = error || "Kunne ikke lagre innstillinger";
  return toasterSett({
    display: true,
    feilmelding: message,
  });
}

function skjulToaster() {
  return toasterSkjul();
}
