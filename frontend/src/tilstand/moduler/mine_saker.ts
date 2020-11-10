import { createAction, createSlice, PayloadAction } from "@reduxjs/toolkit";
import axios from "../konfigurerAxios";
import { RootStateOrAny } from "react-redux";
import { ActionsObservable, ofType, StateObservable } from "redux-observable";
import { of } from "rxjs";
import { catchError, map, retryWhen, switchMap, withLatestFrom } from "rxjs/operators";
import { provIgjenStrategi } from "../../utility/rxUtils";
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
  ytelse: string;
  hjemmel: string;
  versjon: number;
  frist: string;
  saksbehandler: string;
  endreOppgave?: Function;
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
    type?: undefined | string;
    ytelse?: undefined | string;
    hjemmel?: undefined | string;
  };
  sortering: {
    frist: "synkende" | "stigende" | undefined;
  };
}

type OppgaveState = {
  rader?: [OppgaveRad?];
  transformasjoner: Transformasjoner;
  meta: Metadata;
  lasterData: boolean;
};

//==========
// Reducer
//==========
export const oppgaveSlice = createSlice({
  name: "mineSaker",
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
        state.rader = action.payload;
        state.meta.antall = antall;
        state.meta.sider = Math.floor(antall / t) + (antall % t !== 0 ? 1 : 0);
        state.lasterData = false;
        state.meta.feilmelding = undefined;
      }
      return state;
    },
    UTSNITT: (state, action: PayloadAction<RadMedTransformasjoner>) => {
      state.transformasjoner = action.payload.transformasjoner;
      state.rader = action.payload.rader;
      return state;
    },
    FEILET: (state, action: PayloadAction<string>) => {
      state.meta.feilmelding = "MineSaker-henting feilet";
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

export default oppgaveSlice.reducer;

//==========
// Actions
//==========
export const { MOTTATT, UTSNITT, SETT_SIDE, FEILET } = oppgaveSlice.actions;
export const hentMineSakerHandling = createAction<string>("mineSaker/HENT");
export const settSide = createAction<number>("mineSaker/SETT_SIDE");
export const mineSakerUtsnitt = createAction<[OppgaveRad]>("mineSaker/UTSNITT");
export const oppgaveHentingFeilet = createAction<string>("mineSaker/FEILET");

export const oppgaveTransformerRader = createAction<Transformasjoner>(
  "mineSaker/TRANSFORMER_RADER"
);

//==========
// Sortering og filtrering
//==========
function sorterASC(rader: Array<OppgaveRad> | any) {
  return rader.slice().sort(function (a: any, b: any) {
    return new Date(a.frist).getTime() - new Date(b.frist).getTime();
  });
}

function sorterDESC(rader: Array<OppgaveRad> | any) {
  return rader.slice().sort(function (a: any, b: any) {
    return new Date(b.frist).getTime() - new Date(a.frist).getTime();
  });
}

function filtrerHjemmel(rader: Array<OppgaveRad> | any, hjemmel: string | undefined) {
  return rader.slice().filter((rad: OppgaveRad) => {
    if (hjemmel === undefined) {
      return rad;
    } else {
      return rad.hjemmel.split(" ").includes(hjemmel);
    }
  });
}

function filtrerType(rader: Array<OppgaveRad> | any, type: string | undefined) {
  return rader.slice().filter((rad: OppgaveRad) => {
    if (type === undefined) {
      return rad;
    } else {
      return rad.type.toLocaleLowerCase() === type.toLocaleLowerCase();
    }
  });
}

function filtrerYtelse(rader: Array<OppgaveRad> | any, ytelse: string | undefined) {
  return rader.slice().filter((rad: OppgaveRad) => {
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
      let rader = state.mineSaker.rader.slice();

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
      if (action.payload.sortering?.frist === "synkende") {
        rader = sorterASC(rader);
      } else {
        rader = sorterDESC(rader);
      }

      return of(UTSNITT({ transformasjoner: action.payload, rader: rader }));
    })
  );
}

export function hentMineSakerEpos(
  action$: ActionsObservable<PayloadAction<string>>,
  state$: StateObservable<RootStateOrAny>,
  { getJSON }: AjaxCreationMethod
) {
  return action$.pipe(
    ofType(hentMineSakerHandling.type),
    withLatestFrom(state$),
    switchMap(([action]) => {
      const url = `/api/oppgaver?saksbehandler=${action.payload}`;
      const hentMineSaker = getJSON<[OppgaveRad]>(url).pipe(
        map((mineSaker) => {
          console.log({ mineSaker });
          return MOTTATT(mineSaker);
        })
      );
      return hentMineSaker.pipe(
        retryWhen(provIgjenStrategi()),
        catchError((error) => of(FEILET(error)))
      );
    })
  );
}

export const MINESAKER_EPICS = [oppgaveTransformerEpos, hentMineSakerEpos];
