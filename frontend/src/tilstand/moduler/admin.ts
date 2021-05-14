import { createAction, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootStateOrAny } from "react-redux";
import { ActionsObservable, ofType, StateObservable } from "redux-observable";
import { map, switchMap } from "rxjs/operators";
import { AjaxCreationMethod, ajaxPost } from "rxjs/internal-compatibility";

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
      return post(url, {}, { "Content-Type": "application/json" }).pipe(
        map((payload) => elasticResponse(payload))
      );
    })
  );
}
export const ADMIN_EPICS = [adminEpos];
