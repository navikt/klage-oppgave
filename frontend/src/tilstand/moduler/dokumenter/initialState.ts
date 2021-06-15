import { IDokumenterState } from "./stateTypes";

export const initialState: IDokumenterState = {
  dokumenter: [],
  tilknyttedeDokumenter: [],
  pageReference: null,
  loading: false,
  error: null,
};
