import { createAction, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ActionsObservable, ofType, StateObservable } from "redux-observable";
import { concat } from "rxjs";
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
import { AjaxCreationMethod } from "rxjs/internal-compatibility";
import { Filter, oppgaveHentingFeilet as oppgaveFeiletHandling } from "./oppgave";
import { toasterSett, toasterSkjul } from "./toaster";
import { RootState } from "../root";

//==========
// Interfaces
//==========
export interface MegType {
  navn: string;
  fornavn: string;
  mail: string;
  id: string;
  etternavn: string;
  enheter: Array<IEnhetData>;
  valgtEnhet: number;
  innstillinger?: IInnstillinger;
}

interface Graphdata {
  givenName: string;
  surname: string;
  onPremisesSamAccountName: string;
  displayName: string;
  mail: string;
}

export interface IEnhetData {
  id: string;
  navn: string;
  lovligeTemaer?: [Filter];
}

export interface Faner {
  /**
   * ID til fane, og hvorvidt den er aktiv eller ikke.
   */
  dokumenter?: {
    checked?: boolean;
  };
  detaljer?: {
    checked?: boolean;
  };
  vedtak?: {
    checked?: boolean;
  };
}

interface GraphOgEnhet extends Graphdata, Array<IEnhetData> {}

export interface IInnstillinger {
  aktiveHjemler: Array<Filter>;
  aktiveTemaer: Array<Filter>;
  aktiveTyper: Array<Filter>;
  aktiveFaner: Faner;
}

export interface IInnstillingerPayload {
  navIdent: string;
  enhetId: string;
  innstillinger: {
    aktiveHjemler?: Array<Filter>;
    aktiveTemaer?: Array<Filter>;
    aktiveTyper?: Array<Filter>;
    aktiveFaner: Faner;
  };
}

export interface IHentInnstilingerPayload {
  navIdent: string;
  enhetId: string;
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
    valgtEnhet: 0,
    lovligeTemaer: undefined,
    enheter: [],
    innstillinger: undefined,
  } as MegType,
  reducers: {
    SETT_ENHET: (state, action: PayloadAction<number>) => {
      state.valgtEnhet = action.payload;
      return state;
    },
    ENHETER_HENTET: (state, action: PayloadAction<Array<IEnhetData>>) => {
      state.enheter = action.payload;
      return state;
    },
    MEG_HENTET: (state, action: PayloadAction<MegType>) => {
      state.fornavn = action.payload.fornavn;
      state.etternavn = action.payload.etternavn;
      state.navn = action.payload.navn;
      state.enheter = action.payload.enheter;
      state.id = action.payload.id;
      state.mail = action.payload.mail;
      return state;
    },
    INNSTILLINGER_HENTET: (state, action: PayloadAction<IInnstillinger>) => {
      state.innstillinger = action.payload;
      return state;
    },
    INNSTILLINGER_SETT: (state, action: PayloadAction<IInnstillinger>) => {
      state.innstillinger = action.payload;
      return state;
    },
    INNSTILLINGER_SATT: (state, action: PayloadAction<IInnstillinger>) => {
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
export const { MEG_HENTET, FEILET } = megSlice.actions;
export const hentMegHandling = createAction("meg/HENT_MEG");
export const hentetHandling = createAction<Partial<MegType>>("meg/MEG_HENTET");
export const settEnhetHandling = createAction<number>("meg/SETT_ENHET");
export const hentetEnhetHandling = createAction<Array<IEnhetData>>("meg/ENHETER_HENTET");
export const sattInnstillinger = createAction<IInnstillinger>("meg/INNSTILLINGER_SATT");
export const hentInnstillingerHandling = createAction<IHentInnstilingerPayload>(
  "meg/HENT_INNSTILLINGER"
);
export const hentetInnstillingerHandling = createAction<IInnstillinger>("meg/INNSTILLINGER_HENTET");
export const settInnstillingerHandling = createAction<IInnstillingerPayload>(
  "meg/INNSTILLINGER_SETT"
);
export const feiletHandling = createAction<string>("meg/FEILET");

//==========
// Vis feilmeldinger ved feil
//==========
function displayToast(error: string) {
  const message = error || "Kunne ikke lagre innstillinger";
  return toasterSett({
    display: true,
    type: "feil",
    feilmelding: message,
  });
}

function skjulToaster() {
  return toasterSkjul();
}

//==========
// Epos
//==========
const megUrl = `/me`;
const innstillingerUrl = `/internal/innstillinger`;

let resultData: any;

export function hentMegEpos(
  action$: ActionsObservable<PayloadAction>,
  state$: StateObservable<RootState>,
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
            return getJSON<Array<IEnhetData>>(`/api/ansatte/${graphData.id}/enheter`).pipe(
              timeout(5000),
              map((response: Array<IEnhetData>) => {
                return concat([
                  <Array<IEnhetData>>response,
                  <MegType>{
                    ...graphData,
                    enheter: response,
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
              return hentetEnhetHandling(data as Array<IEnhetData>);
            } else {
              return hentetHandling(data as MegType);
            }
          })
        )
        .pipe(
          retryWhen(provIgjenStrategi({ maksForsok: 3 })),
          catchError((error) => {
            let err = error?.response?.detail || "ukjent feil";

            return concat([
              feiletHandling(err),
              oppgaveFeiletHandling(),
              displayToast(err),
              skjulToaster(),
            ]);
          })
        );
    })
  );
}

export function hentInnstillingerEpos(
  action$: ActionsObservable<PayloadAction<IHentInnstilingerPayload>>,
  state$: StateObservable<RootState>,
  { getJSON }: AjaxCreationMethod
) {
  return action$.pipe(
    ofType(hentInnstillingerHandling.type),
    withLatestFrom(state$),
    mergeMap(([action]) => {
      return getJSON<IInnstillinger>(
        `${innstillingerUrl}/${action.payload.navIdent}/${action.payload.enhetId}`
      )
        .pipe(
          timeout(5000),
          map((response: IInnstillinger) => {
            return hentetInnstillingerHandling(response);
          })
        )
        .pipe(
          retryWhen(provIgjenStrategi({ maksForsok: 1 })),
          catchError((error) => {
            let err = error?.response?.detail || "ukjent feil";

            return concat([
              feiletHandling(err),
              displayToast("Kunne ikke hente innstillinger"),
              skjulToaster(),
            ]);
          })
        );
    })
  );
}

export function settInnstillingerEpos(
  action$: ActionsObservable<PayloadAction<IInnstillingerPayload>>,
  state$: StateObservable<RootState>,
  { post }: AjaxCreationMethod
) {
  return action$.pipe(
    ofType(settInnstillingerHandling.type),
    switchMap((action) => {
      return post(
        innstillingerUrl,
        {
          navIdent: action.payload.navIdent,
          enhetId: action.payload.enhetId,
          innstillinger: JSON.stringify(action.payload.innstillinger),
        },
        { "Content-Type": "application/json" }
      )
        .pipe(map((payload: { response: IInnstillinger }) => sattInnstillinger(payload.response)))
        .pipe(
          retryWhen(provIgjenStrategi({ maksForsok: 1 })),
          catchError((error) => {
            let err = error?.response?.detail || "ukjent feil";
            return concat([feiletHandling(err), displayToast(err), skjulToaster()]);
          })
        );
    })
  );
}

export const MEG_EPICS = [hentMegEpos, hentInnstillingerEpos, settInnstillingerEpos];
