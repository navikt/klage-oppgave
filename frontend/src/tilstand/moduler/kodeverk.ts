import { createAction, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ActionsObservable, ofType, StateObservable } from "redux-observable";
import { of } from "rxjs";
import { catchError, map, retryWhen, switchMap, timeout } from "rxjs/operators";
import { provIgjenStrategi } from "../../utility/rxUtils";
import { GrunnerPerUtfall } from "./klagebehandling";
import { Dependencies } from "../konfigurerTilstand";
import { RootState } from "../root";

//==========
// Type defs
//==========

export interface IKodeverkVerdi {
  id: string;
  navn: string;
  beskrivelse: string;
}

export interface IKodeverkVerdiMedHjemler {
  hjemler: IKodeverkVerdi[];
  temaId: string;
}

export interface IKodeverk {
  hjemmel: IKodeverkVerdi[];
  type: IKodeverkVerdi[];
  utfall: IKodeverkVerdi[];
  grunnerPerUtfall: GrunnerPerUtfall[];
  hjemlerPerTema: IKodeverkVerdiMedHjemler[];
  hjemler: IKodeverkVerdi[];
  tema: IKodeverkVerdi[];
}

export type IKodeverkState = {
  lasterKodeverk: boolean;
  kodeverk: IKodeverk;
};

//==========
// Reducer
//==========

const initialState: IKodeverkState = {
  lasterKodeverk: true,
  kodeverk: {
    utfall: [{ id: "", navn: "", beskrivelse: "" }],
    hjemler: [{ id: "", navn: "", beskrivelse: "" }],
    hjemlerPerTema: [{ temaId: "", hjemler: [{ id: "", navn: "", beskrivelse: "" }] }],
    hjemmel: [{ id: "", navn: "", beskrivelse: "" }],
    type: [{ id: "", navn: "", beskrivelse: "" }],
    tema: [{ id: "", navn: "", beskrivelse: "" }],
    grunnerPerUtfall: [{ utfallId: "", grunner: [{ id: "", navn: "", beskrivelse: "" }] }],
  },
};

export const kodeverkSlice = createSlice({
  name: "kodeverk",
  initialState,
  reducers: {
    HENT: (state) => {
      state.lasterKodeverk = true;
      return state;
    },
    HENTET_KODEVERK: (state, action: PayloadAction<IKodeverk>) => {
      state.kodeverk = action.payload;
      state.lasterKodeverk = false;
      return state;
    },
    FEILET: (state, action: PayloadAction<string>) => {
      state.lasterKodeverk = false;
      return state;
    },
  },
});

export default kodeverkSlice.reducer;

//==========
// Actions
//==========
export const { HENT, HENTET_KODEVERK, FEILET } = kodeverkSlice.actions;

export const hentKodeverk = createAction("klagebehandlinger/HENT_KODEVERK");

//==========
// Epos
//==========

export function hentKodeverkEpos(
  action$: ActionsObservable<PayloadAction<never>>,
  state$: StateObservable<RootState>,
  { ajax }: Dependencies
) {
  return action$.pipe(
    ofType(hentKodeverk.type),
    switchMap(() => {
      const hent = ajax.getJSON<IKodeverk>("/api/kodeverk").pipe(
        timeout(5000),
        map((kodeverk) => HENTET_KODEVERK(kodeverk))
      );
      return hent.pipe(
        retryWhen(provIgjenStrategi()),
        catchError((error) => of(FEILET(error)))
      );
    })
  );
}

export const KODEVERK_EPICS = [hentKodeverkEpos];
