import { PayloadAction } from "@reduxjs/toolkit";
import { RootStateOrAny } from "react-redux";
import {
  ActionsObservable,
  combineEpics,
  StateObservable,
} from "redux-observable";
import { Observable } from "rxjs";
import { combineReducers } from "redux";
import oppgaver, { OPPGAVER_EPICS } from "./moduler/oppgave";

const epics: Array<(
  $action: ActionsObservable<PayloadAction<any>>,
  $state: StateObservable<RootStateOrAny>
) => Observable<PayloadAction<any>>> = [...OPPGAVER_EPICS];
export const rootEpic = combineEpics.apply(combineEpics, epics);

const rootReducer = combineReducers({
  oppgaver,
});

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;
