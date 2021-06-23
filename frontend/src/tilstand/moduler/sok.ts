import { createAction, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ActionsObservable, ofType, StateObservable } from "redux-observable";
import { catchError, debounceTime, map, retryWhen, switchMap } from "rxjs/operators";
import { AjaxCreationMethod, AjaxResponse } from "rxjs/internal-compatibility";
import { concat, Observable, of } from "rxjs";
import { toasterSett, toasterSkjul } from "./toaster";
import { provIgjenStrategi } from "../../utility/rxUtils";
import { RootState } from "../root";
import { Dependencies } from "../konfigurerTilstand";
import { OppgaveRad } from "./oppgave";

//==========
// Interfaces
//==========

enum Rekkefolge {
  stigende = "STIGENDE",
  synkende = "SYNKENDE",
}

enum Sortering {
  frist = "FRIST",
}

enum Projeksjon {
  utvidet = "UTVIDET",
}

interface IPersonSokPayload {
  navIdent: string;
  fnr: string;
  rekkefoelge?: Rekkefolge;
  sortering?: Sortering;
  start: number;
  antall: number;
  projeksjon?: Projeksjon;
}

interface Person {
  id: string;
  person: any;
  type: number;
  tema: number;
  hjemmel: string;
  mottatt: string;
  klagebehandlingVersjon: number;
  erMedunderskriver: boolean;
  harMedunderskriver: boolean;
  medunderskriverident?: string;
  utfall?: string;
  avsluttetAvSaksbehandler?: boolean;
  erTildelt?: boolean;
  tildeltSaksbehandlerident: string;
}

interface IPersonResult {
  antallTreffTotalt: number;
  personer: any;
}

//==========
// Reducer
//==========
export const sokSlice = createSlice({
  name: "sok",
  initialState: {
    laster: false,
    response: {
      antallTreffTotalt: 0,
      personer: [],
    },
  },
  reducers: {
    SOK: (state, action: PayloadAction) => {
      state.laster = true;
      return state;
    },
    SOK_FAIL: (state, action: PayloadAction) => {
      return state;
    },
    SOK_LASTER: (state, action: PayloadAction<boolean>) => {
      state.laster = action.payload;
      return state;
    },
    SOK_RESPONSE: (state, action: PayloadAction<IPersonResult>) => {
      state.laster = false;
      state.response = {
        antallTreffTotalt: action.payload.antallTreffTotalt,
        personer: action.payload.personer ?? [],
      };
      return state;
    },
  },
});

export default sokSlice.reducer;

//==========
// Actions
//==========
const { SOK_FAIL, SOK_LASTER, SOK_RESPONSE } = sokSlice.actions;
export const startSok = createAction<IPersonSokPayload>("sok/SOK");
export const settSokLaster = createAction<boolean>("sok/SOK_LASTER");

const performSearch = (
  payload: IPersonSokPayload,
  post: { (url: string, body?: any, headers?: Object | undefined): Observable<AjaxResponse> }
) => {
  const url = `/api/ansatte/${payload.navIdent}/klagebehandlinger/personsoek`;
  let body = {
    fnr: payload.fnr,
    start: payload.start,
    antall: payload.antall,
  };

  return post(url, body, { "Content-Type": "application/json" })
    .pipe(map((payload) => SOK_RESPONSE(payload.response)))
    .pipe(
      retryWhen(provIgjenStrategi({ maksForsok: 1 })),
      catchError((error) => {
        return concat([
          SOK_FAIL(),
          toasterSett({
            display: true,
            type: "feil",
            feilmelding: `Søk feilet ${error}`,
          }),
          toasterSkjul(),
        ]);
      })
    );
};

//==========
// Epos
//==========
export function sokEpos(
  action$: ActionsObservable<PayloadAction<IPersonSokPayload>>,
  state$: StateObservable<RootState>,
  { ajax }: Dependencies
) {
  return action$.pipe(
    ofType(startSok.type),
    debounceTime(1000),
    switchMap((action) => {
      return concat(
        of(SOK_LASTER(true)),
        performSearch(action.payload, ajax.post),
        of(SOK_LASTER(false))
      );
    })
  );
}

export const SOK_EPICS = [sokEpos];
