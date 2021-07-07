import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { initialState } from "./initialState";
import { IKlagebehandling, TilknyttetDokument } from "./stateTypes";
import {
  IKlagebehandlingOppdatering,
  IKlagebehandlingOppdateringResponse,
  IMedunderskriverSatt,
  IVedleggResponse,
  IVedtakFullfoertResponse,
} from "./types";
import { dokumentMatcher } from "../../../komponenter/Klagebehandling/Dokumenter/helpers";

export const klagebehandlingSlice = createSlice({
  name: "klagebehandling",
  initialState,
  reducers: {
    UNLOAD_KLAGEBEHANDLING: (state) => ({
      ...state,
      ...initialState,
    }),
    SETT_KLAGEBEHANDLING: (state, { payload }: PayloadAction<IKlagebehandling>) => ({
      ...state,
      lagretVersjon: createLagretVersjon({ ...payload, klagebehandlingId: payload.id }),
      klagebehandling: payload,
    }),
    OPPDATER_KLAGEBEHANDLING: (state, action: PayloadAction<Partial<IKlagebehandling>>) => {
      if (state.klagebehandling === null) {
        return state;
      }
      return {
        ...state,
        klagebehandling: { ...state.klagebehandling, ...action.payload },
      };
    },
    KLAGEBEHANDLING_LAGRET: (
      state,
      { payload }: PayloadAction<IKlagebehandlingOppdateringResponse & IKlagebehandlingOppdatering>
    ) => {
      if (state.klagebehandling === null) {
        return state;
      }
      return {
        ...state,
        lagretVersjon: createLagretVersjon(payload),
        klagebehandling: {
          ...state.klagebehandling,
          klagebehandlingVersjon: payload.klagebehandlingVersjon,
          modified: payload.modified,
        },
      };
    },
    TILKNYTT_DOKUMENT: (state, { payload }: PayloadAction<TilknyttetDokument>) => {
      if (state.klagebehandling === null) {
        return state;
      }
      const exists = state.klagebehandling.tilknyttedeDokumenter.some((tilknyttet) =>
        dokumentMatcher(tilknyttet, payload)
      );
      if (exists) {
        return state;
      }
      state.klagebehandling.tilknyttedeDokumenter.push(payload);
      return state;
    },
    FRAKOBLE_DOKUMENT: (state, { payload }: PayloadAction<TilknyttetDokument>) => {
      if (state.klagebehandling === null) {
        return;
      }

      state.klagebehandling.tilknyttedeDokumenter =
        state.klagebehandling.tilknyttedeDokumenter.filter(
          (tilknyttet) => !dokumentMatcher(tilknyttet, payload)
        );
      return state;
    },
    MEDUNDERSKRIVER_SATT: (state, { payload }: PayloadAction<IMedunderskriverSatt>) => {
      if (state.klagebehandling === null) {
        return state;
      }
      state.klagebehandling.medunderskriverident = payload.medunderskriverident;
      state.klagebehandling.datoSendtMedunderskriver = payload.datoSendtMedunderskriver;
      state.klagebehandling.klagebehandlingVersjon = payload.klagebehandlingVersjon;
      state.klagebehandling.modified = payload.modified;
      return state;
    },
    VEDLEGG_OPPDATERT: (state, action: PayloadAction<IVedleggResponse>) => {
      if (state.klagebehandling === null) {
        return state;
      }
      const [vedtak] = state.klagebehandling.vedtak;
      if (typeof vedtak !== "undefined") {
        const { klagebehandlingVersjon, modified, file } = action.payload;
        state.klagebehandling.klagebehandlingVersjon = klagebehandlingVersjon;
        state.klagebehandling.modified = modified;
        vedtak.file = file;
      }
      return state;
    },
    VEDTAK_FULLFOERT: (state, { payload }: PayloadAction<IVedtakFullfoertResponse>) => {
      if (state.klagebehandling === null) {
        return state;
      }
      state.klagebehandling.avsluttetAvSaksbehandler = payload.avsluttetAvSaksbehandler;
      state.klagebehandling.klagebehandlingVersjon = payload.klagebehandlingVersjon;
      state.klagebehandling.modified = payload.modified;
      const [vedtak] = state.klagebehandling.vedtak;
      if (typeof vedtak !== "undefined") {
        vedtak.ferdigstilt = payload.ferdigstilt;
      }
      return state;
    },
    OPPTATT: (state) => ({ ...state, opptatt: true }),
    LEDIG: (state) => ({ ...state, opptatt: false }),
    ERROR: (state, { payload }: PayloadAction<string>) => ({ ...state, error: payload }),
  },
});

export const {
  UNLOAD_KLAGEBEHANDLING,
  SETT_KLAGEBEHANDLING,
  OPPDATER_KLAGEBEHANDLING,
  TILKNYTT_DOKUMENT,
  FRAKOBLE_DOKUMENT,
  KLAGEBEHANDLING_LAGRET,
  VEDLEGG_OPPDATERT,
  VEDTAK_FULLFOERT,
  MEDUNDERSKRIVER_SATT,
  OPPTATT,
  LEDIG,
  ERROR,
} = klagebehandlingSlice.actions;

export const klagebehandling = klagebehandlingSlice.reducer;

const createLagretVersjon = ({
  internVurdering,
  klagebehandlingId,
  klagebehandlingVersjon,
  tilknyttedeDokumenter,
  vedtak,
}: IKlagebehandlingOppdatering) => ({
  internVurdering,
  klagebehandlingId,
  klagebehandlingVersjon,
  tilknyttedeDokumenter,
  vedtak,
});
