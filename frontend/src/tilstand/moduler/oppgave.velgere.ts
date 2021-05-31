import { OppgaveRader } from "./oppgave";
import { RootState } from "../root";

export function velgOppgaver(state: RootState) {
  return state.klagebehandlinger;
}
export function velgFerdigstilteOppgaver(state: RootState) {
  return state.klagebehandlinger.ferdigstilteKlager;
}
export function velgSideLaster(state: RootState) {
  return state.klagebehandlinger.lasterData;
}
export function velgFiltrering(state: RootState) {
  return state.klagebehandlinger.transformasjoner.filtrering;
}
export function velgSortering(state: RootState) {
  return state.klagebehandlinger.transformasjoner.sortering;
}
export function velgProjeksjon(state: RootState) {
  return state.klagebehandlinger.meta.projeksjon;
}
export function velgKodeverk(state: RootState) {
  return state.klagebehandlinger.kodeverk;
}
