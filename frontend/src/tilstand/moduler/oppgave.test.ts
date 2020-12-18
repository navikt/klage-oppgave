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
import { of, throwError } from "rxjs";
import { AjaxCreationMethod } from "rxjs/internal-compatibility";
import { hentMegEpos, hentMegHandling } from "./meg";

describe("Oppgave epos", () => {
  let ts: TestScheduler;
  const originalAjaxGet = ajax.get;

  const mockApi = jest.fn();

  beforeEach(() => {
    ts = new TestScheduler((actual, expected) => expect(actual).toEqual(expected));
  });

  afterEach(() => {
    ts.flush();
    ajax.get = originalAjaxGet;
  });

  /**
   * Test queryBuilder
   */
  test("+++ QUERYBUILDER ytelse", () => {
    const inputValues = {
      ident: "ZATHRAS",
      enhetId: "42",
      antall: 2,
      start: 0,
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
      "/ansatte/ZATHRAS/oppgaver?ytelser=Sykepenger%2CDagpenger&antall=2&start=0&rekkefoelge=SYNKENDE&erTildeltSaksbehandler=false&enhetId=42"
    );
  });

  test("+++ QUERYBUILDER type", () => {
    const inputValues = {
      ident: "ZATHRAS",
      enhetId: "42",
      antall: 2,
      start: 0,
      transformasjoner: {
        sortering: {
          frist: "synkende" as "synkende",
        },
        filtrering: {
          typer: ["Klage"],
          ytelser: [
            ("Sykepenger" as unknown) as ytelseType,
            ("Dagpenger" as unknown) as ytelseType,
          ],
        },
      },
    };
    const url = buildQuery("/ansatte/ZATHRAS/oppgaver", inputValues);
    expect(url).toStrictEqual(
      "/ansatte/ZATHRAS/oppgaver?typer=Klage&ytelser=Sykepenger%2CDagpenger&antall=2&start=0&rekkefoelge=SYNKENDE&erTildeltSaksbehandler=false&enhetId=42"
    );
  });

  test("+++ QUERYBUILDER type", () => {
    const inputValues = {
      ident: "ZATHRAS",
      enhetId: "42",
      antall: 2,
      start: 0,
      transformasjoner: {
        sortering: {
          frist: "synkende" as "synkende",
        },
        filtrering: {
          typer: ["Feilutbetaling"],
          ytelser: [
            ("Sykepenger" as unknown) as ytelseType,
            ("Dagpenger" as unknown) as ytelseType,
          ],
        },
      },
    };
    const url = buildQuery("/ansatte/ZATHRAS/oppgaver", inputValues);
    expect(url).toStrictEqual(
      "/ansatte/ZATHRAS/oppgaver?typer=Feilutbetaling&ytelser=Sykepenger%2CDagpenger&antall=2&start=0&rekkefoelge=SYNKENDE&erTildeltSaksbehandler=false&enhetId=42"
    );
  });

  test("+++ QUERYBUILDER minesaker", () => {
    const inputValues = {
      ident: "ZATHRAS",
      enhetId: "42",
      antall: 2,
      start: 0,
      projeksjon: "UTVIDET" as "UTVIDET",
      transformasjoner: {
        sortering: {
          frist: "synkende" as "synkende",
        },
        filtrering: {
          typer: ["klage"],
          ytelser: [
            ("Sykepenger" as unknown) as ytelseType,
            ("Dagpenger" as unknown) as ytelseType,
          ],
        },
      },
    };
    const url = buildQuery("/ansatte/ZATHRAS/oppgaver", inputValues);
    expect(url).toStrictEqual(
      "/ansatte/ZATHRAS/oppgaver?typer=klage&ytelser=Sykepenger%2CDagpenger&antall=2&start=0&rekkefoelge=SYNKENDE&projeksjon=UTVIDET&enhetId=42"
    );
  });

  test("+++ QUERYBUILDER type", () => {
    const inputValues = {
      ident: "ZATHRAS",
      enhetId: "42",
      antall: 2,
      start: 0,
      transformasjoner: {
        sortering: {
          frist: "stigende" as "stigende",
        },
        filtrering: {
          type: undefined,
          ytelser: [
            ("Sykepenger" as unknown) as ytelseType,
            ("Dagpenger" as unknown) as ytelseType,
          ],
          hjemler: ["8-12", "9-31"],
        },
      },
    };
    const url = buildQuery("/ansatte/ZATHRAS/oppgaver", inputValues);
    expect(url).toStrictEqual(
      "/ansatte/ZATHRAS/oppgaver?ytelser=Sykepenger%2CDagpenger&hjemler=8-12%2C9-31&antall=2&start=0&rekkefoelge=STIGENDE&erTildeltSaksbehandler=false&enhetId=42"
    );
  });

  test("+++ QUERYBUILDER type", () => {
    const inputValues = {
      ident: "ZATHRAS",
      enhetId: "42",
      antall: 2,
      start: 0,
      transformasjoner: {
        sortering: {
          frist: "stigende" as "stigende",
        },
        filtrering: {
          type: undefined,
          ytelser: [
            ("Sykepenger" as unknown) as ytelseType,
            ("Dagpenger" as unknown) as ytelseType,
          ],
          hjemler: ["8-2, 8-13 og 8-49", "8-19", "8-16"],
        },
      },
    };
    const url = buildQuery("/ansatte/ZATHRAS/oppgaver", inputValues);
    expect(url).toStrictEqual(
      "/ansatte/ZATHRAS/oppgaver?ytelser=Sykepenger%2CDagpenger&hjemler=8-2%2C8-13%2C8-49%2C8-19%2C8-16&antall=2&start=0&rekkefoelge=STIGENDE&erTildeltSaksbehandler=false&enhetId=42"
    );
  });

  test("+++ QUERYBUILDER sideantall", () => {
    const inputValues = {
      ident: "ZATHRAS",
      enhetId: "42",
      antall: 25,
      start: 100,
      transformasjoner: {
        sortering: {
          frist: "stigende" as "stigende",
        },
      },
    };
    const url = buildQuery("/ansatte/ZATHRAS/oppgaver", inputValues);
    expect(url).toStrictEqual(
      "/ansatte/ZATHRAS/oppgaver?&antall=25&start=100&rekkefoelge=STIGENDE&erTildeltSaksbehandler=false&enhetId=42"
    );
  });

  test("+++ APP sideantall meta", () => {
    const inputValues = {
      ident: "ZATHRAS",
      enhetId: "42",
      antall: 15,
      start: 0,
      transformasjoner: {
        sortering: {
          frist: "stigende" as "stigende",
        },
      },
    };
    const url = buildQuery("/ansatte/ZATHRAS/oppgaver", inputValues);
    expect(url).toStrictEqual(
      "/ansatte/ZATHRAS/oppgaver?&antall=15&start=0&rekkefoelge=STIGENDE&erTildeltSaksbehandler=false&enhetId=42"
    );
  });

  test("+++ APP sideantall meta for side 1", () => {
    const mockedResponse = <RaderMedMetadataUtvidet>{
      antallTreffTotalt: 72,
      start: 0,
      antall: 15,
      oppgaver: [],
      transformasjoner: {
        filtrering: {},
        sortering: {
          frist: "stigende",
        },
      },
    };
    const initState = ({
      rader: [],
      transformasjoner: {},
      meta: {},
      lasterData: false,
    } as unknown) as OppgaveState;
    const resultState = MottatteRader(mockedResponse, initState);
    expect(resultState.meta.side).toStrictEqual(1);
  });

  test("+++ APP sideantall meta for side 2", () => {
    const mockedResponse = <RaderMedMetadataUtvidet>{
      antallTreffTotalt: 72,
      start: 15,
      antall: 15,
      projeksjon: "UTVIDET",
      oppgaver: [],
      transformasjoner: {
        filtrering: {},
        sortering: {
          frist: "stigende",
        },
      },
    };
    const initState = ({
      rader: [],
      transformasjoner: {},
      meta: {
        projeksjon: "UTVIDET",
      },
      lasterData: false,
    } as unknown) as OppgaveState;
    const resultState = MottatteRader(mockedResponse, initState);
    expect(resultState.meta.side).toStrictEqual(2);
  });
  test("+++ APP sideantall meta for side 3", () => {
    const mockedResponse = <RaderMedMetadataUtvidet>{
      antallTreffTotalt: 72,
      start: 30,
      antall: 15,
      oppgaver: [],
      transformasjoner: {
        filtrering: {},
        sortering: {
          frist: "stigende",
        },
      },
    };
    const initState = ({
      rader: [],
      transformasjoner: {},
      meta: {},
      lasterData: false,
    } as unknown) as OppgaveState;
    const resultState = MottatteRader(mockedResponse, initState);
    expect(resultState.meta.side).toStrictEqual(3);
    expect(resultState.meta.sider).toStrictEqual(5);
  });
  test("+++ APP sideantall meta for side 5", () => {
    const mockedResponse = <RaderMedMetadataUtvidet>{
      antallTreffTotalt: 72,
      start: 60,
      antall: 15,
      oppgaver: [],
      transformasjoner: {
        filtrering: {},
        sortering: {
          frist: "stigende",
        },
      },
    };
    const initState = ({
      rader: [],
      transformasjoner: {},
      meta: {},
      lasterData: false,
    } as unknown) as OppgaveState;
    const resultState = MottatteRader(mockedResponse, initState);
    expect(resultState.meta.side).toStrictEqual(5);
  });

  /**
   * Tester filtrering
   */

  test(
    "+++ FILTRER ETTER YTELSE",
    marbles(() => {
      ts.run((m) => {
        const inputMarble = "a-";
        const expectedMarble = "c-";

        const inputValues = {
          a: oppgaveRequest({
            ident: "ZATHRAS",
            enhetId: "42",
            antall: 2,
            start: 0,
            transformasjoner: {
              sortering: {
                frist: "synkende",
              },
              filtrering: {
                ytelser: [("Sykepenger" as unknown) as ytelseType],
              },
            },
          }),
        };
        const mockedResponse = <RaderMedMetadataUtvidet>{
          antallTreffTotalt: 2,
          start: 0,
          antall: 2,
          oppgaver: [
            { frist: "2019-09-12", ytelse: "SYK", hjemmel: "8-4" },
            { frist: "2020-11-15", ytelse: "SYK", hjemmel: "10-12" },
          ],
          transformasjoner: {
            sortering: {
              frist: "synkende",
            },
            filtrering: {
              ytelser: [("Sykepenger" as unknown) as ytelseType],
            },
          },
        };

        const dependencies = {
          getJSON: (url: string) => of(mockedResponse),
        };

        const initState = {
          oppgaver: {
            rader: [
              { frist: "2019-09-12", ytelse: "SYK", hjemmel: "8-4" },
              { frist: "2020-11-15", ytelse: "SYK", hjemmel: "10-12" },
              { frist: "2018-12-21", ytelse: "FOR", hjemmel: "9-11" },
              { frist: "2019-11-13", ytelse: "SYK", hjemmel: "10-1" },
              { frist: "2018-12-21", ytelse: "DAG", hjemmel: "mangler" },
            ],
          },
        };
        const resultPayload = MOTTATT(mockedResponse);

        const observableValues = {
          a: initState,
          c: {
            payload: resultPayload.payload,
            type: "oppgaver/MOTTATT",
          },
        };

        const action$ = new ActionsObservable(ts.createHotObservable(inputMarble, inputValues));
        const state$ = new StateObservable(m.hot("a", observableValues), initState);
        const actual$ = hentOppgaverEpos(action$, state$, <AjaxCreationMethod>dependencies);
        ts.expectObservable(actual$).toBe(expectedMarble, observableValues);
      });
    })
  );

  test(
    "+++ FILTRER ETTER HJEMMEL",
    marbles(() => {
      ts.run((m) => {
        const inputMarble = "a-";
        const expectedMarble = "c-";

        const inputValues = {
          a: oppgaveRequest({
            ident: "ZATHRAS",
            enhetId: "42",
            antall: 5,
            start: 0,
            transformasjoner: {
              sortering: {
                frist: "synkende",
              },
              filtrering: {
                hjemler: ["8-2, 8-13 og 8-49", "8-19"],
              },
            },
          }),
        };
        const mockedResponse = <RaderMedMetadataUtvidet>{
          antallTreffTotalt: 4,
          start: 0,
          antall: 5,
          oppgaver: [
            { frist: "2019-09-12", ytelse: "SYK", hjemmel: "8-2" },
            { frist: "2020-11-15", ytelse: "SYK", hjemmel: "8-13" },
            { frist: "2020-11-15", ytelse: "SYK", hjemmel: "8-49" },
            { frist: "2020-11-15", ytelse: "SYK", hjemmel: "8-19" },
          ],
          transformasjoner: inputValues.a.payload.transformasjoner,
        };

        const dependencies = {
          getJSON: (url: string) => of(mockedResponse),
        };

        const initState = {
          oppgaver: {
            rader: [
              { frist: "2019-09-12", ytelse: "SYK", hjemmel: "8-2" },
              { frist: "2020-11-15", ytelse: "SYK", hjemmel: "8-13" },
              { frist: "2020-11-15", ytelse: "SYK", hjemmel: "8-49" },
              { frist: "2020-11-15", ytelse: "SYK", hjemmel: "8-19" },
              { frist: "2020-11-15", ytelse: "SYK", hjemmel: "10-12" },
              { frist: "2018-12-21", ytelse: "FOR", hjemmel: "9-11" },
              { frist: "2019-11-13", ytelse: "SYK", hjemmel: "10-1" },
              { frist: "2018-12-21", ytelse: "DAG", hjemmel: "mangler" },
            ],
          },
        };
        const resultPayload = MOTTATT(mockedResponse);

        const observableValues = {
          a: initState,
          c: {
            payload: resultPayload.payload,
            type: "oppgaver/MOTTATT",
          },
        };

        const action$ = new ActionsObservable(ts.createHotObservable(inputMarble, inputValues));
        const state$ = new StateObservable(m.hot("a", observableValues), initState);
        const actual$ = hentOppgaverEpos(action$, state$, <AjaxCreationMethod>dependencies);
        ts.expectObservable(actual$).toBe(expectedMarble, observableValues);
      });
    })
  );

  test(
    "+++ HENT 'OPPGAVER' RETRY 3 ganger og så returner FEIL",
    marbles(() => {
      ts.run(({ hot, cold, expectObservable, expectSubscriptions }) => {
        const inputValues = {
          a: oppgaveRequest({
            ident: "ZATHRAS",
            enhetId: "42",
            antall: 5,
            start: 0,
            transformasjoner: {
              sortering: {
                frist: "synkende",
              },
            },
          }),
        };
        const action$ = new ActionsObservable(hot("-a", inputValues));

        const dependencies = {
          getJSON: (url: string) => of({}),
        };

        const initState = {
          oppgaver: {
            rader: [],
          },
        };

        const observableValues = {
          a: initState,
          s: {
            payload: {
              status: 503,
            },
            type: "oppgaver/FEILET",
          },
        };

        const state$ = new StateObservable(hot("-a", observableValues), initState);
        spyOn(dependencies, "getJSON").and.returnValue(throwError({ status: 503 }));
        expectObservable(hentOppgaverEpos(action$, state$, <AjaxCreationMethod>dependencies)).toBe(
          "12001ms s",
          observableValues
        );
      });
    })
  );
});
