import { of } from "rxjs";
import { ActionsObservable } from "redux-observable";
import { marbles } from "rxjs-marbles/jest";
import { TestScheduler } from "rxjs/testing";
import { AjaxResponse } from "rxjs/internal-compatibility";
import { IKlagebehandlingPayload, lagreKlagebehandlingEpic } from "./epics";
import { LEDIG, OPPDATER_KLAGEBEHANDLING } from "./state";
import { Dependencies } from "../../konfigurerTilstand";
import { IKlagebehandlingOppdatering, IKlagebehandlingOppdateringResponse } from "./types";
import { delay } from "rxjs/operators";

describe("Klagebehandling epos", () => {
  let ts: TestScheduler;

  beforeEach(() => {
    ts = new TestScheduler((actual, expected) => expect(actual).toEqual(expected));
  });

  afterEach(() => {
    ts.flush();
  });

  test(
    "Lagre klagebehandling",
    marbles(() => {
      // ts.run((m) => {
      //   const makeMockResponse = (response: IKlagebehandlingOppdateringResponse): AjaxResponse => ({
      //     response,
      //     status: 200,
      //     request: {},
      //     responseText: "",
      //     responseType: "application/json",
      //     xhr: {} as XMLHttpRequest,
      //     originalEvent: {} as Event,
      //   });
      //   let version = 0;
      //   const mockDependencies = {
      //     ajax: {
      //       put: (url: string, body: IKlagebehandlingPayload) =>
      //         of(
      //           makeMockResponse({
      //             klagebehandlingVersjon: (version += 1),
      //           })
      //         ).pipe(delay(500)),
      //     },
      //   };
      //   const payload: IKlagebehandlingOppdatering = {
      //     internVurdering: "internVurdering",
      //     klagebehandlingId: "",
      //     klagebehandlingVersjon: 0,
      //     tilknyttedeDokumenter: [],
      //     vedtak: [
      //       {
      //         brevMottakere: [],
      //         ferdigstilt: null,
      //         file: null,
      //         grunn: "",
      //         hjemler: [],
      //         id: "",
      //         utfall: "",
      //       },
      //     ],
      //   };
      //   const inputActions = {
      //     a: oppdaterKlagebehandling(payload),
      //   };
      //   const expectedActions = {
      //     x: OPPDATER_KLAGEBEHANDLING({
      //       klagebehandlingVersjon: 1,
      //     }),
      //     y: LEDIG(),
      //   };
      //   const action$ = new ActionsObservable(ts.createHotObservable("a", inputActions));
      //   const actual = lagreKlagebehandlingEpic(action$, null, mockDependencies as Dependencies);
      //   ts.expectObservable(actual).toBe("500ms (xy)", expectedActions);
      // });
    })
  );
});
