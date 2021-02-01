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
  timeout,
  withLatestFrom,
} from "rxjs/operators";
import { provIgjenStrategi } from "../../utility/rxUtils";
import { AjaxCreationMethod } from "rxjs/internal-compatibility";

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
  dokumenter?: any;
}

interface IKlagePayload {
  id: string;
}

//==========
// Reducer
//==========
export const klageSlice = createSlice({
  name: "klagebehandling",
  initialState: {
    id: "",
    klageInnsendtdato: undefined,
    fraNAVEnhet: "4416",
    mottattFoersteinstans: "2019-08-22",
    foedselsnummer: "29125639036",
    tema: "SYK",
    sakstype: "Klage",
    mottatt: "2021-01-26",
    startet: undefined,
    avsluttet: undefined,
    frist: "2019-12-05",
    tildeltSaksbehandlerident: undefined,
    hjemler: [],
  } as IKlage,
  reducers: {
    HENTET: (state, action: PayloadAction<IKlage>) => {
      state = action.payload;
      return state;
    },
    DOKUMENTER_HENTET: (state, action: PayloadAction<IKlage>) => {
      state.dokumenter = action.payload;
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
export const hentKlageDokumenterHandling = createAction<string>(
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
          map((response: IKlagePayload) => {
            return R.compose(R.omit("id"))(response);
          })
        )
        .pipe(
          map((data) => {
            return hentetKlageHandling(data as any);
          })
        )
        .pipe(
          retryWhen(provIgjenStrategi({ maksForsok: 3 })),
          catchError((error) => {
            return of(feiletHandling(error.message));
          })
        );
    })
  );
}

export function klagebehandlingDokumenterEpos(
  action$: ActionsObservable<PayloadAction<string>>,
  state$: StateObservable<RootStateOrAny>,
  { getJSON }: AjaxCreationMethod
) {
  return action$.pipe(
    ofType(hentKlageDokumenterHandling.type),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      let klageUrl = `/klagebehandlinger/${action.payload}/alledokumenter`;
      return getJSON<IKlagePayload>(klageUrl)
        .pipe(
          timeout(5000),
          map((response: IKlagePayload) => {
            return R.compose(R.omit("id"))(response);
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
            return of(feiletHandling(error.message));
          })
        );
    })
  );
}

export const KLAGEBEHANDLING_EPICS = [klagebehandlingEpos, klagebehandlingDokumenterEpos];
