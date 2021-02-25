import { RootStateOrAny } from "react-redux";

export function velgExpire(state: RootStateOrAny) {
  return state.token.expire;
}
