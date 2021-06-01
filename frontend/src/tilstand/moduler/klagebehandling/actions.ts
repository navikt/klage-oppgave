import { createAction } from "@reduxjs/toolkit";
import { IKlagebehandlingOppdatering } from "./types";

export const lagreKlagebehandling =
  createAction<IKlagebehandlingOppdatering>("klagebehandling/LAGRE");
export const hentKlagebehandling = createAction<string>("klagebehandling/HENT");
