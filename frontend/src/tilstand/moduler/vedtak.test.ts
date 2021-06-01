import { of } from "rxjs";
import { ActionsObservable } from "redux-observable";
import { marbles } from "rxjs-marbles/jest";
import { TestScheduler } from "rxjs/testing";
import { AjaxResponse } from "rxjs/internal-compatibility";
import { DONE, lastOppVedlegg, lastOppVedleggEpos } from "./vedtak";
import { Dependencies } from "../konfigurerTilstand";
import { VEDLEGG_OPPDATERT } from "./klagebehandling/state";
import { IVedleggResponse } from "./klagebehandling/types";

class FormDataMock implements FormData {
  [Symbol.iterator] = jest.fn();
  append = jest.fn();
  getAll = jest.fn();
  delete = jest.fn();
  entries = jest.fn();
  forEach = jest.fn();
  get = jest.fn();
  has = jest.fn();
  keys = jest.fn();
  set = jest.fn();
  values = jest.fn();
}

describe("Vedtak epos", () => {
  let ts: TestScheduler;

  beforeEach(() => {
    ts = new TestScheduler((actual, expected) => expect(actual).toEqual(expected));
  });

  afterEach(() => {
    ts.flush();
  });

  test(
    "Last opp vedlegg",
    marbles(() => {
      ts.run((m) => {
        global.FormData = FormDataMock;

        const mockLastetOppResponse: IVedleggResponse = {
          klagebehandlingVersjon: 1,
          modified: "2021-12-31",
          file: {
            name: "test.pdf",
            size: 123,
            opplastet: "2021-12-31",
          },
        };

        const makeMockResponse = (response: any = null): AjaxResponse => ({
          response,
          status: 200,
          request: {},
          responseText: "",
          responseType: "application/json",
          xhr: {} as XMLHttpRequest,
          originalEvent: {} as Event,
        });

        const mockDependencies = {
          ajax: {
            post: (url: string, body: FormDataMock) => of(makeMockResponse(mockLastetOppResponse)),
          },
        };

        const inputActions = {
          a: lastOppVedlegg({
            file: {
              name: "test.pdf",
              size: 123,
              lastModified: 0,
              type: ".pdf",
              arrayBuffer: async () => new ArrayBuffer(0),
              slice: () => new Blob(),
              stream: () => new ReadableStream(),
              text: async () => "",
            },
            journalfoerendeEnhet: "",
            klagebehandlingId: "",
            klagebehandlingVersjon: 0,
            vedtakId: "",
          }),
        };
        const expectedActions = {
          a: VEDLEGG_OPPDATERT(mockLastetOppResponse),
          b: DONE(),
        };

        const action$ = new ActionsObservable(ts.createHotObservable("a", inputActions));

        const actual = lastOppVedleggEpos(action$, null, mockDependencies as Dependencies);
        ts.expectObservable(actual).toBe("(ab)", expectedActions);
      });
    })
  );
});
