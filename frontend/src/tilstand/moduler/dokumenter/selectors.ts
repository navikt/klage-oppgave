import { RootState } from "../../root";

export const velgDokumenter = (state: RootState) => state.dokumenter.dokumenter;
export const velgDokumenterPageReference = (state: RootState) => state.dokumenter.pageReference;
export const velgTilknyttedeDokumenter = (state: RootState) =>
  state.dokumenter.tilknyttedeDokumenter;
export const velgDokumenterLoading = (state: RootState) => state.dokumenter.loading;
export const velgDokumenterError = (state: RootState) => state.dokumenter.error;
