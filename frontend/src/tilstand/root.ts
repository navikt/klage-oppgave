import { PayloadAction } from "@reduxjs/toolkit";
import { RootStateOrAny } from "react-redux";
import { ActionsObservable, combineEpics, StateObservable } from "redux-observable";
import { Observable } from "rxjs";
import { combineReducers } from "redux";
import oppgaver, { OPPGAVER_EPICS } from "./moduler/oppgave";
import meg, { MEG_EPICS } from "./moduler/meg";
import saksbehandler, { TILDEL_EPICS } from "./moduler/saksbehandler";
import { AjaxCreationMethod } from "rxjs/internal-compatibility";
import routing, { ROUTING_EPICS } from "./moduler/router";
import toaster, { TOASTER_EPICS } from "./moduler/toaster";
import featureToggles, { UNLEASH_EPICS } from "./moduler/unleash";
import klagebehandling, { KLAGEBEHANDLING_EPICS } from "./moduler/klagebehandling";
import token, { EXPIRE_EPICS } from "./moduler/token";

const epics: Array<(
  $action: ActionsObservable<PayloadAction<any>>,
  $state: StateObservable<RootStateOrAny>,
  getJSON: AjaxCreationMethod,
  put: AjaxCreationMethod,
  post: AjaxCreationMethod
) => Observable<PayloadAction<any>>> = [
  ...OPPGAVER_EPICS,
  ...MEG_EPICS,
  ...TILDEL_EPICS,
  ...UNLEASH_EPICS,
  ...TOASTER_EPICS,
  ...KLAGEBEHANDLING_EPICS,
  ...ROUTING_EPICS,
  ...EXPIRE_EPICS,
];
export const rootEpic = combineEpics.apply(combineEpics, epics);

const rootReducer = combineReducers({
  oppgaver,
  meg,
  routing,
  toaster,
  klagebehandling,
  featureToggles,
  saksbehandler,
  token,
});

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;
