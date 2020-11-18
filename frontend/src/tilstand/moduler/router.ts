import { createAction, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ActionsObservable, ofType } from "redux-observable";
import { map } from "rxjs/operators";

//==========
// Type defs
//==========

//==========
// Reducer
//==========
export const oppgaveSlice = createSlice({
  name: "oppgaver",
  initialState: {
    prevRoute: "",
  },
  reducers: {
    SETT: (state, action) => {
      state.prevRoute = action.payload;
    },
  },
});

export default oppgaveSlice.reducer;

//==========
// Actions
//==========
export const { SETT } = oppgaveSlice.actions;
export const routingRequest = createAction<string>("routing/SETT");

//==========
// Epos
//==========
export function routingEpos(action$: ActionsObservable<PayloadAction<string>>) {
  return action$.pipe(
    ofType(routingRequest.type),
    map(({ payload }) => SETT(payload))
  );
}

export const ROUTING_EPICS = [routingEpos];
