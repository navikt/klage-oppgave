import { IDokumenterState } from "./stateTypes";

export const initialState: IDokumenterState = {
  dokumenter: {
    loading: false,
    dokumenter: [],
    pageReference: null,
    totaltAntall: 0,
  },
  tilknyttedeDokumenter: {
    loading: false,
    dokumenter: [],
    pageReference: null,
    totaltAntall: 0,
  },
  error: null,
};
