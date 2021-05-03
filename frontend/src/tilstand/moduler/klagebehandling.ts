import { createAction, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootStateOrAny } from "react-redux";
import { ActionsObservable, ofType, StateObservable } from "redux-observable";
import { concat, Observable, of } from "rxjs";
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
import { AjaxCreationMethod, ajaxDelete } from "rxjs/internal-compatibility";
import { toasterSett, toasterSkjul } from "./toaster";
import { IInnstillinger, sattInnstillinger, settInnstillingerHandling } from "./meg";
import { SETT } from "./router";

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
  sakenGjelderKjoenn: string;
  sakenGjelderFoedselsnummer: string;
  sakenGjelderNavn: {
    fornavn?: string;
    mellomnavn?: string;
    etternavn?: string;
  };
  klageLastet: boolean;
  lasterDokumenter: boolean;
  hasMore: boolean;
  klageLastingFeilet: boolean;
  dokumenterAlleHentet: boolean;
  dokumenterTilordnedeHentet: boolean;
  klageInnsendtdato?: string;
  fraNAVEnhet: string;
  mottattFoersteinstans: string;
  foedselsnummer: string;
  tema: string;
  type: string;
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
  currentPDF: string;
  dokumenterOppdatert: string;
  internVurdering: string;
  kommentarFraFoersteinstans: string;
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
    sakenGjelderKjoenn: "",
    sakenGjelderNavn: "",
    sakenGjelderFoedselsnummer: "",
    lasterDokumenter: false,
    klageLastingFeilet: false,
    dokumenterAlleHentet: false,
    dokumenterTilordnedeHentet: false,
    klageInnsendtdato: undefined,
    fraNAVEnhet: "",
    mottattFoersteinstans: "",
    foedselsnummer: "",
    tema: "",
    type: "",
    mottatt: "",
    startet: undefined,
    avsluttet: undefined,
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
      console.debug("currentPDF", action.payload);
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
    DOKUMENT_TILORDNET: (state, action: PayloadAction<any>) => {
      state.dokumenterOppdatert = new Date().getTime().toString();
      console.log(action.payload);
      state.dokumenter.map((dok: any) => {
        console.log({ dok });
      });
      return state;
    },
    DOKUMENT_FRADELT: (
      state,
      action: PayloadAction<{ journalpostId: string; dokumentInfoId: string; payload: any }>
    ) => {
      state.dokumenterOppdatert = new Date().getTime().toString();
      state.dokumenterTilordnede = state.dokumenterTilordnede.filter(
        (dok: any) =>
          dok.journalpostId !== action.payload.journalpostId &&
          dok.dokumentInfoId !== action.payload.dokumentInfoId
      );
      return state;
    },
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
export const { HENTET, FEILET } = klageSlice.actions;
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

export const tilordneDokumenterHandling = createAction<Partial<Partial<IDokumentPayload>>>(
  "klagebehandling/TILORDNE_DOKUMENT"
);
export const fradelDokumenterHandling = createAction<Partial<Partial<IDokumentPayload>>>(
  "klagebehandling/FRADEL_DOKUMENT"
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
              feiletHandling(error?.response?.detail || "feilet"),
              toasterSett({
                display: true,
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
  action$: ActionsObservable<PayloadAction<IDokumentPayload>>,
  state$: StateObservable<RootStateOrAny>,
  { get }: AjaxCreationMethod
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
              feiletHandling(error.response.detail),
              toasterSett({
                display: true,
                feilmelding: `Henting av tilordnede dokumenter feilet: ${error.response.detail}`,
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
          dokumentInfoId: action.payload.dokumentInfoId,
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
              feiletHandling(error?.response?.detail || "feilet"),
              toasterSett({
                display: true,
                feilmelding: `Tilordning av dokument feilet: (${error?.response?.detail})`,
              }),
              toasterSkjul(),
            ]);
          })
        );
    })
  );
}

export function FradelKlageDokumentEpos(
  action$: ActionsObservable<PayloadAction<IDokumentPayload>>,
  state$: StateObservable<RootStateOrAny>
) {
  return action$.pipe(
    ofType(fradelDokumenterHandling.type),
    switchMap((action) => {
      const url = `/api/klagebehandlinger/${action.payload.id}/journalposter/${action.payload.journalpostId}/dokumenter/${action.payload.dokumentInfoId}`;
      return ajaxDelete(url)
        .pipe(
          map((payload: { response: IInnstillinger }) =>
            fradeltDokumentHandling({
              journalpostId: action.payload.journalpostId,
              dokumentInfoId: action.payload.dokumentInfoId,
              payload: payload.response,
            })
          )
        )
        .pipe(
          retryWhen(provIgjenStrategi({ maksForsok: 0 })),
          catchError((error) => {
            console.debug(error);
            return concat([
              feiletHandling(error?.response?.detail || "feilet"),
              toasterSett({
                display: true,
                feilmelding: `Fradeling av dokument feilet: (${error?.response?.detail ?? error})`,
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
  FradelKlageDokumentEpos,
  HentDokumentForhandsvisningEpos,
];
