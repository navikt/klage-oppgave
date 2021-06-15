import { RootStateOrAny } from "react-redux";
import { RootState } from "../root";
import { IEnhetData, IInnstillinger } from "./meg";

export function velgMeg(state: RootState) {
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
