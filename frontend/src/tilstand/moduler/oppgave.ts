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
  value?: string;
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
    typer?: undefined | string[] | Filter[];
    ytelser?: undefined | ytelseType[] | Filter[];
    hjemler?: undefined | string[] | Filter[];
  };
  sortering: {
    frist: "synkende" | "stigende";
  };
}

export type OppgaveState = {
  rader?: OppgaveRad[];
  transformasjoner: Transformasjoner;
  meta: Metadata;
  lasterData: boolean;
};

export interface RaderMedMetadata {
  antallTreffTotalt: number;
  oppgaver: OppgaveRad[];
}

export interface RaderMedMetadataUtvidet extends RaderMedMetadata {
  start: number;
  antall: number;
  transformasjoner: Transformasjoner;
}

//==========
// Reducer
//==========
export function MottatteRader(payload: RaderMedMetadataUtvidet, state: OppgaveState) {
  const { antallTreffTotalt, start, antall } = payload;
  state.rader = payload.oppgaver;
  state.lasterData = false;
  state.meta.antall = antall;
  if (start === 0) {
    state.meta.side = 1;
  } else {
    state.meta.side = start / antall + 1;
  }
  state.meta.sider =
    Math.floor(antallTreffTotalt / antall) + (antallTreffTotalt % antall !== 0 ? 1 : 0);
  state.lasterData = false;
  state.meta.feilmelding = undefined;
  state.transformasjoner = payload.transformasjoner;
  return state;
}

export const oppgaveSlice = createSlice({
  name: "oppgaver",
  initialState: {
    rader: [],
    lasterData: false,
    meta: {
      antall: 0,
      sider: 1,
      treffPerSide: 15,
      side: 1,
    },
    transformasjoner: {
      filtrering: {
        typer: undefined,
        ytelser: undefined,
        hjemler: undefined,
      },
      sortering: {
        frist: "synkende",
      },
    },
  } as OppgaveState,
  reducers: {
    HENT: (state) => {
      state.lasterData = true;
      return state;
    },
    MOTTATT: (state, action: PayloadAction<RaderMedMetadataUtvidet>) => {
      if (action.payload) {
        state = MottatteRader(action.payload, state);
      }
      return state;
    },
    FEILET: (state, action: PayloadAction<string>) => {
      state.meta.feilmelding = "Oppgave-henting feilet";
      state.lasterData = false;
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
  tildeltSaksbehandler?: string;
  projeksjon?: "UTVIDET";
  transformasjoner: Transformasjoner;
}

export type ytelseType = ["Foreldrepenger"] | ["Dagpenger"] | ["Sykepenger"] | undefined;

export default oppgaveSlice.reducer;

//==========
// Actions
//==========
export const { MOTTATT, FEILET } = oppgaveSlice.actions;
export const oppgaveRequest = createAction<OppgaveParams>("oppgaver/HENT");
export const oppgaverUtsnitt = createAction<[OppgaveRad]>("oppgaver/UTSNITT");
export const oppgaveHentingFeilet = createAction("oppgaver/FEILET");

//==========
// Sortering og filtrering
//==========

export function buildQuery(url: string, data: OppgaveParams) {
  const { filter, replace, identity, compose, join, map, toPairs } = require("ramda");
  const filters = compose(
    join("&"), // Join each segment of the query with '&'
    map(join("=")), // Join the key-value pairs with '='
    map(map(encodeURIComponent)), // encode keys and values
    toPairs, // convert the object to pairs like `['limit', 5]`
    map(map(replace(/og/g, ","))),
    map(map(replace(/ /g, ""))),
    filter(identity)
  )(data.transformasjoner.filtrering || []);

  let query = [];
  query.push(`antall=${data.antall}`);
  query.push(`start=${data.start}`);
  query.push(`rekkefoelge=${data.transformasjoner.sortering.frist.toLocaleUpperCase()}`);
  if (data.projeksjon) query.push(`projeksjon=${data.projeksjon}`);
  if (data.tildeltSaksbehandler) query.push(`tildeltSaksbehandler=${data.tildeltSaksbehandler}`);
  return `${url}?${filters}&${compose(join("&"))(query)}`;
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
      let oppgaveUrl = buildQuery(`/api/ansatte/${action.payload.ident}/oppgaver`, action.payload);
      const hentOppgaver = getJSON<RaderMedMetadata>(oppgaveUrl).pipe(
        map((oppgaver) =>
          MOTTATT({
            start: action.payload.start,
            antall: action.payload.antall,
            transformasjoner: action.payload.transformasjoner,
            ...oppgaver,
          })
        )
      );
      return hentOppgaver.pipe(
        retryWhen(provIgjenStrategi()),
        catchError((error) => of(FEILET(error)))
      );
    })
  );
}

export const OPPGAVER_EPICS = [hentOppgaverEpos];
