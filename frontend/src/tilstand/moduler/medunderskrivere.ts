import { createAction, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { concat, of } from "rxjs";
import { ActionsObservable, ofType, StateObservable } from "redux-observable";
import { catchError, map, mergeMap, retryWhen, switchMap, timeout } from "rxjs/operators";
import { toasterSett, toasterSkjul } from "./toaster";
import { RootState } from "../root";
import { Dependencies } from "../konfigurerTilstand";
import { provIgjenStrategi } from "../../utility/rxUtils";
import { MEDUNDERSKRIVER_SATT } from "./klagebehandling";
import { CustomError } from "./error-types";

//==========
// Type defs
//==========
export interface IMedunderskrivereState {
  medunderskrivere: IMedunderskriver[];
  loading: boolean;
}

export interface IMedunderskriverePayload {
  tema: string;
  medunderskrivere: IMedunderskriver[];
}

export interface IMedunderskriver {
  navn: string;
  ident: string;
}

export interface IMedunderskrivereInput {
  id: string;
  tema: string;
}

interface ISettMedunderskriverParams {
  klagebehandlingId: string;
  medunderskriverident: string;
  klagebehandlingVersjon: number;
}

interface ISettMedunderskriverPayload {
  medunderskriverident: string | null;
}

//==========
// Reducer
//==========
export const initialState: IMedunderskrivereState = {
  medunderskrivere: [],
  loading: false,
};

export const slice = createSlice({
  name: "medunderskrivere",
  initialState: initialState,
  reducers: {
    LASTET: (state, action: PayloadAction<IMedunderskriverePayload>) => ({
      medunderskrivere: action.payload.medunderskrivere,
      loading: false,
    }),
    LOADING: (state) => {
      state.loading = true;
      return state;
    },
    DONE: (state) => {
      state.loading = false;
      return state;
    },
    ERROR: (state, action: PayloadAction<Error>) => {
      console.error(action.payload);
      state.loading = false;
      return state;
    },
  },
});

export default slice.reducer;

//==========
// Actions
//==========
export const { LASTET, LOADING, DONE, ERROR } = slice.actions;
export const lastMedunderskrivere = createAction<IMedunderskrivereInput>(
  "medunderskrivere/LAST_MEDUNDERSKRIVERE"
);
export const settMedunderskriver = createAction<ISettMedunderskriverParams>(
  "medunderskrivere/SETT_MEDUNDERSKRIVER"
);

//==========
// Epos
//==========
export const loadingMedunderskrivereEpos = (action$: ActionsObservable<PayloadAction<never>>) =>
  action$.pipe(ofType(lastMedunderskrivere.type, settMedunderskriver.type), map(LOADING));

export const settMedunderskriverEpos = (
  action$: ActionsObservable<PayloadAction<ISettMedunderskriverParams>>,
  state$: StateObservable<RootState>,
  { ajax }: Dependencies
) =>
  action$.pipe(
    ofType(settMedunderskriver.type),
    mergeMap(({ payload: { klagebehandlingId, medunderskriverident, klagebehandlingVersjon } }) =>
      ajax
        .put(
          `/api/klagebehandlinger/${klagebehandlingId}/detaljer/medunderskriverident`,
          {
            medunderskriverident,
            klagebehandlingVersjon,
          },
          {
            "content-type": "application/json",
          }
        )
        .pipe(
          timeout(5000),
          map((res) => res.response),
          map(({ medunderskriverident }: ISettMedunderskriverPayload) => medunderskriverident),
          mergeMap((ident) => of(MEDUNDERSKRIVER_SATT(ident), DONE()))
        )
        .pipe(
          retryWhen(provIgjenStrategi({ maksForsok: 3 })),
          catchError((error: CustomError) => {
            const message = error.response?.detail ?? "Ukjent feil";
            return concat([
              ERROR(error),
              toasterSett({
                display: true,
                type: "feil",
                feilmelding: `Lagring av medunderskriver feilet. Feilmelding: ${message}`,
              }),
              toasterSkjul(),
            ]);
          })
        )
    )
  );

export const lastMedunderskrivereEpos = (
  action$: ActionsObservable<PayloadAction<IMedunderskrivereInput>>,
  state$: StateObservable<RootState>,
  { ajax }: Dependencies
) =>
  action$.pipe(
    ofType(lastMedunderskrivere.type),
    switchMap((action) => {
      const { id, tema } = action.payload;
      return ajax.getJSON<IMedunderskriverePayload>(getMedunderskrivereURL(id, tema)).pipe(
        timeout(5000),
        map((payload) => {
          if (isMedunderskriverePayload(payload)) {
            return payload;
          }
          console.error("Unexpected response from API.", payload);
          throw new Error("Unexpected response from API.");
        }),
        map(LASTET),
        retryWhen(provIgjenStrategi({ maksForsok: 3 })),
        catchError((error: CustomError) => {
          const message = error.response?.detail ?? "Ukjent feil";
          return concat([
            ERROR(error),
            toasterSett({
              display: true,
              type: "feil",
              feilmelding: `Kunne ikke laste medunderskrivere. Feilmelding: ${message}`,
            }),
            toasterSkjul(),
          ]);
        })
      );
    })
  );

export const MEDUNDERSKRIVERE_EPOS = [
  loadingMedunderskrivereEpos,
  lastMedunderskrivereEpos,
  settMedunderskriverEpos,
];

const getMedunderskrivereURL = (id: string, tema: string) =>
  `/api/ansatte/${id}/medunderskrivere/${tema}`;

const isMedunderskriverePayload = (payload: any): payload is IMedunderskriverePayload =>
  typeof payload === "object" &&
  Array.isArray(payload.medunderskrivere) &&
  payload.medunderskrivere.every(
    (m: any) => typeof m === "object" && typeof m.ident === "string" && typeof m.navn === "string"
  );
