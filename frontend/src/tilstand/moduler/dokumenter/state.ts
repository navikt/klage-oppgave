import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  frakobleDokumentEpic,
  hentDokumenterEpic,
  hentTilknyttedeDokumenterEpic,
  loadingDokumenterEpic,
  tilknyttDokumentEpic,
} from "./epics";
import { initialState } from "./initialState";
import { IDokument } from "./stateTypes";
import { IDokumenterRespons } from "./types";

export const dokumenterSlice = createSlice({
  name: "dokumenter",
  initialState,
  reducers: {
    NULLSTILL_DOKUMENTER: (state) => ({
      ...state,
      ...initialState,
    }),
    LEGG_TIL_DOKUMENTER: (state, { payload }: PayloadAction<IDokumenterRespons>) => {
      state.pageReference = payload.pageReference;
      state.dokumenter.dokumenter = payload.dokumenter;
      state.dokumenter.loading = false;
      return state;
    },
    SETT_TILKNYTTEDE_DOKUMENTER: (state, action: PayloadAction<IDokument[]>) => {
      state.tilknyttedeDokumenter.dokumenter = action.payload;
      state.tilknyttedeDokumenter.loading = false;
      return state;
    },
    TILKNYTT_DOKUMENT: (state, { payload }: PayloadAction<IDokument>) => {
      const exists = state.tilknyttedeDokumenter.dokumenter.some(
        (e) =>
          e.dokumentInfoId === payload.dokumentInfoId && e.journalpostId === payload.journalpostId
      );
      if (exists) {
        return state;
      }
      state.tilknyttedeDokumenter.dokumenter.push(payload);
      return state;
    },
    FRAKOBLE_DOKUMENT: (state, { payload }: PayloadAction<IDokument>) => {
      state.tilknyttedeDokumenter.dokumenter = state.tilknyttedeDokumenter.dokumenter.filter(
        ({ dokumentInfoId, journalpostId }) =>
          !(dokumentInfoId === payload.dokumentInfoId && journalpostId === payload.journalpostId)
      );
      return state;
    },
    DOKUMENTER_LOADING: (state) => {
      state.dokumenter.loading = true;
      return state;
    },
    TILKNYTTEDE_DOKUMENTER_LOADING: (state) => {
      state.tilknyttedeDokumenter.loading = true;
      return state;
    },
    ERROR: (state, action: PayloadAction<string>) => ({
      ...state,
      error: action.payload,
      loading: false,
    }),
  },
});

export const {
  LEGG_TIL_DOKUMENTER,
  DOKUMENTER_LOADING,
  TILKNYTTEDE_DOKUMENTER_LOADING,
  ERROR,
  NULLSTILL_DOKUMENTER,
  TILKNYTT_DOKUMENT,
  FRAKOBLE_DOKUMENT,
  SETT_TILKNYTTEDE_DOKUMENTER,
} = dokumenterSlice.actions;

export const DOKUMENTER_EPICS = [
  hentDokumenterEpic,
  hentTilknyttedeDokumenterEpic,
  tilknyttDokumentEpic,
  frakobleDokumentEpic,
  loadingDokumenterEpic,
];

export const dokumenter = dokumenterSlice.reducer;
