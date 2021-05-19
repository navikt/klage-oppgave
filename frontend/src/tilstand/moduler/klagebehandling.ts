import { createAction, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootStateOrAny } from "react-redux";
import { ActionsObservable, ofType, StateObservable } from "redux-observable";
import { concat } from "rxjs";
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
import { toasterSett, toasterSkjul } from "./toaster";
import { IInnstillinger } from "./meg";
import { IKodeverkVerdi } from "./oppgave";
import { RootState } from "../root";
import { Dependencies } from "../konfigurerTilstand";

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

export interface INavn {
  fornavn?: string;
  mellomnavn?: string;
  etternavn?: string;
}

export interface IKlage {
  id: string;
  sakenGjelderKjoenn: string;
  sakenGjelderFoedselsnummer: string;
  sakenGjelderNavn: INavn;
  klageLastet: boolean;
  klagebehandlingVersjon: number;
  lasterDokumenter: boolean;
  hasMore: boolean;
  klageLastingFeilet: boolean;
  dokumenterAlleHentet: boolean;
  dokumenterTilordnedeHentet: boolean;
  klageInnsendtdato?: string;
  fraNAVEnhet: string;
  fraNAVEnhetNavn: string;
  mottattFoersteinstans: string;
  foedselsnummer: string;
  tema: string;
  type: string;
  mottatt: string;
  startet?: string;
  avsluttet: string | null;
  avsluttetAvSaksbehandler: string | null;
  frist: string;
  tildeltSaksbehandlerident?: string;
  hjemler: Array<IHjemmel>;
  pageReference: string;
  pageRefs: Array<string | null>;
  pageIdx: number;
  historyNavigate: boolean;
  dokumenter?: any;
  dokumenterTilordnede?: any;
  currentPDF: string;
  dokumenterOppdatert: string;
  internVurdering: string;
  kommentarFraFoersteinstans: string;
  vedtak: Array<Vedtak>;
  medunderskriverident: string | null;
}

export interface Vedtak {
  brevMottakere: string[];
  hjemler: string[];
  id: string;
  utfall: string | null;
  grunn: string | null;
  file: IVedlegg | null;
  ferdigstilt: string | null;
}

export interface IVedlegg {
  name: string;
  size: number;
  content: string;
}

export interface IVedleggOpplastet {
  vedtakId: string;
  vedlegg: IVedlegg;
}

export interface GrunnerPerUtfall {
  utfallId: string;
  grunner: IKodeverkVerdi[];
}

interface IKlagePayload {
  id: string;
}

interface IDokumenter {
  saksbehandlerHarTilgang: boolean;
}

interface IDokumentPayload {
  id: string;
  journalpostId: string;
  dokumentInfoId: string;
  erVedlegg: boolean;
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
    klagebehandlingVersjon: 0,
    klageLastet: false,
    sakenGjelderKjoenn: "",
    sakenGjelderNavn: "",
    sakenGjelderFoedselsnummer: "",
    lasterDokumenter: false,
    klageLastingFeilet: false,
    dokumenterAlleHentet: false,
    dokumenterTilordnedeHentet: false,
    klageInnsendtdato: undefined,
    fraNAVEnhet: "",
    fraNAVEnhetNavn: "",
    mottattFoersteinstans: "",
    foedselsnummer: "",
    tema: "",
    type: "",
    mottatt: "",
    startet: undefined,
    avsluttet: null,
    avsluttetAvSaksbehandler: null,
    frist: "",
    tildeltSaksbehandlerident: undefined,
    pageReference: "",
    historyNavigate: false,
    pageRefs: [null],
    hasMore: false,
    pageIdx: 0,
    dokumenterOppdatert: "",
    hjemler: [],
    currentPDF: "",
    internVurdering: "",
    kommentarFraFoersteinstans: "",
    vedtak: [
      {
        brevMottakere: [],
        hjemler: [],
        id: "214d1485-5a26-4aec-86e4-19395fa54f87",
        utfall: null,
        grunn: null,
        ferdigstilt: null,
        file: null,
      },
    ],
    medunderskriverident: null,
  } as IKlage,
  reducers: {
    HENT_KLAGE: (state, action: PayloadAction<IKlage>) => {
      state.klageLastet = false;
      state.klageLastingFeilet = false;
      return state;
    },
    HENTET: (state, action: PayloadAction<IKlage>) => {
      state = action.payload;
      state.klageLastet = true;
      state.klageLastingFeilet = false;
      return state;
    },
    HENTET_DOKUMENT_FORHANDSVISNING: (state, action: PayloadAction<any>) => {
      state.currentPDF = action.payload;
      return state;
    },
    LASTER_DOKUMENTER: (state, action: PayloadAction<boolean>) => {
      state.dokumenterAlleHentet = action.payload;
      state.lasterDokumenter = true;
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
      state.lasterDokumenter = false;
      state.dokumenterOppdatert = new Date().getTime().toString();

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
      state.hasMore = false;

      if (action.payload.pageReference) {
        state.pageIdx = state.pageRefs.indexOf(action.payload.pageReference);
        state.hasMore = true;
      }

      let nyDokumentliste = [];
      if (!state.dokumenter) nyDokumentliste = action.payload.dokumenter;
      else nyDokumentliste = state.dokumenter.concat(action.payload.dokumenter);
      state.dokumenter = nyDokumentliste;
      return state;
    },
    DOKUMENTER_TILORDNEDE_HENTET: (state, action: PayloadAction<IKlage>) => {
      const { historyNavigate } = action.payload;
      state.dokumenterTilordnedeHentet = true;
      state.dokumenterTilordnede = action.payload.dokumenter;
      return state;
    },
    MEDUNDERSKRIVER_SATT: (state, action: PayloadAction<string | null>) => {
      state.medunderskriverident = action.payload;
      return state;
    },
    VEDLEGG_OPPLASTET: (state, action: PayloadAction<IVedleggOpplastet>) => {
      const vedtak = state.vedtak.find(({ id }) => id === action.payload.vedtakId);
      if (typeof vedtak !== "undefined") {
        vedtak.file = action.payload.vedlegg;
      }
      return state;
    },
    VEDLEGG_SLETTET: (state, action: PayloadAction<Vedtak>) => {
      const vedtakIndex = state.vedtak.findIndex(({ id }) => id === action.payload.id);
      if (vedtakIndex === -1) {
        state.vedtak.push(action.payload);
        return state;
      }
      state.vedtak[vedtakIndex] = action.payload;
      return state;
    },
    VEDLEGG_FULLFOERT: (state, action: PayloadAction<IKlage>) => ({
      ...state,
      ...action.payload,
    }),
    FEILET: (state, action: PayloadAction<string>) => {
      console.error(action.payload);
      state.klageLastet = true;
      state.klageLastingFeilet = true;
      return state;
    },
  },
});

export default klageSlice.reducer;

//==========
// Actions
//==========
export const {
  HENTET,
  FEILET,
  MEDUNDERSKRIVER_SATT,
  VEDLEGG_OPPLASTET,
  VEDLEGG_FULLFOERT,
  VEDLEGG_SLETTET,
} = klageSlice.actions;
export const hentKlageHandling = createAction<string>("klagebehandling/HENT_KLAGE");
export const hentetKlageHandling = createAction<IKlage>("klagebehandling/HENTET");
export const feiletHandling = createAction<string>("klagebehandling/FEILET");

export const hentPreviewHandling = createAction<IDokumentPayload>(
  "klagebehandling/HENT_DOKUMENT_FORHANDSVISNING"
);
export const hentetPreviewHandling = createAction<string>(
  "klagebehandling/HENTET_DOKUMENT_FORHANDSVISNING"
);

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

export const toggleDokumenterHandling = createAction<Partial<Partial<IDokumentPayload>>>(
  "klagebehandling/TILORDNE_DOKUMENT"
);
export const fradeltDokumentHandling = createAction<{
  journalpostId: string;
  dokumentInfoId: string;
  payload: any;
}>("klagebehandling/DOKUMENT_FRADELT");
export const tilordnetDokumentHandling = createAction<Partial<any>>(
  "klagebehandling/DOKUMENT_TILORDNET"
);

export const lasterDokumenter = createAction<boolean>("klagebehandling/LASTER_DOKUMENTER");
export const nullstillDokumenter = createAction("klagebehandling/NULLSTILL_DOKUMENTER");

//==========
// Epos
//==========
const klageUrl = (id: string) => `/api/klagebehandlinger/${id}/detaljer`;

export function klagebehandlingEpos(
  action$: ActionsObservable<PayloadAction<string>>,
  state$: StateObservable<RootState>,
  { ajax }: Dependencies
) {
  return action$.pipe(
    ofType(hentKlageHandling.type),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      return ajax
        .getJSON<IKlage>(klageUrl(action.payload))
        .pipe(
          timeout(5000),
          map((response: IKlage) => response)
        )
        .pipe(
          map((data) => {
            return hentetKlageHandling(data);
          })
        )
        .pipe(
          retryWhen(provIgjenStrategi({ maksForsok: 3 })),
          catchError((error) => {
            return concat([
              feiletHandling(error?.response?.detail || "feilet"),
              toasterSett({
                display: true,
                type: "feil",
                feilmelding: `Henting av klagebehandling med id ${action.payload} feilet. Feilmelding: ${error?.response?.detail}`,
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
  { ajax }: Dependencies
) {
  return action$.pipe(
    ofType(hentDokumentAlleHandling.type),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      let ref = action.payload.ref;
      let { historyNavigate } = action.payload;
      let klageUrl = `/api/klagebehandlinger/${action.payload.id}/alledokumenter?antall=10&forrigeSide=${ref}`;
      return ajax
        .getJSON<IKlagePayload>(klageUrl)
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
          map((data: any) => {
            return hentetKlageDokumenterAlleHandling(data);
          })
        )
        .pipe(
          retryWhen(provIgjenStrategi({ maksForsok: 3 })),
          catchError((error) => {
            return concat([
              feiletHandling(error?.response?.detail || "feilet"),
              toasterSett({
                display: true,
                type: "feil",
                feilmelding: `Henting av dokumenter feilet: ${error?.response?.detail}`,
              }),
              toasterSkjul(),
            ]);
          })
        );
    })
  );
}

export function HentDokumentForhandsvisningEpos(
  action$: ActionsObservable<PayloadAction<IDokumentPayload>>
) {
  return action$.pipe(
    ofType(hentPreviewHandling.type),
    map((action) => {
      let url = `/api/klagebehandlinger/${action.payload.id}/journalposter/${action.payload.journalpostId}/dokumenter/${action.payload.dokumentInfoId}`;
      return hentetPreviewHandling(url);
    })
  );
}

export function klagebehandlingDokumenterTilordnedeEpos(
  action$: ActionsObservable<PayloadAction<IDokumentParams>>,
  state$: StateObservable<RootStateOrAny>,
  { ajax }: Dependencies
) {
  return action$.pipe(
    ofType(hentDokumentTilordnedeHandling.type, tilordnetDokumentHandling.type),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      let ref = action.payload.ref;
      let { historyNavigate } = action.payload;
      let klageUrl = `/api/klagebehandlinger/${action.payload.id}/dokumenter`;
      return ajax
        .getJSON<IKlagePayload>(klageUrl)
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
              feiletHandling(error.response.detail),
              toasterSett({
                display: true,
                type: "feil",
                feilmelding: `Henting av tilordnede dokumenter feilet: ${error.response.detail}`,
              }),
              toasterSkjul(),
            ]);
          })
        );
    })
  );
}

export function ToggleKlageDokumentEpos(
  action$: ActionsObservable<PayloadAction<IDokumentPayload>>,
  state$: StateObservable<RootStateOrAny>,
  { ajax }: Dependencies
) {
  return action$.pipe(
    ofType(toggleDokumenterHandling.type),
    switchMap((action) => {
      const url = `/api/klagebehandlinger/${action.payload.id}/toggledokument`;
      return ajax
        .post(
          url,
          {
            id: action.payload.id,
            journalpostId: action.payload.journalpostId,
            dokumentInfoId: action.payload.dokumentInfoId,
            erVedlegg: action.payload.erVedlegg,
          },
          { "Content-Type": "application/json" }
        )
        .pipe(
          map((payload: { response: IInnstillinger }) =>
            tilordnetDokumentHandling({ id: action.payload.id, ...payload.response })
          )
        )
        .pipe(
          retryWhen(provIgjenStrategi({ maksForsok: 0 })),
          catchError((error) => {
            return concat([
              feiletHandling(error?.response?.detail || "feilet"),
              toasterSett({
                display: true,
                type: "feil",
                feilmelding: `Tilordning av dokument feilet: (${error?.response?.detail})`,
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
  ToggleKlageDokumentEpos,
  HentDokumentForhandsvisningEpos,
];
