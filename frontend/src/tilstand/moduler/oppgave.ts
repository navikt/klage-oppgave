import { createAction, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootStateOrAny } from "react-redux";
import { ActionsObservable, ofType, StateObservable } from "redux-observable";
import { concat, of, timer } from "rxjs";
import {
  catchError,
  map,
  mergeMap,
  retryWhen,
  switchMap,
  timeout,
  withLatestFrom,
} from "rxjs/operators";
import { provIgjenStrategi } from "../../utility/rxUtils";
import { ReactNode } from "react";
import { AjaxCreationMethod } from "rxjs/internal-compatibility";
import { settEnhetHandling } from "./meg";
import { toasterSett, toasterSkjul } from "./toaster";
import { feiletHandling } from "./klagebehandling";
import { fradelMegHandling, PayloadType, tildelMegHandling } from "./saksbehandler";
import { settOppgaverFerdigLastet } from "./oppgavelaster";

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
  klagebehandlingVersjon: number;
  tema: string;
  hjemmel: string;
  frist: string | number;
  mottatt: string | number;
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
  value?: string;
}
export interface IKodeverkVerdi {
  id: string;
  navn: string;
  beskrivelse: string;
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
  utgaatteFrister?: number;
}

export interface OppgaveRader {
  rader: Array<OppgaveRad> | [OppgaveRad];
  meta: Metadata;
}

export interface Transformasjoner {
  filtrering: {
    typer: string[] | Filter[];
    temaer: string[] | Filter[];
    hjemler: string[] | Filter[];
  };
  sortering: {
    type: "frist" | "mottatt";
    frist: "synkende" | "stigende";
    mottatt: "synkende" | "stigende";
  };
}

export type OppgaveState = {
  rader?: OppgaveRad[];
  transformasjoner: Transformasjoner;
  meta: Metadata;
  lasterData: boolean;
  kodeverk: {
    id?: number;
    navn?: string;
    beskrivelse?: string;
  };
};

export interface RaderMedMetadata {
  antallTreffTotalt: number;
  klagebehandlinger: OppgaveRad[];
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

  // for API-sortering
  state.rader = payload.klagebehandlinger.map(function (rad) {
    return {
      ...rad,
      frist: new Date(rad.frist).getTime(),
      mottatt: new Date(rad.mottatt).getTime(),
    };
  });

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
  name: "klagebehandlinger",
  initialState: {
    rader: [],
    lasterData: true,
    kodeverk: {},
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
        type: "mottatt",
        frist: "stigende",
        mottatt: "stigende",
      },
    },
  } as OppgaveState,
  reducers: {
    HENT: (state) => {
      state.lasterData = true;
      return state;
    },
    SETT_LASTER: (state) => {
      state.lasterData = true;
      return state;
    },
    SETT_FERDIGLASTET: (state) => {
      state.lasterData = false;
      return state;
    },
    MOTTATT: (state, action: PayloadAction<RaderMedMetadataUtvidet>) => {
      if (action.payload) {
        state = MottatteRader(action.payload, state);
      }
      return state;
    },
    HENTET_UGATTE: (state, action: PayloadAction<RaderMedMetadataUtvidet>) => {
      state.meta = { ...state.meta, utgaatteFrister: action.payload.antall };
      return state;
    },
    HENTET_KODEVERK: (state, action: PayloadAction<any>) => {
      state.kodeverk = action.payload;
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
  fullforte?: string;
  transformasjoner: Transformasjoner;
}

export type temaType = string | undefined;

export default oppgaveSlice.reducer;

//==========
// Actions
//==========
export const { HENTET_KODEVERK, MOTTATT, FEILET, HENTET_UGATTE } = oppgaveSlice.actions;
export const enkeltOppgave = createAction<OppgaveParams>("klagebehandlinger/HENT_ENKELTOPPGAVE");
export const oppgaveRequest = createAction<OppgaveParams>("klagebehandlinger/HENT");
export const fullforteRequest = createAction<OppgaveParams>("klagebehandlinger/HENT_FULLFORTE");
export const oppgaverUtsnitt = createAction<[OppgaveRad]>("klagebehandlinger/UTSNITT");
export const oppgaveHentingFeilet = createAction("klagebehandlinger/FEILET");
export const hentUtgatte = createAction<OppgaveParams>("klagebehandlinger/HENT_UTGAATTE");
export const kodeverkRequest = createAction("klagebehandlinger/HENT_KODEVERK");

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
  query.push(`sortering=${data.transformasjoner.sortering.type.toLocaleUpperCase()}`);
  if (data.transformasjoner.sortering.type === "frist")
    query.push(`rekkefoelge=${data.transformasjoner.sortering.frist.toLocaleUpperCase()}`);
  else query.push(`rekkefoelge=${data.transformasjoner.sortering.mottatt.toLocaleUpperCase()}`);
  if (data.projeksjon) query.push(`projeksjon=${data.projeksjon}`);
  if (data.tildeltSaksbehandler) {
    query.push(`tildeltSaksbehandler=${data.tildeltSaksbehandler}`);
    query.push(`erTildeltSaksbehandler=true`);
  } else query.push(`erTildeltSaksbehandler=false`);
  query.push(`enhetId=${data.enhetId}`);
  let result = `${url}?${filters}&${R.compose(R.join("&"))(query)}`;
  result = result.replace("Sykepenger", "43"); //WIP for endring av dataparametre i API
  return result;
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
      let rader = state.klagebehandlinger.rader.slice();
      let oppgaveUrl = buildQuery(
        `/api/ansatte/${action.payload.ident}/klagebehandlinger`,
        action.payload
      );
      const hentOppgaver = getJSON<RaderMedMetadata>(oppgaveUrl).pipe(
        timeout(5000),
        map((klagebehandlinger) =>
          MOTTATT({
            start: action.payload.start,
            antall: action.payload.antall,
            tildeltSaksbehandler: action.payload.tildeltSaksbehandler,
            projeksjon: action.payload.projeksjon,
            transformasjoner: action.payload.transformasjoner,
            ...klagebehandlinger,
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

export function hentKodeverk(
  action$: ActionsObservable<PayloadAction<OppgaveParams>>,
  state$: StateObservable<RootStateOrAny>,
  { getJSON }: AjaxCreationMethod
) {
  return action$.pipe(
    ofType(kodeverkRequest.type),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      const hent = getJSON<any>("/api/kodeverk").pipe(
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

export function hentOppgaverEpos(
  action$: ActionsObservable<PayloadAction<OppgaveParams>>,
  state$: StateObservable<RootStateOrAny>,
  { getJSON }: AjaxCreationMethod
) {
  return action$.pipe(
    ofType(oppgaveRequest.type, settEnhetHandling.type),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      let oppgaveUrl = buildQuery(
        `/api/ansatte/${action.payload.ident}/klagebehandlinger`,
        action.payload
      );
      const hentOppgaver = getJSON<RaderMedMetadata>(oppgaveUrl)
        .pipe(
          timeout(5000),
          map((klagebehandlinger) =>
            MOTTATT({
              start: action.payload.start,
              antall: action.payload.antall,
              tildeltSaksbehandler: action.payload.tildeltSaksbehandler,
              projeksjon: action.payload.projeksjon,
              transformasjoner: action.payload.transformasjoner,
              ...klagebehandlinger,
            } as RaderMedMetadataUtvidet)
          )
        )
        .pipe(
          mergeMap((value) => {
            return concat([value, settOppgaverFerdigLastet()]);
          })
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
        `/api/ansatte/${action.payload.ident}/antallklagebehandlingermedutgaattefrister`,
        action.payload
      );
      const hentOppgaver = getJSON<{ antall: number }>(oppgaveUrl).pipe(
        timeout(5000),
        map((response) =>
          HENTET_UGATTE({
            antall: response.antall,
          } as RaderMedMetadataUtvidet)
        )
      );
      return hentOppgaver.pipe(
        retryWhen(provIgjenStrategi()),
        catchError((error) => {
          let err = error?.response?.detail || "ukjent feil";
          return concat([
            feiletHandling(err),
            toasterSett({
              display: true,
              type: "feil",
              feilmelding: `Henting av utgått frister feilet (${err})`,
            }),
            toasterSkjul(),
          ]);
        })
      );
    })
  );
}

export const OPPGAVER_EPICS = [hentKodeverk, hentUtgaatteFristerEpos, hentOppgaverEpos];
