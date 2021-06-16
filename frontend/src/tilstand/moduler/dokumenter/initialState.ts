import { IDokumenterState } from "./stateTypes";

export const initialState: IDokumenterState = {
  dokumenter: {
    loading: false,
    dokumenter: [],
  },
  tilknyttedeDokumenter: { loading: false, dokumenter: [] },
  pageReference: null,
  error: null,
};
