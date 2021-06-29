import { createAction, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootStateOrAny } from "react-redux";
import { ActionsObservable, ofType, StateObservable } from "redux-observable";
import { catchError, map, retryWhen, switchMap } from "rxjs/operators";
import { concat } from "rxjs";
import { toasterSett, toasterSkjul } from "./toaster";
import { provIgjenStrategi } from "../../utility/rxUtils";
import { Dependencies } from "../konfigurerTilstand";

//==========
// Interfaces
//==========

//==========
// Reducer
//==========
export const adminSlice = createSlice({
  name: "admin",
  initialState: {
    laster: false,
    response: "",
  },
  reducers: {
    GJENBYGG_ELASTIC: (state, action: PayloadAction) => {
      state.laster = true;
      return state;
    },
    ELASTIC_FAIL: (state, action: PayloadAction) => {
      state.laster = false;
      return state;
    },
    ELASTIC_RESPONSE: (state, action: PayloadAction<any>) => {
      state.laster = false;
      state.response = action.payload.status === 200 ? "suksess" : "feil";
      return state;
    },
  },
});

export default adminSlice.reducer;

//==========
// Actions
//==========
export const gjenbyggElasticHandling = createAction("admin/GJENBYGG_ELASTIC");
export const stoppLasting = createAction("admin/ELASTIC_FAIL");
export const elasticResponse = createAction<any>("admin/ELASTIC_RESPONSE");

//==========
// Epos
//==========
export function adminEpos(
  action$: ActionsObservable<PayloadAction>,
  state$: StateObservable<RootStateOrAny>,
  { ajax }: Dependencies
) {
  return action$.pipe(
    ofType(gjenbyggElasticHandling.type),
    switchMap((action) => {
      const url = `/api/internal/elasticadmin/rebuild`;
      return ajax
        .post(url, {}, { "Content-Type": "application/json" })
        .pipe(map((payload) => elasticResponse(payload)))
        .pipe(
          retryWhen(provIgjenStrategi({ maksForsok: 1 })),
          catchError((error) => {
            return concat([
              stoppLasting(),
              toasterSett({
                display: true,
                type: "feil",
                feilmelding: `Elastic feilet ${error}`,
              }),
              toasterSkjul(15),
            ]);
          })
        );
    })
  );
}

function toasterSuccessEpos(action$: ActionsObservable<PayloadAction>) {
  return action$.pipe(
    ofType(elasticResponse.type),
    switchMap((action) => {
      let beskjed = "Elastic-kommando mottatt og gjennomført!";
      return concat([
        toasterSett({
          display: true,
          type: "suksess",
          feilmelding: beskjed,
        }),
        toasterSkjul(15),
      ]);
    })
  );
}

export const ADMIN_EPICS = [adminEpos, toasterSuccessEpos];
