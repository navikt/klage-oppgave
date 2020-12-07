import { RootStateOrAny } from "react-redux";
import { MegOgEnhet } from "./meg";

export function velgMeg(state: RootStateOrAny) {
  return state.meg as MegOgEnhet;
}
