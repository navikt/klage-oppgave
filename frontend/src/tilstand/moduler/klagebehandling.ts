import { createAction, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootStateOrAny } from "react-redux";
import { ActionsObservable, ofType, StateObservable } from "redux-observable";
import { concat, of } from "rxjs";
import {
  catchError,
  map,
  mergeMap,
  retryWhen,
  switchMap,
  timeout,
  withLatestFrom,
} from "rxjs/operators";
import { provIgjenStrategi } from "../../utility/rxUtils";
import { AjaxCreationMethod } from "rxjs/internal-compatibility";
import { toasterSett, toasterSkjul } from "./toaster";
import { OppgaveParams, oppgaveRequest } from "./oppgave";
import { IInnstillinger, sattInnstillinger, settInnstillingerHandling } from "./meg";

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
  dokumenterAlleHentet: boolean;
  dokumenterTilordnedeHentet: boolean;
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
  pageRefs: Array<string | null>;
  pageIdx: number;
  historyNavigate: boolean;
  dokumenter?: any;
  dokumenterTilordnede?: any;
}

interface IKlagePayload {
  id: string;
}

interface IDokumentPayload {
  id: string;
  journalpostId: string;
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
    dokumenterAlleHentet: false,
    dokumenterTilordnedeHentet: false,
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
    pageReference: "",
    historyNavigate: false,
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
    LASTER_DOKUMENTER: (state, action: PayloadAction<boolean>) => {
      state.dokumenterAlleHentet = action.payload;
      return state;
    },
    NULLSTILL_DOKUMENTER: (state, action: PayloadAction<boolean>) => {
      state.dokumenterAlleHentet = false;
      state.pageRefs = [];
      state.pageIdx = 0;
      return state;
    },
    DOKUMENTER_ALLE_HENTET: (state, action: PayloadAction<IKlage>) => {
      const { historyNavigate } = action.payload;
      state.dokumenterAlleHentet = true;

      if (!state.pageRefs) {
        state.pageRefs = [];
        state.pageRefs.push(null);
      }
      if (action.payload.pageReference && !historyNavigate) {
        if (!historyNavigate) {
          const found = state.pageRefs.filter((ref) => ref === action.payload.pageReference);
          if (found.length === 0) state.pageRefs.push(action.payload.pageReference);
        }
      }
      state.pageReference = action.payload.pageReference;
      if (action.payload.pageReference)
        state.pageIdx = state.pageRefs.indexOf(action.payload.pageReference);
      state.dokumenter = action.payload.dokumenter;
      return state;
    },
    DOKUMENTER_TILORDNEDE_HENTET: (state, action: PayloadAction<IKlage>) => {
      const { historyNavigate } = action.payload;
      state.dokumenterTilordnedeHentet = true;
      state.dokumenterTilordnede = action.payload.dokumenter;
      return state;
    },
    DOKUMENT_TILORDNET: (state, action: PayloadAction<any>) => {
      console.debug(action.payload);
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

export const hentetKlageDokumenterAlleHandling = createAction<IKlage>(
  "klagebehandling/DOKUMENTER_ALLE_HENTET"
);

export const hentetKlageDokumenterTilordnedeHandling = createAction<IKlage>(
  "klagebehandling/DOKUMENTER_TILORDNEDE_HENTET"
);

export const hentDokumentAlleHandling = createAction<Partial<IDokumentParams>>(
  "klagebehandling/HENT_KLAGE_DOKUMENTER"
);
export const hentDokumentTilordnedeHandling = createAction<Partial<IDokumentParams>>(
  "klagebehandling/HENT_TILORDNEDE_DOKUMENTER"
);

export const tilordneDokumenterHandling = createAction<Partial<IDokumentPayload>>(
  "klagebehandling/TILORDNE_DOKUMENT"
);
export const tilordnetDokumentHandling = createAction<Partial<any>>(
  "klagebehandling/DOKUMENT_TILORDNET"
);

export const lasterDokumenter = createAction<boolean>("klagebehandling/LASTER_DOKUMENTER");
export const nullstillDokumenter = createAction("klagebehandling/NULLSTILL_DOKUMENTER");

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

export function klagebehandlingDokumenterAlleEpos(
  action$: ActionsObservable<PayloadAction<IDokumentParams>>,
  state$: StateObservable<RootStateOrAny>,
  { getJSON }: AjaxCreationMethod
) {
  return action$.pipe(
    ofType(hentDokumentAlleHandling.type),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      let ref = action.payload.ref;
      let { historyNavigate } = action.payload;
      let klageUrl = `/api/klagebehandlinger/${action.payload.id}/alledokumenter?antall=10&forrigeSide=${ref}`;
      return getJSON<IKlagePayload>(klageUrl)
        .pipe(
          timeout(5000),
          map((response: IKlagePayload) => {
            return {
              historyNavigate,
              ...response,
            };
          })
        )
        .pipe(
          map((data) => {
            return hentetKlageDokumenterAlleHandling(data as any);
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

export function klagebehandlingDokumenterTilordnedeEpos(
  action$: ActionsObservable<PayloadAction<IDokumentParams>>,
  state$: StateObservable<RootStateOrAny>,
  { getJSON }: AjaxCreationMethod
) {
  return action$.pipe(
    ofType(hentDokumentTilordnedeHandling.type),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      let ref = action.payload.ref;
      let { historyNavigate } = action.payload;
      let klageUrl = `/api/klagebehandlinger/${action.payload.id}/dokumenter`;
      return getJSON<IKlagePayload>(klageUrl)
        .pipe(
          timeout(5000),
          map((response: IKlagePayload) => {
            return {
              historyNavigate,
              ...response,
            };
          })
        )
        .pipe(
          map((data) => {
            return hentetKlageDokumenterTilordnedeHandling(data as any);
          })
        )
        .pipe(
          retryWhen(provIgjenStrategi({ maksForsok: 3 })),
          catchError((error) => {
            return concat([
              feiletHandling(error.message),
              toasterSett({
                display: true,
                feilmelding: `Henting av tilordnede dokumenter feilet: ${error.message}`,
              }),
              toasterSkjul(),
            ]);
          })
        );
    })
  );
}

export function TilordneKlageDokumentEpos(
  action$: ActionsObservable<PayloadAction<IDokumentPayload>>,
  state$: StateObservable<RootStateOrAny>,
  { post }: AjaxCreationMethod
) {
  return action$.pipe(
    ofType(tilordneDokumenterHandling.type),
    switchMap((action) => {
      const url = `/api/klagebehandlinger/${action.payload.id}/dokumenter`;
      return post(
        url,
        {
          id: action.payload.id,
          journalpostId: action.payload.journalpostId,
        },
        { "Content-Type": "application/json" }
      )
        .pipe(
          map((payload: { response: IInnstillinger }) =>
            tilordnetDokumentHandling(payload.response)
          )
        )
        .pipe(
          retryWhen(provIgjenStrategi({ maksForsok: 0 })),
          catchError((error) => {
            console.debug(error);
            return concat([
              feiletHandling(error.message),
              toasterSett({
                display: true,
                feilmelding: `Tilordning av dokument feilet: (${error.message})`,
              }),
              toasterSkjul(),
            ]);
          })
        );
    })
  );
}

export const KLAGEBEHANDLING_EPICS = [
  klagebehandlingEpos,
  klagebehandlingDokumenterTilordnedeEpos,
  klagebehandlingDokumenterAlleEpos,
  TilordneKlageDokumentEpos,
];
