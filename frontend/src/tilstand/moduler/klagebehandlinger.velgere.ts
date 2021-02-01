import { RootStateOrAny } from "react-redux";
import { IKlage } from "./klagebehandling";

export function velgKlage(state: RootStateOrAny) {
  return state.klagebehandling as IKlage;
}
