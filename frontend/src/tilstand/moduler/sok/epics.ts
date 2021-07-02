import { PayloadAction } from "@reduxjs/toolkit";
import { ActionsObservable, StateObservable, ofType } from "redux-observable";
import { concat, of } from "rxjs";
import { debounceTime, switchMap } from "rxjs/operators";
import { Dependencies } from "../../konfigurerTilstand";
import { RootState } from "../../root";
import { SOK_LASTER } from "../sok/state";
import { performSearch, startSok } from "./actions";
import { IPersonSokPayload } from "./stateTypes";

export function sokEpos(
  action$: ActionsObservable<PayloadAction<IPersonSokPayload>>,
  state$: StateObservable<RootState>,
  { ajax }: Dependencies
) {
  return action$.pipe(
    ofType(startSok.type),
    debounceTime(1000),
    switchMap((action) => {
      return concat(
        of(SOK_LASTER(true)),
        performSearch(action.payload, ajax.post),
        of(SOK_LASTER(false))
      );
    })
  );
}

export const SOK_EPICS = [sokEpos];
