import { createAction } from "@reduxjs/toolkit";
import { IDokument } from "../dokumenter/stateTypes";
import { IKlagebehandlingOppdatering } from "./types";

export const lagreKlagebehandling =
  createAction<IKlagebehandlingOppdatering>("klagebehandling/LAGRE");
export const hentKlagebehandling = createAction<string>("klagebehandling/HENT");

export const unloadKlagebehandling = createAction("klagebehandling/UNLOAD");

// export const tilknyttDokument = createAction<IDokument>("klagebehandling/TILKNYTT");
// export const frakobleDokument = createAction<IDokument>("klagebehandling/FRAKOBLE");
