import { createAction, PayloadAction } from "@reduxjs/toolkit";
import { RootStateOrAny } from "react-redux";
import { ActionsObservable, ofType, StateObservable } from "redux-observable";
import { AjaxCreationMethod } from "rxjs/internal-compatibility";
import { map } from "rxjs/operators";

//==========
// Actions
//==========

// export const { HENTET_KODEVERK, MOTTATT, FEILET, HENTET_UGATTE } = oppgaveSlice.actions;
export const hentEnhet = createAction("behandlingsskjema/HENT_ENHET");
export const hentetEnhet = createAction<string>("behandlingsskjema/HENTET_ENHET");
export const lagreX = createAction("behandlingsskjema/LAGRE_X");

//==========
// Epos
//==========

export function HentEnhetEpos(
  action$: ActionsObservable<PayloadAction<any>>,
  state$: StateObservable<RootStateOrAny>,
  { get }: AjaxCreationMethod
) {
  return action$.pipe(
    ofType(hentEnhet.type),
    map((action) => {
      let url = `/api/klagebehandlinger/${action.payload.id}/journalposter/${action.payload.journalpostId}/dokumenter/${action.payload.dokumentInfoId}`;
      return hentetEnhet(url);
    })
  );
}
