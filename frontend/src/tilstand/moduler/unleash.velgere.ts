import { RootStateOrAny } from "react-redux";
import { IFeatureToggle, IFeatureToggles } from "./unleash";

export function velgFeatureToggles(state: RootStateOrAny) {
  return state.featureToggles as IFeatureToggles;
}
