import { ActionsObservable, StateObservable } from "redux-observable";
import { TestScheduler } from "rxjs/testing";
import { marbles } from "rxjs-marbles/jest";
import {
  klagebehandlingEpos,
  hentKlageHandling,
  hentetKlageHandling,
  IKlage,
} from "./klagebehandling";
import { ajax } from "rxjs/ajax";
import { of } from "rxjs";
import { RootStateOrAny } from "react-redux";
import { Dependencies } from "../konfigurerTilstand";

describe("Oppgave epos", () => {
  let ts: TestScheduler;
  const originalAjaxGet = ajax.get;

  beforeEach(() => {
    ts = new TestScheduler((actual, expected) => expect(actual).toEqual(expected));
  });

  afterEach(() => {
    ts.flush();
    ajax.get = originalAjaxGet;
  });

  /** Test henting av klageoppgave */
  test(
    "+++ HENT KLAGE",
    marbles(() => {
      ts.run((m) => {
        const inputMarble = "a-";
        const expectedMarble = "c-";

        const inputValues = {
          a: hentKlageHandling("123"),
        };
        const initState: Partial<IKlage> = {
          id: "123",
        };
        const mockedResponse: IKlage = {
          id: "64848",
          fraNAVEnhet: "4416",
          fraNAVEnhetNavn: "NAV Trondheim",
          mottattFoersteinstans: "2019-08-22",
          klagebehandlingVersjon: 0,
          foedselsnummer: "29125639036",
          sakenGjelderNavn: { fornavn: "Petter" },
          sakenGjelderKjoenn: "",
          sakenGjelderFoedselsnummer: "",
          tema: "43",
          type: "Klage",
          mottatt: "2021-01-26",
          frist: "2019-12-05",
          pageReference: "id...",
          pageRefs: [],
          historyNavigate: false,
          hasMore: true,
          currentPDF: "",
          dokumenterOppdatert: "",
          klageLastingFeilet: false,
          lasterDokumenter: false,
          klageLastet: false,
          dokumenterAlleHentet: false,
          dokumenterTilordnedeHentet: false,
          pageIdx: 0,
          hjemler: [{ kapittel: 8, paragraf: 14, original: "8-14" }],
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
          medunderskriverident: "",
          avsluttet: null,
          avsluttetAvSaksbehandler: null,
        };

        const reducerResponse = hentetKlageHandling(mockedResponse);

        const dependencies = {
          ajax: {
            getJSON: (id: string) => of(mockedResponse),
          },
        };

        const observableValues = {
          a: initState,
          c: {
            payload: reducerResponse.payload,
            type: hentetKlageHandling.type,
          },
        };

        const action$ = new ActionsObservable(ts.createHotObservable(inputMarble, inputValues));
        const state$ = new StateObservable(m.hot("a", observableValues), initState);
        const actual$ = klagebehandlingEpos(
          action$,
          state$ as RootStateOrAny,
          <Dependencies>dependencies
        );
        ts.expectObservable(actual$).toBe(expectedMarble, observableValues);
      });
    })
  );
});
