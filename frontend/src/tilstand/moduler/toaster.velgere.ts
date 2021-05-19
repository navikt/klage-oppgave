import { RootState } from "../root";

export function velgToaster(state: RootState) {
  return state.toaster;
}
export function velgToasterMelding(state: RootState) {
  return state.toaster.feilmelding;
}
