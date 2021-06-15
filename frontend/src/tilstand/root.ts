import { combineEpics } from "redux-observable";
import { combineReducers } from "redux";
import klagebehandlinger, { OPPGAVER_EPICS } from "./moduler/oppgave";
import meg, { MEG_EPICS } from "./moduler/meg";
import saksbehandler, { TILDEL_EPICS } from "./moduler/saksbehandler";
import routing, { ROUTING_EPICS } from "./moduler/router";
import toaster, { TOASTER_EPICS } from "./moduler/toaster";
import oppgavelaster, { OPPGAVELASTER_EPOS } from "./moduler/oppgavelaster";
import featureToggles, { UNLEASH_EPICS } from "./moduler/unleash";
import klagebehandling, { KLAGEBEHANDLING_EPICS } from "./moduler/klagebehandling";
import token, { EXPIRE_EPICS } from "./moduler/token";
import behandlingsskjema, { BEHANDLINGSSKJEMA_EPICS } from "./moduler/behandlingsskjema";
import admin, { ADMIN_EPICS } from "./moduler/admin";
import vedtak, { VEDTAK_EPOS } from "./moduler/vedtak";
import medunderskrivere, { MEDUNDERSKRIVERE_EPOS } from "./moduler/medunderskrivere";

const epics = [
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
  ...VEDTAK_EPOS,
  ...MEDUNDERSKRIVERE_EPOS,
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
  vedtak,
  medunderskrivere,
});

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;
