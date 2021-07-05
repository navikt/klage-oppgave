import { createSlice, PayloadAction } from "@reduxjs/toolkit";
// import { dokumentMatcher } from "../../../komponenter/Klagebehandling/Dokumenter/helpers";
import {
  // frakobleDokumentEpic,
  hentDokumenterEpic,
  hentTilknyttedeDokumenterEpic,
  loadingDokumenterEpic,
  loadingTilknyttedeDokumenterEpic,
  // tilknyttDokumentEpic,
} from "./epics";
import { initialState } from "./initialState";
import { IDokument } from "./stateTypes";
import { IDokumenterRespons } from "./types";

const sorterSynkendePaaRegistrert = (dokumenter: IDokument[]) => {
  if (dokumenter.length === 0) {
    return [];
  }
  return dokumenter.sort((a, b) => {
    if (a.registrert > b.registrert) {
      return -1;
    }
    if (a.registrert < b.registrert) {
      return 1;
    }
    return 0;
  });
};

export const dokumenterSlice = createSlice({
  name: "dokumenter",
  initialState,
  reducers: {
    NULLSTILL_DOKUMENTER: (state) => ({
      ...state,
      ...initialState,
    }),
    LEGG_TIL_DOKUMENTER: (state, { payload }: PayloadAction<IDokumenterRespons>) => {
      state.dokumenter.pageReference = payload.pageReference;
      state.dokumenter.totaltAntall = payload.totaltAntall;
      state.dokumenter.dokumenter = [...state.dokumenter.dokumenter, ...payload.dokumenter];
      state.dokumenter.loading = false;
      return state;
    },
    SETT_TILKNYTTEDE_DOKUMENTER: (state, { payload }: PayloadAction<IDokument[]>) => {
      state.tilknyttedeDokumenter.dokumenter = sorterSynkendePaaRegistrert(payload);
      state.tilknyttedeDokumenter.loading = false;
      return state;
    },
    // TILKNYTT_DOKUMENT: (state, { payload }: PayloadAction<IDokument>) => {
    //   const exists = state.tilknyttedeDokumenter.dokumenter.some((tilknyttet) =>
    //     dokumentMatcher(tilknyttet, payload)
    //   );
    //   if (exists) {
    //     return state;
    //   }
    //   state.tilknyttedeDokumenter.dokumenter = sorterSynkendePaaRegistrert([
    //     ...state.tilknyttedeDokumenter.dokumenter,
    //     payload,
    //   ]);
    //   return state;
    // },
    // FRAKOBLE_DOKUMENT: (state, { payload }: PayloadAction<IDokument>) => {
    //   state.tilknyttedeDokumenter.dokumenter = state.tilknyttedeDokumenter.dokumenter.filter(
    //     (tilknyttet) => !dokumentMatcher(tilknyttet, payload)
    //   );
    //   return state;
    // },
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
  // TILKNYTT_DOKUMENT,
  // FRAKOBLE_DOKUMENT,
  SETT_TILKNYTTEDE_DOKUMENTER,
} = dokumenterSlice.actions;

export const DOKUMENTER_EPICS = [
  hentDokumenterEpic,
  hentTilknyttedeDokumenterEpic,
  loadingDokumenterEpic,
  loadingTilknyttedeDokumenterEpic,
  // tilknyttDokumentEpic,
  // frakobleDokumentEpic,
];

export const dokumenter = dokumenterSlice.reducer;
