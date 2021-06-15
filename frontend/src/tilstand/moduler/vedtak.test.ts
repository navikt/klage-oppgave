import { of } from "rxjs";
import { ActionsObservable } from "redux-observable";
import { marbles } from "rxjs-marbles/jest";
import { TestScheduler } from "rxjs/testing";
import { AjaxResponse } from "rxjs/internal-compatibility";
import { DONE, lastOppVedlegg, lastOppVedtakEpos } from "./vedtak";
import { Dependencies } from "../konfigurerTilstand";
import { IVedlegg, VEDLEGG_OPPLASTET } from "./klagebehandling";

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
    "Last opp vedtak",
    marbles(() => {
      ts.run((m) => {
        global.FormData = FormDataMock;

        const mockLastetOppResponse: IVedlegg = {
          name: "test.pdf",
          content: "base64content",
          size: 123,
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
          a: VEDLEGG_OPPLASTET({ vedtakId: "", vedlegg: mockLastetOppResponse }),
          b: DONE(),
        };

        const action$ = new ActionsObservable(ts.createHotObservable("a", inputActions));

        const actual = lastOppVedtakEpos(action$, null, mockDependencies as Dependencies);
        ts.expectObservable(actual).toBe("(ab)", expectedActions);
      });
    })
  );
});
