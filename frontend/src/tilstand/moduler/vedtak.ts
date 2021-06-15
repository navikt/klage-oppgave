import { createAction, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { concat, of } from "rxjs";
import { ActionsObservable, ofType, StateObservable } from "redux-observable";
import { catchError, map, mergeMap, switchMap, timeout } from "rxjs/operators";
import { toasterSett, toasterSkjul } from "./toaster";
import { RootState } from "../root";
import { Dependencies } from "../konfigurerTilstand";
import {
  HENTET,
  IKlage,
  IVedlegg,
  VEDLEGG_OPPLASTET,
  VEDLEGG_SLETTET,
  Vedtak,
} from "./klagebehandling";
import { fromPromise } from "rxjs/internal-compatibility";
import { CustomError } from "./error-types";

//==========
// Type defs
//==========
export interface IVedtakState {
  loading: boolean;
}

export interface IVedleggInput {
  klagebehandlingId: string;
  vedtakId: string;
  file: File;
  journalfoerendeEnhet: string;
  klagebehandlingVersjon: number;
}

export interface IVedleggDeleteInput {
  klagebehandlingId: string;
  vedtakId: string;
  klagebehandlingVersjon: number;
}

export interface IFullfoerVedtakParams {
  klagebehandlingId: string;
  vedtakId: string;
  journalfoerendeEnhet: string;
  klagebehandlingVersjon: number;
}

//==========
// Reducer
//==========
export const initialState: IVedtakState = {
  loading: false,
};

export const slice = createSlice({
  name: "vedtak",
  initialState,
  reducers: {
    DONE: (state) => {
      state.loading = false;
      return state;
    },
    LOADING: (state) => {
      state.loading = true;
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
export const { DONE, LOADING, ERROR } = slice.actions;
export const lastOppVedlegg = createAction<IVedleggInput>("vedtak/LAST_OPP_VEDLEGG");
export const slettVedlegg = createAction<IVedleggDeleteInput>("vedtak/SLETT_VEDLEGG");
export const fullfoerVedtak = createAction<IFullfoerVedtakParams>("vedtak/FULLFOER");

//==========
// Epos
//==========
export const loadingVedtakEpos = (action$: ActionsObservable<PayloadAction<never>>) =>
  action$.pipe(ofType(lastOppVedlegg.type, slettVedlegg.type, fullfoerVedtak.type), map(LOADING));

export const slettVedleggEpos = (
  action$: ActionsObservable<PayloadAction<IVedleggDeleteInput>>,
  state$: StateObservable<RootState> | null,
  { fromFetch }: Dependencies
) =>
  action$.pipe(
    ofType(slettVedlegg.type),
    switchMap((action) => {
      const { klagebehandlingId, vedtakId, klagebehandlingVersjon } = action.payload;
      return fromFetch(`${getVedtakURL(klagebehandlingId, vedtakId)}/vedlegg`, {
        method: "DELETE",
        body: JSON.stringify({ klagebehandlingVersjon }),
        headers: {
          "content-type": "application/json",
        },
      }).pipe(
        timeout(5000),
        mergeMap((res) => {
          if (res.ok) {
            return fromPromise<Vedtak>(res.json());
          }
          throw new Error("Kunne ikke slette vedtak.");
        }),
        mergeMap((vedtak) => of(VEDLEGG_SLETTET(vedtak), DONE())),
        catchError((error: CustomError) => {
          const message = error.response?.detail ?? "Ukjent feil";
          return concat([ERROR(error), displayToast(message), toasterSkjul()]);
        })
      );
    })
  );

export const lastOppVedtakEpos = (
  action$: ActionsObservable<PayloadAction<IVedleggInput>>,
  _: StateObservable<RootState> | null,
  { ajax }: Dependencies
) => {
  return action$.pipe(
    ofType(lastOppVedlegg.type),
    switchMap((action) => {
      const { klagebehandlingId, vedtakId, journalfoerendeEnhet, klagebehandlingVersjon, file } =
        action.payload;

      const lastOppURL = `${getVedtakURL(klagebehandlingId, vedtakId)}/vedlegg`;

      const formData = new FormData();
      formData.append("journalfoerendeEnhet", journalfoerendeEnhet);
      formData.append("klagebehandlingVersjon", klagebehandlingVersjon.toString());
      formData.append("vedlegg", file);

      return ajax.post(lastOppURL, formData).pipe(
        timeout(30000),
        map(({ response, status }) => {
          if (status === 200 && isVedlegg(response)) {
            return response;
          }
          console.error("Unexpected response from API.", response);
          throw new Error("Unexpected response from API.");
        }),
        mergeMap((vedlegg) =>
          of(
            VEDLEGG_OPPLASTET({
              vedtakId,
              vedlegg,
            }),
            DONE()
          )
        ),
        catchError((error: CustomError) => {
          const message = error.response?.detail ?? "Ukjent feil";
          return concat([ERROR(error), displayToast(message), toasterSkjul()]);
        })
      );
    })
  );
};

export const fullfoerVedtakEpos = (
  action$: ActionsObservable<PayloadAction<IFullfoerVedtakParams>>,
  state$: StateObservable<RootState> | null,
  { ajax }: Dependencies
) =>
  action$.pipe(
    ofType(fullfoerVedtak.type),
    switchMap(({ payload }) =>
      ajax
        .post(
          `${getVedtakURL(payload.klagebehandlingId, payload.vedtakId)}/fullfoer`,
          {
            journalfoerendeEnhet: payload.journalfoerendeEnhet,
            klagebehandlingVersjon: payload.klagebehandlingVersjon,
          },
          { "content-type": "application/json" }
        )
        .pipe(
          timeout(5000),
          map(({ response }) => response),
          mergeMap((klage: IKlage) => of(HENTET(klage), DONE())),
          catchError((error: CustomError) => {
            const message = error.response?.detail ?? "Ukjent feil";
            return concat([ERROR(error), displayToast(message), toasterSkjul()]);
          })
        )
    )
  );

export const VEDTAK_EPOS = [
  loadingVedtakEpos,
  lastOppVedtakEpos,
  fullfoerVedtakEpos,
  slettVedleggEpos,
];

const getVedtakURL = (klagebehandlingId: string, vedtakId: string) =>
  `/api/klagebehandlinger/${klagebehandlingId}/vedtak/${vedtakId}`;

const VEDLEGG_KEYS = [
  ["name", "string"],
  ["size", "number"],
  ["content", "string"],
];
const isVedlegg = (payload: any): payload is IVedlegg => {
  if (typeof payload === "object") {
    const keys = Object.keys(payload);
    return VEDLEGG_KEYS.every(
      ([key, type]) => keys.includes(key) && (typeof payload[key] === type || payload[key] === null)
    );
  }
  return false;
};

const displayToast = (feilmelding: string) =>
  toasterSett({
    display: true,
    type: "feil",
    feilmelding,
  });
