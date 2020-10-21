import { createAction, createSlice, PayloadAction } from "@reduxjs/toolkit";
import axios from "../konfigurerAxios";
import { RootStateOrAny } from "react-redux";
import { ActionsObservable, ofType, StateObservable } from "redux-observable";
import { of } from "rxjs";
import {
  catchError,
  map,
  mapTo,
  mergeMap,
  switchMap,
  tap,
  withLatestFrom,
} from "rxjs/operators";
import { apiOppsett } from "../../utility/apiOppsett";

//==========
// Type defs
//==========
export interface OppgaveRad {
  id: number;
  bruker: {
    fnr: string;
    navn: string;
  };
  type: string;
  ytelse: string;
  hjemmel: [string];
  frist: string;
  saksbehandler: string;
}

export interface OppgaveRader {
  utsnitt: [OppgaveRad];
}

export interface Transformasjoner {
  filtrering?: {
    type?: "KLAGE" | "ANKE" | undefined;
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
    MOTTATT: (state, action: PayloadAction<[OppgaveRad] | null>) => {
      if (action.payload) {
        state.rader = action.payload;
        state.utsnitt = action.payload;
        state.lasterData = false;
      }
    },
    UTSNITT: (state, action: PayloadAction<RadMedTransformasjoner>) => {
      state.transformasjoner = action.payload.transformasjoner;
      state.utsnitt = action.payload.utsnitt;
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
export const { MOTTATT, UTSNITT } = oppgaveSlice.actions;
export const oppgaveRequest = createAction("oppgaver/HENT");
export const oppgaverUtsnitt = createAction<[OppgaveRad]>("oppgaver/UTSNITT");

export const oppgaveTransformerRader = createAction<Transformasjoner>(
  "oppgaver/TRANSFORMER_RADER"
);

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

function filtrerHjemmel(
  utsnitt: Array<OppgaveRad> | any,
  hjemmel: string | undefined
) {
  return utsnitt.slice().filter((rad: OppgaveRad) => {
    if (hjemmel === undefined) {
      return rad;
    } else {
      if (rad.hjemmel.includes(hjemmel)) {
        return rad;
      }
    }
  });
}

function filtrerType(
  utsnitt: Array<OppgaveRad> | any,
  type: string | undefined
) {
  return utsnitt.slice().filter((rad: OppgaveRad) => {
    if (type === undefined) {
      return rad;
    } else {
      return rad.type.toLocaleLowerCase() === type.toLocaleLowerCase();
    }
  });
}

function filtrerYtelse(
  utsnitt: Array<OppgaveRad> | any,
  ytelse: string | undefined
) {
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
      } else if (action.payload.filtrering?.hjemmel === undefined) {
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

function hentOppgaverEpos(
  action$: ActionsObservable<PayloadAction<OppgaveRad>>,
  state$: StateObservable<RootStateOrAny>
) {
  return action$.pipe(
    ofType(oppgaveRequest.type),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      const oppgaveUrl = `${apiOppsett(window.location.host)}/oppgaver`;

      return axios.get<[OppgaveRad]>(oppgaveUrl).pipe(
        map((oppgaver) => MOTTATT(oppgaver)),
        catchError((err) => {
          console.error(err);
          return of(MOTTATT(null));
        })
      );
    })
  );
}

export const OPPGAVER_EPICS = [oppgaveTransformerEpos, hentOppgaverEpos];
