import { createAction, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootStateOrAny } from "react-redux";
import { ActionsObservable, ofType, StateObservable } from "redux-observable";
import { of, timer } from "rxjs";
import { catchError, map, retryWhen, switchMap, timeout, withLatestFrom } from "rxjs/operators";
import { provIgjenStrategi } from "../../utility/rxUtils";
import { ReactNode } from "react";
import { AjaxCreationMethod } from "rxjs/internal-compatibility";
import { settEnhetHandling } from "./meg";

const R = require("ramda");
const { ascend, descend, prop, sort } = R;

//==========
// Type defs
//==========
export interface OppgaveRad {
  id: string;
  person?: {
    fnr?: string;
    navn?: string;
  };
  type: string;
  versjon: number;
  tema: string;
  hjemmel: string;
  frist: string;
  saksbehandler: string;
}

export interface OppgaveRadMedFunksjoner extends OppgaveRad {
  settValgtOppgave: Function;
  utvidetProjeksjon: "UTVIDET" | boolean | undefined;
}

export interface Filter {
  /**
   * Navnet på filteret. Rendres i en liste av alle filtere som kan velges for kolonnen. Må være unik for alle
   * filtere i samme kolonne.
   */
  label: ReactNode;
  value?: string | temaType;
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
  start: number;
  side: number;
  totalAntall: number;
  tildeltSaksbehandler?: string | undefined;
  projeksjon?: string;
  feilmelding?: string | undefined;
}

export interface OppgaveRader {
  rader: Array<OppgaveRad> | [OppgaveRad];
  meta: Metadata;
}

export interface Transformasjoner {
  filtrering: {
    typer: string[] | Filter[];
    temaer: temaType[] | Filter[];
    hjemler: string[] | Filter[];
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
  tildeltSaksbehandler?: string;
  projeksjon?: string;
  transformasjoner: Transformasjoner;
}

//==========
// Reducer
//==========
export function MottatteRader(payload: RaderMedMetadataUtvidet, state: OppgaveState) {
  const {
    antallTreffTotalt,
    start,
    antall,
    projeksjon,
    tildeltSaksbehandler,
    transformasjoner,
  } = payload;
  state.transformasjoner = transformasjoner;
  const sorterEtterFrist = (dir: "synkende" | "stigende") =>
    (dir === "synkende" ? descend : ascend)(prop("frist"));
  let oppgaverMedFristIUnixtime = payload.oppgaver.map(function (rad) {
    return {
      ...rad,
      frist: new Date(rad.frist).getTime(),
    };
  });
  if (state.transformasjoner.sortering.frist === "synkende")
    state.rader = sort(sorterEtterFrist("synkende"), oppgaverMedFristIUnixtime);
  else state.rader = sort(sorterEtterFrist("stigende"), oppgaverMedFristIUnixtime);
  state.lasterData = true;
  state.meta.start = start;
  state.meta.totalAntall = antallTreffTotalt;
  state.meta.projeksjon = projeksjon;
  state.meta.tildeltSaksbehandler = tildeltSaksbehandler;
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
  return state;
}

export const oppgaveSlice = createSlice({
  name: "oppgaver",
  initialState: {
    rader: [],
    lasterData: true,
    meta: {
      antall: 0,
      totalAntall: 0,
      sider: 1,
      start: 0,
      side: 1,
    },
    transformasjoner: {
      filtrering: {
        typer: [],
        temaer: [],
        hjemler: [],
      },
      sortering: {
        frist: "stigende",
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
    HENTET_UGATTE: (state, action: PayloadAction<RaderMedMetadataUtvidet>) => {
      console.debug(action.payload);
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
  enhetId: string;
  projeksjon?: "UTVIDET";
  transformasjoner: Transformasjoner;
}

export type temaType = "Foreldrepenger" | "Dagpenger" | "Sykepenger" | undefined;

export default oppgaveSlice.reducer;

//==========
// Actions
//==========
export const { MOTTATT, FEILET, HENTET_UGATTE } = oppgaveSlice.actions;
export const enkeltOppgave = createAction<OppgaveParams>("oppgaver/HENT_ENKELTOPPGAVE");
export const oppgaveRequest = createAction<OppgaveParams>("oppgaver/HENT");
export const oppgaverUtsnitt = createAction<[OppgaveRad]>("oppgaver/UTSNITT");
export const oppgaveHentingFeilet = createAction("oppgaver/FEILET");
export const hentUtgatte = createAction<OppgaveParams>("oppgaver/HENT_UTGAATTE");

//==========
// Sortering og filtrering
//==========

export function buildQuery(url: string, data: OppgaveParams) {
  let filters = R.compose(
    R.join("&"),
    R.map(R.join("=")),
    R.map(R.map(encodeURIComponent)),
    R.toPairs,
    R.map(R.map(R.replace(/og/g, ","))),
    R.map(R.map(R.replace(/ /g, ""))),
    R.reject(R.equals([])),
    R.filter(R.identity)
  )(data.transformasjoner.filtrering || []);
  let query = [];
  query.push(`antall=${data.antall}`);
  query.push(`start=${data.start}`);
  query.push(`rekkefoelge=${data.transformasjoner.sortering.frist.toLocaleUpperCase()}`);
  if (data.projeksjon) query.push(`projeksjon=${data.projeksjon}`);
  if (data.tildeltSaksbehandler) {
    query.push(`tildeltSaksbehandler=${data.tildeltSaksbehandler}`);
    query.push(`erTildeltSaksbehandler=true`);
  } else query.push(`erTildeltSaksbehandler=false`);
  query.push(`enhetId=${data.enhetId}`);
  return `${url}?${filters}&${R.compose(R.join("&"))(query)}`;
}

//==========
// Epos
//==========

export function hentEnkeltOppgaveEpos(
  action$: ActionsObservable<PayloadAction<OppgaveParams>>,
  state$: StateObservable<RootStateOrAny>,
  { getJSON }: AjaxCreationMethod
) {
  return action$.pipe(
    ofType(enkeltOppgave.type),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      let rader = state.oppgaver.rader.slice();
      let oppgaveUrl = buildQuery(`/api/ansatte/${action.payload.ident}/oppgaver`, action.payload);
      const hentOppgaver = getJSON<RaderMedMetadata>(oppgaveUrl).pipe(
        timeout(5000),
        map((oppgaver) =>
          MOTTATT({
            start: action.payload.start,
            antall: action.payload.antall,
            tildeltSaksbehandler: action.payload.tildeltSaksbehandler,
            projeksjon: action.payload.projeksjon,
            transformasjoner: action.payload.transformasjoner,
            ...oppgaver,
          } as RaderMedMetadataUtvidet)
        )
      );
      return hentOppgaver.pipe(
        retryWhen(provIgjenStrategi()),
        catchError((error) => of(FEILET(error)))
      );
    })
  );
}

export function hentOppgaverEpos(
  action$: ActionsObservable<PayloadAction<OppgaveParams>>,
  state$: StateObservable<RootStateOrAny>,
  { getJSON }: AjaxCreationMethod
) {
  return action$.pipe(
    ofType(oppgaveRequest.type || settEnhetHandling.type),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      let oppgaveUrl = buildQuery(`/api/ansatte/${action.payload.ident}/oppgaver`, action.payload);
      const hentOppgaver = getJSON<RaderMedMetadata>(oppgaveUrl).pipe(
        timeout(5000),
        map((oppgaver) =>
          MOTTATT({
            start: action.payload.start,
            antall: action.payload.antall,
            tildeltSaksbehandler: action.payload.tildeltSaksbehandler,
            projeksjon: action.payload.projeksjon,
            transformasjoner: action.payload.transformasjoner,
            ...oppgaver,
          } as RaderMedMetadataUtvidet)
        )
      );
      return hentOppgaver.pipe(
        retryWhen(provIgjenStrategi()),
        catchError((error) => of(FEILET(error)))
      );
    })
  );
}

export function hentUtgaatteFristerEpos(
  action$: ActionsObservable<PayloadAction<OppgaveParams>>,
  state$: StateObservable<RootStateOrAny>,
  { getJSON }: AjaxCreationMethod
) {
  return action$.pipe(
    ofType(hentUtgatte.type),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      let oppgaveUrl = buildQuery(
        `/api/ansatte/${action.payload.ident}/antallutgaattefrister`,
        action.payload
      );
      const hentOppgaver = getJSON<RaderMedMetadata>(oppgaveUrl).pipe(
        timeout(5000),
        map((oppgaver) =>
          HENTET_UGATTE({
            start: action.payload.start,
            antall: action.payload.antall,
            tildeltSaksbehandler: action.payload.tildeltSaksbehandler,
            projeksjon: action.payload.projeksjon,
            transformasjoner: action.payload.transformasjoner,
            ...oppgaver,
          } as RaderMedMetadataUtvidet)
        )
      );
      return hentOppgaver.pipe(
        retryWhen(provIgjenStrategi()),
        catchError((error) => of(FEILET(error)))
      );
    })
  );
}

export const OPPGAVER_EPICS = [hentUtgaatteFristerEpos, hentOppgaverEpos];
