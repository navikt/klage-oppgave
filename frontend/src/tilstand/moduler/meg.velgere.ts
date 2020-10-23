import { RootStateOrAny } from "react-redux";
import { MegType } from "./meg";

export function velgMeg(state: RootStateOrAny) {
  return state.meg as MegType;
}
