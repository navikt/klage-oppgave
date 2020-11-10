import { createAction, createSlice, PayloadAction } from "@reduxjs/toolkit";
import axios from "../konfigurerAxios";
import { RootStateOrAny } from "react-redux";
import { ActionsObservable, ofType, StateObservable } from "redux-observable";
import { of } from "rxjs";
import { catchError, map, retryWhen, switchMap, withLatestFrom } from "rxjs/operators";
import { provIgjenStrategi } from "../../utility/rxUtils";
import { ReactNode } from "react";
import { AjaxCreationMethod } from "rxjs/internal-compatibility";

//==========
// Type defs
//==========
export interface OppgaveRad {
  id: string;
  bruker: {
    fnr: string;
    navn: string;
  };
  type: string;
  versjon: number;
  ytelse: string;
  hjemmel: string;
  frist: string;
  saksbehandler: string;
  settValgOppgave: Function;
}

export interface Filter {
  /**
   * Navnet på filteret. Rendres i en liste av alle filtere som kan velges for kolonnen. Må være unik for alle
   * filtere i samme kolonne.
   */
  label: ReactNode;
}

export interface Filtrering {
  /**
   * Aktive filtere som brukes til å filtrere rader i tabellen.
   */
  filtere: {
    filter: Filter;
    kolonne: number;
    active: boolean;
  }[];
}

interface Metadata {
  antall: number;
  sider: number;
  treffPerSide: number;
  side: number;
  feilmelding?: string | undefined;
}

export interface OppgaveRader {
  rader: [OppgaveRad];
  meta: Metadata;
}

export interface Transformasjoner {
  filtrering?: {
    type?: undefined | string[] | Filter[];
    ytelse?: undefined | string[] | Filter[];
    hjemmel?: undefined | string[] | Filter[];
  };
  sortering: {
    frist: "synkende" | "stigende";
  };
}

type OppgaveState = {
  rader?: OppgaveRad[];
  transformasjoner: Transformasjoner;
  meta: Metadata;
  lasterData: boolean;
};

export interface RaderMedMetadata {
  antallTreffTotalt: number;
  oppgaver: OppgaveRad[];
}

//==========
// Reducer
//==========
export const oppgaveSlice = createSlice({
  name: "oppgaver",
  initialState: {
    rader: [],
    lasterData: true,
    meta: {
      antall: 0,
      sider: 1,
      treffPerSide: 10,
      side: 1,
    },
    transformasjoner: {
      filtrering: {
        type: undefined,
        ytelse: undefined,
        hjemmel: undefined,
      },
      sortering: {
        frist: "synkende",
      },
    },
  } as OppgaveState,
  reducers: {
    MOTTATT: (state, action: PayloadAction<RaderMedMetadata>) => {
      if (action.payload) {
        const antall = action.payload.antallTreffTotalt;
        const t = state.meta.treffPerSide;
        state.rader = action.payload.oppgaver;
        state.meta.antall = antall;
        state.meta.sider = Math.floor(antall / t) + (antall % t !== 0 ? 1 : 0);
        state.lasterData = false;
        state.meta.feilmelding = undefined;
      }
      return state;
    },
    FEILET: (state, action: PayloadAction<string>) => {
      state.meta.feilmelding = "Oppgave-henting feilet";
      state.lasterData = false;
      return state;
    },
    SETT_SIDE: (state, action: PayloadAction<number>) => {
      state.meta.side = action.payload;
      const t = state.meta.treffPerSide;
      const antall = state.rader?.length;
      if (antall) {
        state.meta.antall = antall;
        state.meta.sider = Math.floor(antall / t) + (antall % t !== 0 ? 1 : 0);
      } else {
        state.meta.antall = 0;
        state.meta.sider = 1;
      }
      return state;
    },
  },
});

interface RadMedTransformasjoner {
  transformasjoner: Transformasjoner;
  rader: [OppgaveRad];
}

export interface OppgaveParams {
  ident: string;
  start: number;
  antall: number;
  transformasjoner: Transformasjoner;
}

export type ytelseType = ["Foreldrepenger"] | ["Dagpenger"] | ["Sykepenger"] | undefined;

export default oppgaveSlice.reducer;

//==========
// Actions
//==========
export const { MOTTATT, SETT_SIDE, FEILET } = oppgaveSlice.actions;
export const oppgaveRequest = createAction<OppgaveParams>("oppgaver/HENT");
export const settSide = createAction<number>("oppgaver/SETT_SIDE");
export const oppgaverUtsnitt = createAction<[OppgaveRad]>("oppgaver/UTSNITT");
export const oppgaveHentingFeilet = createAction("oppgaver/FEILET");

//==========
// Sortering og filtrering
//==========
export function buildQuery(url: string, data: OppgaveParams) {
  let query = [];
  for (let key in data.transformasjoner?.filtrering) {
    if (data.transformasjoner?.filtrering.hasOwnProperty(key)) {
      if (Array.isArray(data.transformasjoner.filtrering[key])) {
        query.push(
          encodeURIComponent(key) +
            "=" +
            encodeURIComponent(data.transformasjoner.filtrering[key].join(","))
        );
      } else
        query.push(
          encodeURIComponent(key) + "=" + encodeURIComponent(data.transformasjoner.filtrering[key])
        );
    }
  }
  return `${url}?${query.join("&")}&antall=${data.antall}&start=${
    data.start
  }&rekkefoelge=${data.transformasjoner.sortering.frist.toLocaleUpperCase()}`;
}

//==========
// Epos
//==========
export function hentOppgaverEpos(
  action$: ActionsObservable<PayloadAction<OppgaveParams>>,
  state$: StateObservable<RootStateOrAny>,
  { getJSON }: AjaxCreationMethod
) {
  return action$.pipe(
    ofType(oppgaveRequest.type),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      let rader = state.oppgaver.rader.slice();
      let oppgaveUrl = buildQuery(
        `/api/ansatte/${action.payload.ident}/ikketildelteoppgaver`,
        action.payload
      );
      const hentOppgaver = getJSON<RaderMedMetadata>(oppgaveUrl).pipe(
        map((oppgaver) => MOTTATT(oppgaver))
      );
      return hentOppgaver.pipe(
        retryWhen(provIgjenStrategi()),
        catchError((error) => of(FEILET(error)))
      );
    })
  );
}

export const OPPGAVER_EPICS = [hentOppgaverEpos];
