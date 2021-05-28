import { createAction, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootStateOrAny } from "react-redux";
import { ActionsObservable, ofType, StateObservable } from "redux-observable";
import { AjaxCreationMethod } from "rxjs/internal-compatibility";
import { catchError, map, retryWhen, switchMap, timeout, withLatestFrom } from "rxjs/operators";
import { concat, of } from "rxjs";
import { provIgjenStrategi } from "../../utility/rxUtils";
import { IKlage } from "./klagebehandling";
import { displayToast, feiletHandling, skjulToaster } from "./meg";
import { RootState } from "../root";
import { FEILET, MOTTATT, RaderMedMetadata, RaderMedMetadataUtvidet } from "./oppgave";

//==========
// Interfaces
//==========

export interface IKlageInfoPayload {
  utfall: string | null;
  grunn: string | null;
  hjemler: string[];
  internVurdering: string;
}

export interface IUtfallPayload {
  klagebehandlingid: string;
  vedtakid: string;
  utfall: string | null;
  klagebehandlingVersjon: number;
}

export interface IOmgjoeringsgrunnPayload {
  klagebehandlingid: string;
  vedtakid: string;
  omgjoeringsgrunn: string | null;
  klagebehandlingVersjon: number;
}

export interface IHjemlerPayload {
  klagebehandlingid: string;
  vedtakid: string;
  hjemler: string[];
  klagebehandlingVersjon: number;
}

export interface IInternVurderingPayload {
  klagebehandlingid: string;
  internVurdering: string;
  klagebehandlingVersjon: number;
}

export interface IInternVurderingPayload {
  klagebehandlingid: string;
  internVurdering: string;
}

//==========
// Reducer
//==========

const initialStateBehandlingsVedtak = {
  id: "",
  utfall: null as null | string,
  brevMottakere: [],
  grunn: null as null | string,
  hjemler: [] as string[],
  internVurdering: "",
  lasterKlage: true,
  klagebehandlingVersjon: 0,
};

export const behandlingsvedtakSlice = createSlice({
  name: "behandlingsvedtak",
  initialState: initialStateBehandlingsVedtak,
  reducers: {
    SETT_KLAGE_INFO: (state, action: PayloadAction<IKlageInfoPayload>) => {
      return {
        ...state,
        utfall: action.payload.utfall,
        grunn: action.payload.grunn,
        hjemler: action.payload.hjemler,
        internVurdering: action.payload.internVurdering,
        lasterKlage: false,
      };
    },
    LAGRE_INTERN_VURDERING: (state, action: PayloadAction<IInternVurderingPayload>) => {
      return { ...state, internVurdering: action.payload.internVurdering };
    },
    LAGRE_UTFALL: (state, action: PayloadAction<IUtfallPayload>) => {
      return { ...state, utfall: action.payload.utfall };
    },
    LAGRE_OMGJOERINGSGRUNN: (state, action: PayloadAction<IOmgjoeringsgrunnPayload>) => {
      return { ...state, grunn: action.payload.omgjoeringsgrunn };
    },
    LAGRE_HJEMLER: (state, action: PayloadAction<IHjemlerPayload>) => {
      return { ...state, hjemler: action.payload.hjemler };
    },
  },
});

export default behandlingsvedtakSlice.reducer;

//==========
// Actions
//==========

const {
  LAGRE_UTFALL,
  LAGRE_OMGJOERINGSGRUNN,
  LAGRE_INTERN_VURDERING,
  LAGRE_HJEMLER,
} = behandlingsvedtakSlice.actions;
export const settKlageInfo = createAction<IKlageInfoPayload>("behandlingsvedtak/SETT_KLAGE_INFO");

export const lagreInternVurdering = createAction<IInternVurderingPayload>(
  "behandlingsvedtak/SETT_INTERN_VURDERING"
);
export const internVurderingSatt = createAction<string>("behandlingsvedtak/INTERN_VURDERING_SATT");

export const lagreUtfall = createAction<IUtfallPayload>("behandlingsvedtak/SETT_UTFALL");

export const lagreOmgjoeringsgrunn = createAction<IOmgjoeringsgrunnPayload>(
  "behandlingsvedtak/SETT_OMGJOERINGSGRUNN"
);

export const lagreHjemler = createAction<IHjemlerPayload>("behandlingsvedtak/SETT_HJEMLER");

//==========
// Epos
//==========

export function lagreInternVurderingEpos(
  action$: ActionsObservable<PayloadAction<IInternVurderingPayload>>,
  state$: StateObservable<RootState>,
  { put }: AjaxCreationMethod
) {
  return action$.pipe(
    ofType(lagreInternVurdering.type),
    withLatestFrom(state$),
    switchMap(([action]) => {
      const lagreInternVurderingUrl = `/api/klagebehandlinger/${action.payload.klagebehandlingid}/detaljer/internvurdering`;
      return put(
        lagreInternVurderingUrl,
        {
          internVurdering: action.payload.internVurdering,
          klagebehandlingVersjon: action.payload.klagebehandlingVersjon,
        },
        { "Content-Type": "application/json" }
      )
        .pipe(map((payload: { response: any }) => lagreInternVurdering(payload.response)))
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

export function lagreUtfallEpos(
  action$: ActionsObservable<PayloadAction<IUtfallPayload>>,
  state$: StateObservable<RootStateOrAny>,
  { put }: AjaxCreationMethod
) {
  return action$.pipe(
    ofType(lagreUtfall.type),
    withLatestFrom(state$),
    switchMap(([action]) => {
      const lagreUtfallUrl = `/api/klagebehandlinger/${action.payload.klagebehandlingid}/vedtak/${action.payload.vedtakid}/utfall`;
      const lagre = put(
        lagreUtfallUrl,
        {
          utfall: action.payload.utfall,
          klagebehandlingVersjon: action.payload.klagebehandlingVersjon,
        },
        { "Content-Type": "application/json" }
      ).pipe(
        timeout(5000),
        map((payload: { response: any }) => LAGRE_UTFALL(payload.response))
      );
      return lagre.pipe(
        retryWhen(provIgjenStrategi()),
        catchError((error) => {
          let err = error?.response?.detail || "ukjent feil";
          return concat([feiletHandling(err), displayToast(err), skjulToaster()]);
        })
      );
    })
  );
}

export function lagreOmgjoeringsgrunnEpos(
  action$: ActionsObservable<PayloadAction<IOmgjoeringsgrunnPayload>>,
  state$: StateObservable<RootStateOrAny>,
  { put }: AjaxCreationMethod
) {
  return action$.pipe(
    ofType(lagreOmgjoeringsgrunn.type),
    withLatestFrom(state$),
    switchMap(([action]) => {
      const lagreOmgjoeringsgrunnUrl = `/api/klagebehandlinger/${action.payload.klagebehandlingid}/vedtak/${action.payload.vedtakid}/grunn`;
      return put(
        lagreOmgjoeringsgrunnUrl,
        {
          grunn: action.payload.omgjoeringsgrunn,
          klagebehandlingVersjon: action.payload.klagebehandlingVersjon,
        },
        { "Content-Type": "application/json" }
      )
        .pipe(map((payload: { response: any }) => LAGRE_INTERN_VURDERING(payload.response)))
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

export function lagreHjemlerEpos(
  action$: ActionsObservable<PayloadAction<IHjemlerPayload>>,
  state$: StateObservable<RootState>,
  { put }: AjaxCreationMethod
) {
  return action$.pipe(
    ofType(lagreHjemler.type),
    withLatestFrom(state$),
    switchMap(([action]) => {
      const lagreHjemlerUrl = `/api/klagebehandlinger/${action.payload.klagebehandlingid}/vedtak/${action.payload.vedtakid}/hjemler`;
      return put(
        lagreHjemlerUrl,
        {
          hjemler: action.payload.hjemler,
          klagebehandlingVersjon: action.payload.klagebehandlingVersjon,
        },
        { "Content-Type": "application/json" }
      )
        .pipe(map((payload: { response: any }) => LAGRE_HJEMLER(payload.response)))
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

export const BEHANDLINGSSKJEMA_EPICS = [
  lagreInternVurderingEpos,
  lagreUtfallEpos,
  lagreOmgjoeringsgrunnEpos,
  lagreHjemlerEpos,
];

//==========
// Vis feilmeldinger ved feil
//==========
