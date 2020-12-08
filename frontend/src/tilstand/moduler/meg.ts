import { createAction, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootStateOrAny } from "react-redux";
import { ActionsObservable, ofType, StateObservable } from "redux-observable";
import { concat, from, of } from "rxjs";
import { catchError, concatAll, map, mergeMap, retryWhen, withLatestFrom } from "rxjs/operators";
import { provIgjenStrategi } from "../../utility/rxUtils";
import { AjaxCreationMethod, AjaxObservable } from "rxjs/internal-compatibility";
import { oppgaveHentingFeilet as oppgaveFeiletHandling } from "./oppgave";

//==========
// Type defs
//==========
export interface MegType {
  navn: string;
  fornavn: string;
  mail: string;
  id: string;
  etternavn: string;
}

interface Graphdata {
  givenName: string;
  surname: string;
  onPremisesSamAccountName: string;
  displayName: string;
  mail: string;
}

interface EnhetData {
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
  } as MegOgEnhet,
  reducers: {
    HENTET: (state, action: PayloadAction<MegOgEnhet>) => action.payload,
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
            return getJSON<[EnhetData]>(`/api/ansatte/${graphData.id}/enheter`)
              .pipe(
                map((response: [EnhetData]) => {
                  return <any>{
                    ...graphData,
                    enhetId: response[0].id,
                    enhetNavn: response[0].navn,
                  };
                })
              )
              .pipe(
                retryWhen(provIgjenStrategi({ maksForsok: 3 })),
                catchError((error) => {
                  return concat([feiletHandling(error.message), oppgaveFeiletHandling()]);
                })
              );
          })
        )

        .pipe(
          concatAll(),
          map((data) => {
            return hentetHandling(data);
          })
        )
        .pipe(
          map((graphData) => {
            return getJSON<[EnhetData]>(`/api/ansatte/${graphData.payload.enhetId}/enheter`).pipe(
              map((response: [EnhetData]) => {
                return graphData.payload;
              })
            );
          })
        )
        .pipe(
          concatAll(),
          map((data) => {
            return hentetHandling(data);
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
