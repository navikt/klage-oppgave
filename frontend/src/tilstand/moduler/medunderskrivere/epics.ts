import { PayloadAction } from "@reduxjs/toolkit";
import { concat, of } from "rxjs";
import { ActionsObservable, ofType, StateObservable } from "redux-observable";
import { catchError, map, mergeMap, retryWhen, switchMap, timeout } from "rxjs/operators";
import { initierToaster } from "../toaster/toaster";
import { RootState } from "../../root";
import { Dependencies } from "../../konfigurerTilstand";
import { provIgjenStrategi } from "../../../utility/rxUtils";
import { MEDUNDERSKRIVER_SATT } from "../klagebehandling/state";
import { CustomError } from "../error-types";
import {
  IMedunderskrivereInput,
  IMedunderskriverePayload,
  ISettMedunderskriverParams,
  ISettMedunderskriverResponse,
} from "./types";
import { lastMedunderskrivere, settMedunderskriver } from "./actions";
import { IMedunderskriverSatt } from "../klagebehandling/types";
import { DONE, ERROR, LASTET, LOADING } from "./state";

export const loadingMedunderskrivereEpos = (action$: ActionsObservable<PayloadAction<never>>) =>
  action$.pipe(ofType(lastMedunderskrivere.type, settMedunderskriver.type), map(LOADING));

export const settMedunderskriverEpos = (
  action$: ActionsObservable<PayloadAction<ISettMedunderskriverParams>>,
  _: StateObservable<RootState> | null,
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
          map<ISettMedunderskriverResponse, IMedunderskriverSatt>((res) => ({
            ...res,
            medunderskriverident,
          })),
          mergeMap((p) => of(MEDUNDERSKRIVER_SATT(p), DONE()))
        )
        .pipe(
          retryWhen(provIgjenStrategi({ maksForsok: 3 })),
          catchError((error: CustomError) => {
            const message = error.response?.detail ?? "Ukjent feil";
            return concat([
              ERROR(error),
              initierToaster({
                type: "feil",
                beskrivelse: `Lagring av medunderskriver feilet. Feilmelding: ${message}`,
              }),
            ]);
          })
        )
    )
  );

export const lastMedunderskrivereEpos = (
  action$: ActionsObservable<PayloadAction<IMedunderskrivereInput>>,
  _: StateObservable<RootState> | null,
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
            initierToaster({
              type: "feil",
              beskrivelse: `Kunne ikke laste medunderskrivere. Feilmelding: ${message}`,
            }),
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
  payload !== null &&
  Array.isArray(payload.medunderskrivere) &&
  payload.medunderskrivere.every(
    (m: any) => typeof m === "object" && typeof m.ident === "string" && typeof m.navn === "string"
  );
