import { RootStateOrAny } from "react-redux";
import { IEnhetData, IInnstillinger } from "./meg";

export function velgMeg(state: RootStateOrAny) {
  return state.meg;
}
export function velgEnheter(state: RootStateOrAny) {
  return state.meg.enheter as Array<IEnhetData>;
}
export function valgtEnhet(state: RootStateOrAny) {
  return state.meg.valgtEnhet;
}
export function velgInnstillinger(state: RootStateOrAny) {
  return state.meg.innstillinger as IInnstillinger;
}
