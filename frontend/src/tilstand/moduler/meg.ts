import { createAction, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootStateOrAny } from "react-redux";
import { ActionsObservable, ofType, StateObservable } from "redux-observable";
import { concat, from, of } from "rxjs";
import { catchError, concatAll, map, mergeMap, retryWhen, withLatestFrom } from "rxjs/operators";
import { provIgjenStrategi } from "../../utility/rxUtils";
import { AjaxCreationMethod, AjaxObservable } from "rxjs/internal-compatibility";
import { oppgaveHentingFeilet as oppgaveFeiletHandling } from "./oppgave";

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
}

interface GraphOgEnhet extends Graphdata, Array<EnhetData> {}

export interface MegOgEnhet extends MegType {
  enhetId: string;
  enhetNavn: string;
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
    enheter: [],
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
      state.id = action.payload.id;
      state.mail = action.payload.mail;
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
export const feiletHandling = createAction<string>("meg/FEILET");

//==========
// Epos
//==========
const megUrl = `/me`;
var resultData: any;

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
              map((response: [EnhetData]) => {
                return concat([
                  <Array<EnhetData>>response,
                  <MegOgEnhet>{
                    ...graphData,
                    enhetId: response[0].id,
                    enhetNavn: response[0].navn,
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

export const MEG_EPICS = [hentMegEpos];
