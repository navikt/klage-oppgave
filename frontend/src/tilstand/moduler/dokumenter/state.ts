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
      dokumenter: [],
      loading: false,
    }),
    LEGG_TIL_DOKUMENTER: (state, action: PayloadAction<IDokumenterRespons>) => ({
      ...state,
      dokumenter: [...state.dokumenter, ...action.payload.dokumenter],
      pageReference: action.payload.pageReference,
      loading: false,
    }),
    TILKNYTT_DOKUMENT: (state, action: PayloadAction<IDokument>) => {
      state.tilknyttedeDokumenter.push(action.payload);
      return state;
    },
    FRAKOBLE_DOKUMENT: (state, { payload }: PayloadAction<IDokument>) => {
      state.tilknyttedeDokumenter = state.tilknyttedeDokumenter.filter(
        ({ dokumentInfoId, journalpostId }) =>
          dokumentInfoId !== payload.dokumentInfoId || journalpostId !== payload.journalpostId
      );
      return state;
    },
    SETT_TILKNYTTEDE_DOKUMENTER: (state, action: PayloadAction<IDokument[]>) => {
      state.tilknyttedeDokumenter = action.payload;
      return state;
    },
    LOADING: (state) => ({ ...state, loading: true }),
    ERROR: (state, action: PayloadAction<string>) => ({
      ...state,
      error: action.payload,
      loading: false,
    }),
  },
});

export const {
  LEGG_TIL_DOKUMENTER,
  LOADING,
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
