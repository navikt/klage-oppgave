import { PayloadAction } from "@reduxjs/toolkit";
import { ActionsObservable, ofType, StateObservable } from "redux-observable";
import { of } from "rxjs";
import { catchError, map, mergeMap, retryWhen, switchMap, timeout } from "rxjs/operators";
import { provIgjenStrategi } from "../../../utility/rxUtils";
import { Dependencies } from "../../konfigurerTilstand";
import { RootState } from "../../root";
import { toasterSett, toasterSkjul } from "../toaster";
import { hentKlagebehandling, lagreKlagebehandling, unloadKlagebehandling } from "./actions";
import {
  ERROR,
  KLAGEBEHANDLING_LAGRET,
  LEDIG,
  OPPTATT,
  SETT_KLAGEBEHANDLING,
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
          map(({ response }) => {
            console.debug("EDITABLE FIELDS RESPONSE", response);
            return response;
          }),
          map((response: IKlagebehandlingOppdateringResponse) =>
            KLAGEBEHANDLING_LAGRET({ ...payload, ...response })
          )
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
    mergeMap((res) => of(LEDIG(), res))
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

export const KLAGEBEHANDLING_EPICS = [
  lagreKlagebehandlingEpic,
  settOpptattEpic,
  hentKlagebehandlingEpic,
  unloadKlagebehandlingEpic,
];
