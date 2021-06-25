import { RootStateOrAny } from "react-redux";
import { RootState } from "../root";
import { IInnstillinger } from "./meg";

export function velgMeg(state: RootState) {
  return state.meg;
}
export function velgInnstillinger(state: RootStateOrAny) {
  return state.meg.innstillinger as IInnstillinger;
}
