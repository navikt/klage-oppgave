import { PayloadAction } from "@reduxjs/toolkit";
import { RootStateOrAny } from "react-redux";
import { ActionsObservable, combineEpics, StateObservable } from "redux-observable";
import { Observable } from "rxjs";
import { combineReducers } from "redux";
import klagebehandlinger, { OPPGAVER_EPICS } from "./moduler/oppgave";
import meg, { MEG_EPICS } from "./moduler/meg";
import saksbehandler, { TILDEL_EPICS } from "./moduler/saksbehandler";
import { AjaxCreationMethod } from "rxjs/internal-compatibility";
import routing, { ROUTING_EPICS } from "./moduler/router";
import toaster, { TOASTER_EPICS } from "./moduler/toaster";
import oppgavelaster, { OPPGAVELASTER_EPOS } from "./moduler/oppgavelaster";
import featureToggles, { UNLEASH_EPICS } from "./moduler/unleash";
import klagebehandling, { KLAGEBEHANDLING_EPICS } from "./moduler/klagebehandling";
import token, { EXPIRE_EPICS } from "./moduler/token";
import behandlingsskjema, { BEHANDLINGSSKJEMA_EPICS } from "./moduler/behandlingsskjema";
import admin, { ADMIN_EPICS } from "./moduler/admin";

const epics: Array<(
  $action: ActionsObservable<PayloadAction<any>>,
  $state: StateObservable<RootStateOrAny>,
  ajaxDelete: AjaxCreationMethod,
  getJSON: AjaxCreationMethod,
  put: AjaxCreationMethod,
  post: AjaxCreationMethod
) => Observable<PayloadAction<any>>> = [
  ...OPPGAVER_EPICS,
  ...MEG_EPICS,
  ...OPPGAVELASTER_EPOS,
  ...TILDEL_EPICS,
  ...UNLEASH_EPICS,
  ...TOASTER_EPICS,
  ...KLAGEBEHANDLING_EPICS,
  ...ROUTING_EPICS,
  ...EXPIRE_EPICS,
  ...BEHANDLINGSSKJEMA_EPICS,
  ...ADMIN_EPICS,
];
export const rootEpic = combineEpics.apply(combineEpics, epics);

const rootReducer = combineReducers({
  klagebehandlinger,
  meg,
  routing,
  toaster,
  oppgavelaster,
  klagebehandling,
  featureToggles,
  saksbehandler,
  token,
  behandlingsskjema,
  admin,
});

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;
