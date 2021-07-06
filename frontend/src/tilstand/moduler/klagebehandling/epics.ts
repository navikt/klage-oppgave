import { PayloadAction } from "@reduxjs/toolkit";
import { ActionsObservable, ofType, StateObservable } from "redux-observable";
import { of } from "rxjs";
import { catchError, map, mergeMap, retryWhen, switchMap, timeout } from "rxjs/operators";
import { provIgjenStrategi } from "../../../utility/rxUtils";
import { Dependencies } from "../../konfigurerTilstand";
import { RootState } from "../../root";
import { hentTilknyttedeDokumenter } from "../dokumenter/actions";
import { SETT_TILKNYTTEDE_DOKUMENTER } from "../dokumenter/state";
import { IDokumenterRespons } from "../dokumenter/types";
// import {
//   TILKNYTT_DOKUMENT as TILKNYTT_DOKUMENT_DOKUMENTER,
//   FRAKOBLE_DOKUMENT as FRAKOBLE_DOKUMENT_DOKUMENTER,
// } from "../dokumenter/state";
// import { IDokument } from "../dokumenter/stateTypes";
import { toasterSett, toasterSkjul } from "../toaster";
import {
  hentKlagebehandling,
  lagreKlagebehandling,
  // tilknyttDokument,
  unloadKlagebehandling,
} from "./actions";
import {
  ERROR,
  FRAKOBLE_DOKUMENT,
  KLAGEBEHANDLING_LAGRET,
  LEDIG,
  OPPTATT,
  SETT_KLAGEBEHANDLING,
  TILKNYTT_DOKUMENT,
  UNLOAD_KLAGEBEHANDLING,
} from "./state";
import { IKlagebehandling } from "./stateTypes";
import {
  IKlagebehandlingOppdatering,
  IKlagebehandlingOppdateringResponse,
  TilknyttetDokument,
} from "./types";

export interface IKlagebehandlingPayload {
  // Klagebehandling
  klagebehandlingId: string;
  klagebehandlingVersjon: number;
  internVurdering: string;
  // Vedtak
  hjemler: string[];
  grunn: string | null;
  utfall: string | null;
  tilknyttedeDokumenter: TilknyttetDokument[];
}

export const unloadKlagebehandlingEpic = (
  action$: ActionsObservable<PayloadAction<never>>,
  _: StateObservable<RootState> | null,
  __: Dependencies
) => action$.pipe(ofType(unloadKlagebehandling.type), map(UNLOAD_KLAGEBEHANDLING));

export const settOpptattEpic = (
  action$: ActionsObservable<PayloadAction<IKlagebehandlingOppdatering>>,
  _: StateObservable<RootState> | null,
  __: Dependencies
) => action$.pipe(ofType(lagreKlagebehandling.type), map(OPPTATT));

export const lagreKlagebehandlingEpic = (
  action$: ActionsObservable<PayloadAction<IKlagebehandlingOppdatering>>,
  _: StateObservable<RootState> | null,
  { ajax }: Dependencies
) =>
  action$.pipe(
    ofType(lagreKlagebehandling.type),
    switchMap(({ payload }) =>
      ajax
        .put(
          `/api/klagebehandlinger/${payload.klagebehandlingId}/detaljer/editerbare`,
          createPayload(payload),
          {
            "Content-Type": "application/json",
          }
        )
        .pipe(
          map(({ response }) => response),
          mergeMap((response: IKlagebehandlingOppdateringResponse) =>
            of(
              KLAGEBEHANDLING_LAGRET({ ...payload, ...response }),
              hentTilknyttedeDokumenter(payload.klagebehandlingId)
            )
          )
          // mergeMap((lagret) =>
          //   ajax
          //     .getJSON<IDokumenterRespons>(
          //       `/api/klagebehandlinger/${payload.klagebehandlingId}/dokumenter`
          //     )
          //     .pipe(
          //       timeout(15000),
          //       mergeMap(({ dokumenter }) => of(SETT_TILKNYTTEDE_DOKUMENTER(dokumenter), lagret))
          //     )
          // )
        )
        .pipe(
          retryWhen(provIgjenStrategi({ maksForsok: 1 })),
          catchError((error) => {
            let err = error?.response?.detail || "ukjent feil";
            return of(
              toasterSett({
                display: true,
                type: "feil",
                feilmelding: err,
              }),
              toasterSkjul(15)
            );
          })
        )
    ),
    mergeMap((res) => of(res, LEDIG()))
  );

const createPayload = ({
  klagebehandlingId,
  internVurdering,
  vedtak: [{ grunn, utfall, hjemler }],
  tilknyttedeDokumenter,
  klagebehandlingVersjon,
}: IKlagebehandlingOppdatering): IKlagebehandlingPayload => ({
  klagebehandlingId,
  klagebehandlingVersjon,
  internVurdering,
  grunn,
  utfall,
  hjemler,
  tilknyttedeDokumenter,
});

export const hentKlagebehandlingEpic = (
  action$: ActionsObservable<PayloadAction<string>>,
  _: StateObservable<RootState> | null,
  { ajax }: Dependencies
) =>
  action$.pipe(
    ofType(hentKlagebehandling.type),
    switchMap(({ payload }) =>
      ajax
        .getJSON<IKlagebehandling>(`/api/klagebehandlinger/${payload}/detaljer`)
        .pipe(timeout(5000), map(SETT_KLAGEBEHANDLING))
        .pipe(
          retryWhen(provIgjenStrategi({ maksForsok: 3 })),
          catchError((error) =>
            of(
              ERROR(error?.response?.detail || "feilet"),
              toasterSett({
                display: true,
                type: "feil",
                feilmelding: `Henting av klagebehandling med id ${payload} feilet. Feilmelding: ${error?.response?.detail}`,
              }),
              toasterSkjul(15)
            )
          )
        )
    )
  );

// export const tilknyttDokumentEpic = (
//   action$: ActionsObservable<PayloadAction<IDokument>>,
//   _: StateObservable<RootState> | null,
//   __: Dependencies
// ) =>
//   action$.pipe(
//     ofType(tilknyttDokument.type),
//     map(({ payload }) =>
//       of(
//         TILKNYTT_DOKUMENT({
//           journalpostId: payload.journalpostId,
//           dokumentInfoId: payload.dokumentInfoId,
//         }),
//         TILKNYTT_DOKUMENT_DOKUMENTER(payload)
//       )
//     )
//   );

// export const frakobleDokumentEpic = (
//   action$: ActionsObservable<PayloadAction<IDokument>>,
//   _: StateObservable<RootState> | null,
//   __: Dependencies
// ) =>
//   action$.pipe(
//     ofType(tilknyttDokument.type),
//     map(({ payload }) =>
//       of(
//         FRAKOBLE_DOKUMENT({
//           journalpostId: payload.journalpostId,
//           dokumentInfoId: payload.dokumentInfoId,
//         }),
//         FRAKOBLE_DOKUMENT_DOKUMENTER(payload)
//       )
//     )
//   );

export const KLAGEBEHANDLING_EPICS = [
  lagreKlagebehandlingEpic,
  settOpptattEpic,
  hentKlagebehandlingEpic,
  unloadKlagebehandlingEpic,
  // tilknyttDokumentEpic,
];
