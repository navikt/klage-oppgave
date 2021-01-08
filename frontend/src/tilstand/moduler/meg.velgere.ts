import { RootStateOrAny } from "react-redux";
import { MegOgEnhet, EnhetData, IInnstillinger } from "./meg";

export function velgMeg(state: RootStateOrAny) {
  return state.meg as MegOgEnhet;
}
export function velgEnheter(state: RootStateOrAny) {
  return state.meg.enheter as Array<EnhetData>;
}
export function velgInnstillinger(state: RootStateOrAny) {
  return state.meg.innstillinger as IInnstillinger;
}
