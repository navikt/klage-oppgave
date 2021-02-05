import { createAction, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootStateOrAny } from "react-redux";
import { ActionsObservable, ofType, StateObservable } from "redux-observable";
import { concat, of } from "rxjs";
import { catchError, map, mergeMap, retryWhen, timeout, withLatestFrom } from "rxjs/operators";
import { provIgjenStrategi } from "../../utility/rxUtils";
import { AjaxCreationMethod } from "rxjs/internal-compatibility";
import { toasterSett, toasterSkjul } from "./toaster";

//==========
// Interfaces
//==========
export interface IHjemmel {
  kapittel: number;
  paragraf: number;
  ledd?: number;
  bokstav?: string;
  original?: string;
}

export interface IKlage {
  id: string;
  klageLastet: boolean;
  dokumenterLastet: boolean;
  klageInnsendtdato?: string;
  fraNAVEnhet: string;
  mottattFoersteinstans: string;
  foedselsnummer: string;
  tema: string;
  sakstype: string;
  mottatt: string;
  startet?: string;
  avsluttet?: string;
  frist: string;
  tildeltSaksbehandlerident?: string;
  hjemler: Array<IHjemmel>;
  pageReference: string;
  prevPageReference: string;
  pageRefs: Array<string | null>;
  pageIdx: number;
  historyNavigate: boolean;
  historyRef: string;
  dokumenter?: any;
}

interface IKlagePayload {
  id: string;
}

interface IDokumentParams {
  id: string;
  idx: number;
  handling: string;
  antall: number;
  ref: string | null;
  historyNavigate: boolean;
}

//==========
// Reducer
//==========
export const klageSlice = createSlice({
  name: "klagebehandling",
  initialState: {
    id: "",
    klageLastet: false,
    dokumenterLastet: false,
    klageInnsendtdato: undefined,
    fraNAVEnhet: "",
    mottattFoersteinstans: "",
    foedselsnummer: "",
    tema: "",
    sakstype: "",
    mottatt: "",
    startet: undefined,
    avsluttet: undefined,
    frist: "",
    tildeltSaksbehandlerident: undefined,
    prevPageReference: "",
    pageReference: "",
    historyNavigate: false,
    historyRef: "",
    pageRefs: [null],
    pageIdx: 0,
    hjemler: [],
  } as IKlage,
  reducers: {
    HENTET: (state, action: PayloadAction<IKlage>) => {
      state = action.payload;
      state.klageLastet = true;
      return state;
    },
    DOKUMENTER_HENTET: (state, action: PayloadAction<IKlage>) => {
      const { historyNavigate, historyRef } = action.payload;
      state.dokumenterLastet = true;

      if (!state.pageRefs) {
        state.pageRefs = [];
        state.pageRefs.push(null);
      }
      if (action.payload.pageReference && !historyNavigate) {
        console.debug("PUSH", historyNavigate);
        if (!historyNavigate) {
          const found = state.pageRefs.filter((ref) => ref === action.payload.pageReference);
          if (found.length === 0) state.pageRefs.push(action.payload.pageReference);
        }
      }
      state.prevPageReference = state.pageReference;
      state.pageReference = action.payload.pageReference;
      if (action.payload.pageReference)
        state.pageIdx = state.pageRefs.indexOf(action.payload.pageReference);
      state.dokumenter = action.payload.dokumenter;
      return state;
    },
    FEILET: (state, action: PayloadAction<string>) => {
      console.error(action.payload);
      return state;
    },
  },
});

export default klageSlice.reducer;

//==========
// Actions
//==========
export const { HENTET, FEILET } = klageSlice.actions;
export const hentKlageHandling = createAction<string>("klagebehandling/HENT_KLAGE");
export const hentetKlageHandling = createAction<IKlage>("klagebehandling/HENTET");
export const feiletHandling = createAction<string>("klagebehandling/FEILET");

export const hentetKlageDokumenterHandling = createAction<IKlage>(
  "klagebehandling/DOKUMENTER_HENTET"
);
export const hentDokumenterHandling = createAction<Partial<IDokumentParams>>(
  "klagebehandling/HENT_KLAGE_DOKUMENTER"
);

export const hentDokumentSideHandling = createAction<Partial<IDokumentParams>>(
  "klagebehandling/HENT_KLAGE_DOKUMENTER"
);

//==========
// Epos
//==========
const klageUrl = (id: string) => `/api/klagebehandlinger/${id}`;
var resultData: IKlage;
const R = require("ramda");

export function klagebehandlingEpos(
  action$: ActionsObservable<PayloadAction<string>>,
  state$: StateObservable<RootStateOrAny>,
  { getJSON }: AjaxCreationMethod
) {
  return action$.pipe(
    ofType(hentKlageHandling.type),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      return getJSON<IKlagePayload>(klageUrl(action.payload))
        .pipe(
          timeout(5000),
          map((response: IKlagePayload) => response)
        )
        .pipe(
          map((data) => {
            return hentetKlageHandling(data as IKlage);
          })
        )
        .pipe(
          retryWhen(provIgjenStrategi({ maksForsok: 3 })),
          catchError((error) => {
            return concat([
              feiletHandling(error.message),
              toasterSett({
                display: true,
                feilmelding: `Henting av klagebehandling med id ${action.payload} feilet. Feilmelding: ${error.message}`,
              }),
              toasterSkjul(),
            ]);
          })
        );
    })
  );
}

export function klagebehandlingDokumenterSideEpos(
  action$: ActionsObservable<PayloadAction<IDokumentParams>>,
  state$: StateObservable<RootStateOrAny>,
  { getJSON }: AjaxCreationMethod
) {
  return action$.pipe(
    ofType(hentDokumentSideHandling.type),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      let ref = action.payload.ref;
      let historyRef = ref;
      let { historyNavigate } = action.payload;
      let klageUrl = `/api/klagebehandlinger/${action.payload.id}/alledokumenter?antall=10&forrigeSide=${ref}`;
      return getJSON<IKlagePayload>(klageUrl)
        .pipe(
          timeout(5000),
          map((response: IKlagePayload) => {
            return {
              historyNavigate,
              historyRef,
              ...response,
            };
          })
        )
        .pipe(
          map((data) => {
            return hentetKlageDokumenterHandling(data as any);
          })
        )
        .pipe(
          retryWhen(provIgjenStrategi({ maksForsok: 3 })),
          catchError((error) => {
            return concat([
              feiletHandling(error.message),
              toasterSett({
                display: true,
                feilmelding: `Henting av dokumenter feilet: ${error.message}`,
              }),
              toasterSkjul(),
            ]);
          })
        );
    })
  );
}

export const KLAGEBEHANDLING_EPICS = [klagebehandlingEpos, klagebehandlingDokumenterSideEpos];
