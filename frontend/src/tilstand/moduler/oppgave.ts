import { createAction, createSlice, PayloadAction } from "@reduxjs/toolkit";
import axios from "../configureAxios";
import { RootStateOrAny } from "react-redux";
import { ActionsObservable, ofType, StateObservable } from "redux-observable";
import { of } from "rxjs";
import {
  catchError,
  map,
  switchMap,
  tap,
  withLatestFrom,
} from "rxjs/operators";
import { hentAPIUrl } from "../../utility/hentAPIUrl";
import React from "react";

//==========
// Reducer
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
  rader: [OppgaveRad];
}

type OppgaveState = {
  rader?: [OppgaveRad?];
  fetching: boolean;
};

export const oppgaveSlice = createSlice({
  name: "oppgaver",
  initialState: {
    rader: [],
    fetching: true,
  } as OppgaveState,
  reducers: {
    OPPGAVER_MOTTATT: (state, action: PayloadAction<[OppgaveRad] | null>) => {
      if (action.payload) state.rader = action.payload;
      state.fetching = false;
    },
  },
});

export default oppgaveSlice.reducer;

//==========
// Actions
//==========
export const { OPPGAVER_MOTTATT } = oppgaveSlice.actions;
export const oppgaveRequest = createAction("oppgaver/OPPGAVER_HENT");
export const oppgaveSorterFristStigende = createAction(
  "oppgaver/OPPGAVER_SORTER_FRIST_STIGENDE"
);
export const oppgaveSorterFristSynkende = createAction(
  "oppgaver/OPPGAVER_SORTER_FRIST_SYNKENDE"
);

//==========
// Epics
//==========
function hentTokenEpic() {
  const tokenUrl = window.location.host.startsWith("localhost")
    ? "/api/token"
    : "/token";
  return axios.get<string>(tokenUrl).pipe(
    map((token) => token),
    catchError((err) => err)
  );
}

export function oppgaveSorterFristStigendeEpic(
  action$: ActionsObservable<PayloadAction>,
  state$: StateObservable<RootStateOrAny>
) {
  return action$.pipe(
    ofType(oppgaveSorterFristStigende.type),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      return of(
        OPPGAVER_MOTTATT(
          state.oppgaver.rader.slice().sort(function (a: any, b: any) {
            return new Date(b.frist).getTime() - new Date(a.frist).getTime();
          })
        )
      );
    })
  );
}

export function oppgaveSorterFristSynkendeEpic(
  action$: ActionsObservable<PayloadAction>,
  state$: StateObservable<RootStateOrAny>
) {
  return action$.pipe(
    ofType(oppgaveSorterFristSynkende.type),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      return of(
        OPPGAVER_MOTTATT(
          state.oppgaver.rader.slice().sort(function (a: any, b: any) {
            return new Date(a.frist).getTime() - new Date(b.frist).getTime();
          })
        )
      );
    })
  );
}

function hentOppgaverEpic(
  action$: ActionsObservable<PayloadAction<OppgaveRad>>,
  state$: StateObservable<RootStateOrAny>
) {
  return action$.pipe(
    ofType(oppgaveRequest.type),
    withLatestFrom(state$),
    switchMap(([action, state]) => {
      const oppgaveUrl = `${hentAPIUrl(window.location.host)}/oppgaver`;

      return axios.get<[OppgaveRad]>(oppgaveUrl).pipe(
        map((oppgaver) => OPPGAVER_MOTTATT(oppgaver)),
        catchError((err) => {
          console.error(err);
          return of(OPPGAVER_MOTTATT(null));
        })
      );
    })
  );
}

export const OPPGAVER_EPICS = [
  oppgaveSorterFristSynkendeEpic,
  oppgaveSorterFristStigendeEpic,
  hentOppgaverEpic,
];
