import { RootState } from "../root";

export function velgExpire(state: RootState) {
  return state.token.expire;
}
