import { PayloadAction } from "@reduxjs/toolkit";
import { ActionsObservable, ofType, StateObservable } from "redux-observable";
import { of } from "rxjs";
import { catchError, map, mergeMap, retryWhen, timeout } from "rxjs/operators";
import { provIgjenStrategi } from "../../../utility/rxUtils";
import { Dependencies } from "../../konfigurerTilstand";
import { RootState } from "../../root";
import {
  TILKNYTT_DOKUMENT as TILKNYTT_DOKUMENT_TIL_BEHANDLING,
  FRAKOBLE_DOKUMENT as FRAKOBLE_DOKUMENT_FRA_BEHANDLING,
} from "../klagebehandling/state";
import { toasterSett, toasterSkjul } from "../toaster";
import {
  frakobleDokument,
  hentDokumenter,
  hentTilknyttedeDokumenter,
  tilknyttDokument,
} from "./actions";
import {
  ERROR,
  DOKUMENTER_LOADING,
  LEGG_TIL_DOKUMENTER,
  TILKNYTT_DOKUMENT,
  FRAKOBLE_DOKUMENT,
  SETT_TILKNYTTEDE_DOKUMENTER,
  TILKNYTTEDE_DOKUMENTER_LOADING,
} from "./state";
import { IDokument } from "./stateTypes";
import { IDokumenterParams, IDokumenterRespons } from "./types";

export const loadingDokumenterEpic = (action$: ActionsObservable<PayloadAction<never>>) =>
  action$.pipe(ofType(hentDokumenter.type), map(DOKUMENTER_LOADING));

export const loadingTilknyttedeDokumenterEpic = (
  action$: ActionsObservable<PayloadAction<never>>
) => action$.pipe(ofType(hentTilknyttedeDokumenter.type), map(TILKNYTTEDE_DOKUMENTER_LOADING));

export const hentDokumenterEpic = (
  action$: ActionsObservable<PayloadAction<IDokumenterParams>>,
  _: StateObservable<RootState> | null,
  { ajax }: Dependencies
) =>
  action$.pipe(
    ofType(hentDokumenter.type),
    mergeMap(({ payload: { klagebehandlingId, pageReference } }) =>
      ajax
        .getJSON<IDokumenterRespons>(
          `/api/klagebehandlinger/${klagebehandlingId}/alledokumenter?antall=10&forrigeSide=${
            pageReference ?? ""
          }`
        )
        .pipe(timeout(5000), map(LEGG_TIL_DOKUMENTER))
        .pipe(
          retryWhen(provIgjenStrategi({ maksForsok: 3 })),
          catchError((error) =>
            of(
              ERROR(error?.response?.detail || "feilet"),
              toasterSett({
                display: true,
                type: "feil",
                feilmelding: `Henting av dokumenter for klagebehandling "${klagebehandlingId}" feilet. Feilmelding: ${error?.response?.detail}`,
              }),
              toasterSkjul()
            )
          )
        )
    )
  );

export const hentTilknyttedeDokumenterEpic = (
  action$: ActionsObservable<PayloadAction<string>>,
  _: StateObservable<RootState> | null,
  { ajax }: Dependencies
) =>
  action$.pipe(
    ofType(hentTilknyttedeDokumenter.type),
    mergeMap(({ payload }) =>
      ajax
        .getJSON<IDokumenterRespons>(`/api/klagebehandlinger/${payload}/dokumenter`)
        .pipe(
          timeout(15000),
          map(({ dokumenter }) => SETT_TILKNYTTEDE_DOKUMENTER(dokumenter))
        )
        .pipe(
          retryWhen(provIgjenStrategi({ maksForsok: 3 })),
          catchError((error) =>
            of(
              ERROR(error?.response?.detail || "feilet"),
              toasterSett({
                display: true,
                type: "feil",
                feilmelding: `Henting av tilknyttede dokumenter for klagebehandling "${payload}" feilet. Feilmelding: ${error?.response?.detail}`,
              }),
              toasterSkjul()
            )
          )
        )
    )
  );

export const tilknyttDokumentEpic = (
  action$: ActionsObservable<PayloadAction<IDokument>>,
  _: StateObservable<RootState> | null,
  __: Dependencies
) =>
  action$.pipe(
    ofType(tilknyttDokument.type),
    mergeMap(({ payload }) =>
      of(
        TILKNYTT_DOKUMENT_TIL_BEHANDLING({
          dokumentInfoId: payload.dokumentInfoId,
          journalpostId: payload.journalpostId,
        }),
        TILKNYTT_DOKUMENT(payload)
      )
    )
  );

export const frakobleDokumentEpic = (
  action$: ActionsObservable<PayloadAction<IDokument>>,
  _: StateObservable<RootState> | null,
  __: Dependencies
) =>
  action$.pipe(
    ofType(frakobleDokument.type),
    mergeMap(({ payload }) =>
      of(
        FRAKOBLE_DOKUMENT_FRA_BEHANDLING({
          dokumentInfoId: payload.dokumentInfoId,
          journalpostId: payload.journalpostId,
        }),
        FRAKOBLE_DOKUMENT(payload)
      )
    )
  );
