import { createAction, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootStateOrAny } from "react-redux";
import { ActionsObservable, ofType, StateObservable } from "redux-observable";
import { concat, from, of } from "rxjs";
import {
  catchError,
  concatAll,
  map,
  mergeMap,
  retryWhen,
  switchMap,
  timeout,
  withLatestFrom,
} from "rxjs/operators";
import { provIgjenStrategi } from "../../utility/rxUtils";
import { AjaxCreationMethod, AjaxObservable, ajaxPost } from "rxjs/internal-compatibility";
import { Filter, oppgaveHentingFeilet as oppgaveFeiletHandling } from "./oppgave";

//==========
// Interfaces
//==========
export interface MegType {
  navn: string;
  fornavn: string;
  mail: string;
  id: string;
  etternavn: string;
  enheter?: Array<EnhetData>;
  innstillinger?: IInnstillinger;
}

interface Graphdata {
  givenName: string;
  surname: string;
  onPremisesSamAccountName: string;
  displayName: string;
  mail: string;
}

export interface EnhetData {
  id: string;
  navn: string;
  lovligeTemaer: [string];
}

interface GraphOgEnhet extends Graphdata, Array<EnhetData> {}

export interface MegOgEnhet extends MegType {
  enhetId: string;
  enhetNavn: string;
  lovligeTemaer?: [string];
}

export interface IInnstillinger {
  aktiveHjemler: Array<Filter>;
  aktiveTyper: Array<Filter>;
}
export interface IInnstillingerPayload {
  navIdent: string;
  innstillinger: {
    aktiveHjemler?: Array<Filter>;
    aktiveTyper?: Array<Filter>;
  };
}
//==========
// Reducer
//==========
export const megSlice = createSlice({
  name: "meg",
  initialState: {
    id: "",
    navn: "",
    fornavn: "",
    mail: "",
    etternavn: "",
    enhetId: "",
    enhetNavn: "",
    lovligeTemaer: undefined,
    enheter: [],
    innstillinger: undefined,
  } as MegOgEnhet,
  reducers: {
    SETT_ENHET: (state, action: PayloadAction<string>) => {
      state.enhetId = action.payload;
      return state;
    },
    ENHETER: (state, action: PayloadAction<Array<EnhetData>>) => {
      state.enheter = action.payload;
      return state;
    },
    HENTET: (state, action: PayloadAction<MegOgEnhet>) => {
      state.fornavn = action.payload.fornavn;
      state.etternavn = action.payload.etternavn;
      state.navn = action.payload.navn;
      state.enhetId = action.payload.enhetId;
      state.enhetNavn = action.payload.enhetNavn;
      state.lovligeTemaer = action.payload.lovligeTemaer;
      state.id = action.payload.id;
      state.mail = action.payload.mail;
      return state;
    },
    INNSTILLINGER_HENTET: (state, action: PayloadAction<IInnstillinger>) => {
      state.innstillinger = action.payload;
      return state;
    },
    INNSTILLINGER_SATTT: (state, action: PayloadAction<IInnstillinger>) => {
      state.innstillinger = action.payload;
      return state;
    },
    FEILET: (state, action: PayloadAction<string>) => {
      console.error(action.payload);
    },
  },
});

export default megSlice.reducer;

//==========
// Actions
//==========
export const { HENTET, FEILET } = megSlice.actions;
export const hentMegHandling = createAction("meg/HENT_MEG");
export const hentetHandling = createAction<MegOgEnhet>("meg/HENTET");
export const settEnhetHandling = createAction<string>("meg/SETT_ENHET");
export const hentetEnhetHandling = createAction<Array<EnhetData>>("meg/ENHETER");
export const sattInnstillinger = createAction<IInnstillinger>("meg/INNSTILLINGER_SATT");
export const hentInnstillingerHandling = createAction<string>("meg/HENT_INNSTILLINGER");
export const hentetInnstillingerHandling = createAction<IInnstillinger>("meg/INNSTILLINGER_HENTET");
export const settInnstillingerHandling = createAction<IInnstillingerPayload>(
  "meg/INNSTILLINGER_SETT"
);
export const feiletHandling = createAction<string>("meg/FEILET");

//==========
// Epos
//==========
const megUrl = `/me`;
const innstillingerUrl = `/internal/innstillinger`;

let resultData: any;

export function hentMegEpos(
  action$: ActionsObservable<PayloadAction>,
  state$: StateObservable<RootStateOrAny>,
  { getJSON }: AjaxCreationMethod
) {
  return action$.pipe(
    ofType(hentMegHandling.type),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      return getJSON<GraphOgEnhet>(megUrl)
        .pipe(
          timeout(5000),
          map((response: Graphdata) => {
            return {
              fornavn: response.givenName,
              id: response.onPremisesSamAccountName,
              etternavn: response.surname,
              navn: response.displayName,
              mail: response.mail,
            };
          })
        )
        .pipe(
          map((graphData) => {
            return getJSON<[EnhetData]>(`/api/ansatte/${graphData.id}/enheter`).pipe(
              timeout(5000),
              map((response: [EnhetData]) => {
                return concat([
                  <Array<EnhetData>>response,
                  <MegOgEnhet>{
                    ...graphData,
                    enhetId: response[0].id,
                    enhetNavn: response[0].navn,
                    lovligeTemaer: response[0].lovligeTemaer,
                  },
                ]);
              })
            );
          })
        )
        .pipe(
          concatAll(),
          concatAll(),
          map((data) => {
            if (Array.isArray(data)) {
              return hentetEnhetHandling(data as Array<EnhetData>);
            } else {
              return hentetHandling(data as MegOgEnhet);
            }
          })
        )
        .pipe(
          retryWhen(provIgjenStrategi({ maksForsok: 3 })),
          catchError((error) => {
            return concat([feiletHandling(error.message), oppgaveFeiletHandling()]);
          })
        );
    })
  );
}

export function hentInnstillingerEpos(
  action$: ActionsObservable<PayloadAction<string>>,
  state$: StateObservable<RootStateOrAny>,
  { getJSON }: AjaxCreationMethod
) {
  return action$.pipe(
    ofType(hentInnstillingerHandling.type),
    withLatestFrom(state$),
    mergeMap(([action]) => {
      return getJSON<IInnstillinger>(`${innstillingerUrl}/${action.payload}`)
        .pipe(
          timeout(5000),
          map((response: IInnstillinger) => {
            return hentetInnstillingerHandling(response);
          })
        )
        .pipe(
          retryWhen(provIgjenStrategi({ maksForsok: 3 })),
          catchError((error) => {
            return concat([feiletHandling(error.message)]);
          })
        );
    })
  );
}

export function settInnstillingerEpos(
  action$: ActionsObservable<PayloadAction<IInnstillingerPayload>>,
  state$: StateObservable<RootStateOrAny>,
  { post }: AjaxCreationMethod
) {
  return action$.pipe(
    ofType(settInnstillingerHandling.type),
    switchMap((action) => {
      return post(
        innstillingerUrl,
        {
          navIdent: action.payload.navIdent,
          innstillinger: JSON.stringify(action.payload.innstillinger),
        },
        { "Content-Type": "application/json" }
      )
        .pipe(map((payload: { response: IInnstillinger }) => sattInnstillinger(payload.response)))
        .pipe(
          retryWhen(provIgjenStrategi({ maksForsok: 3 })),
          catchError((error) => {
            return concat([feiletHandling(error.message)]);
          })
        );
    })
  );
}

export const MEG_EPICS = [hentMegEpos, hentInnstillingerEpos, settInnstillingerEpos];
