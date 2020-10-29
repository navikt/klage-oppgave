import { createAction, createSlice, PayloadAction } from "@reduxjs/toolkit";
import axios from "../konfigurerAxios";
import { RootStateOrAny } from "react-redux";
import { ActionsObservable, ofType, StateObservable } from "redux-observable";
import { of } from "rxjs";
import { catchError, map, retryWhen, switchMap, withLatestFrom } from "rxjs/operators";
import { provIgjenStrategi } from "../../utility/rxUtils";

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

interface Metadata {
  antall: number;
  sider: number;
  treffPerSide: number;
  side: number;
  feilmelding?: string | undefined;
}

export interface OppgaveRader {
  utsnitt: [OppgaveRad];
  meta: Metadata;
}

export interface Transformasjoner {
  filtrering?: {
    type?: undefined | string;
    ytelse?: undefined | string;
    hjemmel?: undefined | string;
  };
  sortering: {
    frist: "ASC" | "DESC" | undefined;
  };
}

type OppgaveState = {
  rader?: [OppgaveRad?];
  utsnitt?: [OppgaveRad?];
  transformasjoner: Transformasjoner;
  meta: Metadata;
  lasterData: boolean;
};

//==========
// Reducer
//==========
export const oppgaveSlice = createSlice({
  name: "oppgaver",
  initialState: {
    rader: [],
    utsnitt: [],
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
        frist: undefined,
      },
    },
  } as OppgaveState,
  reducers: {
    MOTTATT: (state, action: PayloadAction<[OppgaveRad]>) => {
      if (action.payload) {
        const antall = action.payload.length;
        const t = state.meta.treffPerSide;
        state.rader = action.payload;
        state.utsnitt = action.payload;
        state.meta.antall = antall;
        state.meta.sider = Math.floor(antall / t) + (antall % t !== 0 ? 1 : 0);
        state.lasterData = false;
        state.meta.feilmelding = undefined;
      }
      return state;
    },
    UTSNITT: (state, action: PayloadAction<RadMedTransformasjoner>) => {
      state.transformasjoner = action.payload.transformasjoner;
      state.utsnitt = action.payload.utsnitt;
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
      const antall = state.utsnitt?.length;
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
  utsnitt: [OppgaveRad];
}

export default oppgaveSlice.reducer;

//==========
// Actions
//==========
export const { MOTTATT, UTSNITT, SETT_SIDE, FEILET } = oppgaveSlice.actions;
export const oppgaveRequest = createAction("oppgaver/HENT");
export const settSide = createAction<number>("oppgaver/SETT_SIDE");
export const oppgaverUtsnitt = createAction<[OppgaveRad]>("oppgaver/UTSNITT");
export const oppgaveHentingFeilet = createAction<string>("oppgaver/FEILET");

export const oppgaveTransformerRader = createAction<Transformasjoner>("oppgaver/TRANSFORMER_RADER");

//==========
// Sortering og filtrering
//==========
function sorterASC(utsnitt: Array<OppgaveRad> | any) {
  return utsnitt.slice().sort(function (a: any, b: any) {
    return new Date(a.frist).getTime() - new Date(b.frist).getTime();
  });
}

function sorterDESC(utsnitt: Array<OppgaveRad> | any) {
  return utsnitt.slice().sort(function (a: any, b: any) {
    return new Date(b.frist).getTime() - new Date(a.frist).getTime();
  });
}

function filtrerHjemmel(utsnitt: Array<OppgaveRad> | any, hjemmel: string | undefined) {
  return utsnitt.slice().filter((rad: OppgaveRad) => {
    if (hjemmel === undefined) {
      return rad;
    } else {
      return rad.hjemmel.split(" ").includes(hjemmel);
    }
  });
}

function filtrerType(utsnitt: Array<OppgaveRad> | any, type: string | undefined) {
  return utsnitt.slice().filter((rad: OppgaveRad) => {
    if (type === undefined) {
      return rad;
    } else {
      return rad.type.toLocaleLowerCase() === type.toLocaleLowerCase();
    }
  });
}

function filtrerYtelse(utsnitt: Array<OppgaveRad> | any, ytelse: string | undefined) {
  return utsnitt.slice().filter((rad: OppgaveRad) => {
    if (ytelse === undefined) {
      return rad;
    } else {
      return rad.ytelse === ytelse;
    }
  });
}

//==========
// Epos
//==========
export function oppgaveTransformerEpos(
  action$: ActionsObservable<PayloadAction<Transformasjoner>>,
  state$: StateObservable<RootStateOrAny>
) {
  return action$.pipe(
    ofType(oppgaveTransformerRader.type),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      let rader = state.oppgaver.rader.slice();

      if (action.payload.filtrering?.hjemmel) {
        rader = filtrerHjemmel(rader, action.payload.filtrering.hjemmel);
      } else if (!action.payload.filtrering?.hjemmel) {
        rader = filtrerHjemmel(rader, undefined);
      }

      if (action.payload.filtrering?.type) {
        rader = filtrerType(rader, action.payload.filtrering.type);
      } else if (action.payload.filtrering?.type === undefined) {
        rader = filtrerType(rader, undefined);
      }
      if (action.payload.filtrering?.ytelse) {
        rader = filtrerYtelse(rader, action.payload.filtrering.ytelse);
      } else if (action.payload.filtrering?.ytelse === undefined) {
        rader = filtrerYtelse(rader, undefined);
      }
      if (action.payload.sortering?.frist === "ASC") {
        rader = sorterASC(rader);
      } else {
        rader = sorterDESC(rader);
      }

      return of(UTSNITT({ transformasjoner: action.payload, utsnitt: rader }));
    })
  );
}

const oppgaveUrl = `/api/oppgaver`;
const hentOppgaver = axios.get<[OppgaveRad]>(oppgaveUrl).pipe(map((oppgaver) => MOTTATT(oppgaver)));

function hentOppgaverEpos(
  action$: ActionsObservable<PayloadAction<OppgaveRad>>,
  state$: StateObservable<RootStateOrAny>
) {
  return action$.pipe(
    ofType(oppgaveRequest.type),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      return hentOppgaver.pipe(
        retryWhen(provIgjenStrategi()),
        catchError((error) => of(FEILET(error)))
      );
    })
  );
}

export const OPPGAVER_EPICS = [oppgaveTransformerEpos, hentOppgaverEpos];
