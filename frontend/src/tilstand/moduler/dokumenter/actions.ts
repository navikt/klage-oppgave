import { createAction } from "@reduxjs/toolkit";
import { IDokument } from "./stateTypes";
import { IDokumenterParams } from "./types";

export const hentDokumenter = createAction<IDokumenterParams>("dokumenter/HENT");
export const hentTilknyttedeDokumenter = createAction<string>("dokumenter/HENT_TILKNYTTEDE");

export const tilknyttDokument = createAction<IDokument>("dokumenter/TILKNYTT");
export const frakobleDokument = createAction<IDokument>("dokumenter/FRAKOBLE");
