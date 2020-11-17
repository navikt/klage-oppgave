import { PayloadAction } from "@reduxjs/toolkit";
import { RootStateOrAny } from "react-redux";
import { ActionsObservable, combineEpics, StateObservable } from "redux-observable";
import { Observable } from "rxjs";
import { combineReducers } from "redux";
import oppgaver, { OPPGAVER_EPICS } from "./moduler/oppgave";
import meg, { MEG_EPICS } from "./moduler/meg";
import saksbehandler, { TILDEL_EPICS } from "./moduler/saksbehandler";
import { AjaxCreationMethod } from "rxjs/internal-compatibility";

const epics: Array<(
  $action: ActionsObservable<PayloadAction<any>>,
  $state: StateObservable<RootStateOrAny>,
  getJSON: AjaxCreationMethod,
  put: AjaxCreationMethod
) => Observable<PayloadAction<any>>> = [...OPPGAVER_EPICS, ...MEG_EPICS, ...TILDEL_EPICS];
export const rootEpic = combineEpics.apply(combineEpics, epics);

const rootReducer = combineReducers({
  oppgaver,
  meg,
  saksbehandler,
});

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;
