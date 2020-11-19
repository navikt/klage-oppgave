import { RootStateOrAny } from "react-redux";

export function velgToaster(state: RootStateOrAny) {
  return state.toaster.display;
}
