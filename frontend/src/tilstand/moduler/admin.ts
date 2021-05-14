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
  name: "meg",
  initialState: {},
  reducers: {},
});

export default adminSlice.reducer;

//==========
// Actions
//==========
export const renskElasticHandling = createAction("admin/TØM_ELASTIC");
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
        map((payload: { response: any }) => elasticResponse(payload.response))
      );
    })
  );
}
export const ADMIN_EPICS = [adminEpos];
