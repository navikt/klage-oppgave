import { createAction, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootStateOrAny } from "react-redux";
import { ActionsObservable, ofType, StateObservable } from "redux-observable";
import { catchError, map, switchMap } from "rxjs/operators";
import { AjaxCreationMethod, ajaxPost } from "rxjs/internal-compatibility";
import { concat } from "rxjs";
import { toasterSett, toasterSkjul } from "./toaster";

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
    RENSK_ELASTIC: (state, action: PayloadAction) => {
      state.laster = true;
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
export const renskElasticHandling = createAction("admin/RENSK_ELASTIC");
export const elasticResponse = createAction<any>("admin/ELASTIC_RESPONSE");

//==========
// Toaster functions
//==========
function displayToast(message: string) {
  return toasterSett({
    display: true,
    type: "suksess",
    feilmelding: message,
  });
}

function skjulToaster() {
  return toasterSkjul();
}

//==========
// Epos
//==========
export function adminEpos(
  action$: ActionsObservable<PayloadAction>,
  state$: StateObservable<RootStateOrAny>,
  { post }: AjaxCreationMethod
) {
  return action$.pipe(
    ofType(renskElasticHandling.type),
    switchMap((action) => {
      const url = `/api/internal/elasticadmin/rebuild`;
      let beskjed = "Elastic tømt";
      return post(url, {}, { "Content-Type": "application/json" }).pipe(
        map((payload) => concat([displayToast(beskjed), elasticResponse(payload), skjulToaster()]))
      );
    })
  );
}
export const ADMIN_EPICS = [adminEpos];
