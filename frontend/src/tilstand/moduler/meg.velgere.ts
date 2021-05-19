import { RootState } from "../root";

export function velgMeg(state: RootState) {
  return state.meg;
}
export function velgEnheter(state: RootState) {
  return state.meg.enheter;
}
export function valgtEnhet(state: RootState) {
  return state.meg.valgtEnhet;
}
export function velgInnstillinger(state: RootState) {
  return state.meg.innstillinger;
}
