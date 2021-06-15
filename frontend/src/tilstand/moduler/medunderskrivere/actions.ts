import { createAction } from "@reduxjs/toolkit";
import { IMedunderskrivereInput, ISettMedunderskriverParams } from "./types";

export const lastMedunderskrivere = createAction<IMedunderskrivereInput>(
  "medunderskrivere/LAST_MEDUNDERSKRIVERE"
);
export const settMedunderskriver = createAction<ISettMedunderskriverParams>(
  "medunderskrivere/SETT_MEDUNDERSKRIVER"
);
