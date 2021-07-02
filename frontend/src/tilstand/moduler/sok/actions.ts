import { createAction } from "@reduxjs/toolkit";
import { concat, Observable, of } from "rxjs";
import { catchError, map, retryWhen } from "rxjs/operators";
import { AjaxResponse } from "rxjs/internal-compatibility";
import { provIgjenStrategi } from "../../../utility/rxUtils";
import { toasterSett, toasterSkjul } from "../toaster";
import { sokSlice } from "./state";
import { IPersonSokPayload } from "./stateTypes";

const { SOK_FAIL, SOK_RESPONSE } = sokSlice.actions;
export const startSok = createAction<IPersonSokPayload>("sok/SOK");
export const settSokLaster = createAction<boolean>("sok/SOK_LASTER");
export const tomSok = createAction("sok/SOK_TOM");

export const performSearch = (
  payload: IPersonSokPayload,
  post: { (url: string, body?: any, headers?: Object | undefined): Observable<AjaxResponse> }
) => {
  const url = `/api/ansatte/${payload.navIdent}/klagebehandlinger/personsoek`;
  let body = {
    soekString: payload.soekString,
    start: payload.start,
    antall: payload.antall,
  };

  return post(url, body, { "Content-Type": "application/json" })
    .pipe(map((payload) => SOK_RESPONSE(payload.response)))
    .pipe(
      retryWhen(provIgjenStrategi({ maksForsok: 1 })),
      catchError((error) => {
        return concat([
          SOK_FAIL(),
          toasterSett({
            display: true,
            type: "feil",
            feilmelding: `Søk feilet ${error}`,
          }),
          toasterSkjul(15),
        ]);
      })
    );
};
