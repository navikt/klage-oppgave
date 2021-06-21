import { RootState } from "../../root";

export const velgAlleDokumenter = (state: RootState) => state.dokumenter.dokumenter;
export const velgTilknyttedeDokumenter = (state: RootState) =>
  state.dokumenter.tilknyttedeDokumenter;
export const velgDokumenterError = (state: RootState) => state.dokumenter.error;
