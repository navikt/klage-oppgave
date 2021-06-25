import { combineEpics } from "redux-observable";
import { combineReducers } from "redux";
import klagebehandlinger, { OPPGAVER_EPICS } from "./moduler/oppgave";
import meg, { MEG_EPICS } from "./moduler/meg";
import saksbehandler, { TILDEL_EPICS } from "./moduler/saksbehandler";
import routing, { ROUTING_EPICS } from "./moduler/router";
import toaster, { TOASTER_EPICS } from "./moduler/toaster";
import oppgavelaster, { OPPGAVELASTER_EPOS } from "./moduler/oppgavelaster";
import featureToggles, { UNLEASH_EPICS } from "./moduler/unleash";
import klagebehandling, { KLAGEBEHANDLING_EPOS } from "./moduler/klagebehandling";
import admin, { ADMIN_EPICS } from "./moduler/admin";
import sok, { SOK_EPICS } from "./moduler/sok";
import vedtak, { VEDTAK_EPOS } from "./moduler/vedtak";
import { MEDUNDERSKRIVERE_EPOS } from "./moduler/medunderskrivere/epics";
import { medunderskrivere } from "./moduler/medunderskrivere/state";
import kodeverk, { KODEVERK_EPICS } from "./moduler/kodeverk";
import { klagebehandling as klagebehandlingState } from "./moduler/klagebehandling/state";
import { KLAGEBEHANDLING_EPICS } from "./moduler/klagebehandling/epics";

import { dokumenter, DOKUMENTER_EPICS } from "./moduler/dokumenter/state";

const epics = [
  ...OPPGAVER_EPICS,
  ...MEG_EPICS,
  ...OPPGAVELASTER_EPOS,
  ...TILDEL_EPICS,
  ...UNLEASH_EPICS,
  ...TOASTER_EPICS,
  ...ROUTING_EPICS,
  ...ADMIN_EPICS,
  ...VEDTAK_EPOS,
  ...MEDUNDERSKRIVERE_EPOS,
  ...KODEVERK_EPICS,
  ...KLAGEBEHANDLING_EPOS,
  ...KLAGEBEHANDLING_EPICS,
  ...DOKUMENTER_EPICS,
  ...SOK_EPICS,
];
export const rootEpic = combineEpics.apply(combineEpics, epics);

const rootReducer = combineReducers({
  klagebehandlinger,
  meg,
  routing,
  toaster,
  oppgavelaster,
  klagebehandlingState,
  klagebehandling,
  featureToggles,
  saksbehandler,
  admin,
  vedtak,
  medunderskrivere,
  kodeverk,
  dokumenter,
  sok,
});

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;
