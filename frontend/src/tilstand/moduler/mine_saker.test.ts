import { ActionsObservable, StateObservable } from "redux-observable";
import { TestScheduler } from "rxjs/testing";
import { marbles } from "rxjs-marbles/jest";
import {
  buildQuery,
  hentOppgaverEpos,
  oppgaveRequest,
  MOTTATT,
  RaderMedMetadata,
  RaderMedMetadataUtvidet,
  oppgaveSlice,
  MottatteRader,
  OppgaveState,
  OppgaveRad,
  Transformasjoner,
  ytelseType,
} from "./oppgave";
import { ajax } from "rxjs/ajax";
import { of } from "rxjs";
import { AjaxCreationMethod } from "rxjs/internal-compatibility";

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

  /**
   * Tester henting
   */
  /**
   * Test queryBuilder
   */
  test("+++ QUERYBUILDER projeksjon og tildellt", () => {
    const inputValues = {
      ident: "ZATHRAS",
      antall: 2,
      start: 0,
      tildeltSaksbehandler: "ZATHRAS",
      projeksjon: "UTVIDET" as "UTVIDET",
      transformasjoner: {
        sortering: {
          frist: "synkende" as "synkende",
        },
        filtrering: {
          ytelser: [
            ("Sykepenger" as unknown) as ytelseType,
            ("Dagpenger" as unknown) as ytelseType,
          ],
        },
      },
    };
    const url = buildQuery("/ansatte/ZATHRAS/oppgaver", inputValues);
    expect(url).toStrictEqual(
      "/ansatte/ZATHRAS/oppgaver?ytelser=Sykepenger%2CDagpenger&antall=2&start=0&rekkefoelge=SYNKENDE&projeksjon=UTVIDET&tildeltSaksbehandler=ZATHRAS"
    );
  });
});
