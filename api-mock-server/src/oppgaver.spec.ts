import { filtrerOppgaver } from "./oppgaver";

type Oppgaver = {
  antallTreffTotalt: number;
  klagebehandlinger: [
    {
      frist: string;
      type: string;
      tema: string;
      hjemmel: string;
    }
  ];
};

describe("tester oppgavehenting", () => {
  it("filtrer etter type klage", async () => {
    let query = {
      antall: 5,
      start: 0,
      typer: "1",
      rekkefoelge: "SYNKENDE" as "SYNKENDE",
      navIdent: "ZATHRAS",
    };
    let resultat: Oppgaver = await filtrerOppgaver(query);
    //expect(result.antallTreffTotalt).toEqual(51);
    expect(resultat.klagebehandlinger?.length).toEqual(5);
    let i = 0;
    while (++i < resultat.klagebehandlinger.length)
      expect(resultat.klagebehandlinger[i].type).toEqual("1");
  });
  //kommentert ut da vi ikke lenger har anke
  xit("filtrer etter type anke", async () => {
    let query = {
      antall: 5,
      start: 0,
      typer: "Anke",
      rekkefoelge: "SYNKENDE" as "SYNKENDE",
      navIdent: "ZATHRAS",
    };
    let resultat: Oppgaver = await filtrerOppgaver(query);
    expect(resultat.klagebehandlinger?.length).toEqual(5);
    let i = 0;
    while (++i < resultat.klagebehandlinger.length)
      expect(resultat.klagebehandlinger[i].type).toEqual("anke");
  });
  xit("filtrer etter type klage og anke", async () => {
    let query = {
      antall: 5,
      start: 0,
      typer: "Anke,Klage",
      rekkefoelge: "SYNKENDE" as "SYNKENDE",
      navIdent: "ZATHRAS",
    };
    let resultat: Oppgaver = await filtrerOppgaver(query);
    //expect(result.antallTreffTotalt).toEqual(51);
    let i = 0;
    while (++i < resultat.klagebehandlinger.length)
      expect(
        resultat.klagebehandlinger[i].type == "anke" ||
          resultat.klagebehandlinger[i].type == "klage"
      ).toBe(true);
  });

  it("filtrer etter ytelse Sykepenger", async () => {
    let query = {
      antall: 5,
      start: 0,
      temaer: "43",
      rekkefoelge: "SYNKENDE" as "SYNKENDE",
      navIdent: "ZATHRAS",
    };
    let resultat: Oppgaver = await filtrerOppgaver(query);
    expect(resultat.klagebehandlinger?.length).toEqual(5);
    let i = 0;
    while (++i < resultat.klagebehandlinger.length)
      expect(resultat.klagebehandlinger[i].tema).toEqual("43");
  });
  it("filtrer etter enkeltytelse ", async () => {
    let query = {
      antall: 5,
      start: 0,
      temaer: "30",
      rekkefoelge: "SYNKENDE" as "SYNKENDE",
      navIdent: "ZATHRAS",
    };
    let resultat: Oppgaver = await filtrerOppgaver(query);
    expect(resultat.klagebehandlinger?.length).toBeGreaterThanOrEqual(0);
    let i = 0;
    while (++i < resultat.klagebehandlinger.length)
      expect(resultat.klagebehandlinger[i].tema).toEqual("30");
  });

  it("filtrer etter ytelse Foreldrepenger og Dagpenger", async () => {
    let query = {
      antall: 5,
      start: 0,
      temaer: "30,43",
      rekkefoelge: "SYNKENDE" as "SYNKENDE",
      navIdent: "ZATHRAS",
    };
    let resultat: Oppgaver = await filtrerOppgaver(query);
    //expect(result.antallTreffTotalt).toEqual(51);
    expect(resultat.klagebehandlinger?.length).toEqual(5);
    let i = 0;
    while (++i < resultat.klagebehandlinger.length)
      expect(
        resultat.klagebehandlinger[i].tema == "30" ||
          resultat.klagebehandlinger[i].tema == "43"
      ).toBe(true);
  });

  it("filtrer etter hjemmel 8-3", async () => {
    let query = {
      antall: 15,
      start: 0,
      hjemler: "1000.008.003",
      rekkefoelge: "SYNKENDE" as "SYNKENDE",
      navIdent: "ZATHRAS",
    };
    let result = await filtrerOppgaver(query);
    expect(result.klagebehandlinger.length).toBeGreaterThan(1);
    let i = 0;
    while (++i < result.klagebehandlinger.length)
      expect(result.klagebehandlinger[i].hjemmel).toEqual("1000.008.003");
  });
  it("filtrer etter to hjemler", async () => {
    let query = {
      antall: 15,
      start: 0,
      hjemler: "1000.008.003, 1000.008.004",
      rekkefoelge: "SYNKENDE" as "SYNKENDE",
      navIdent: "ZATHRAS",
    };
    let result = await filtrerOppgaver(query);
    expect(result.klagebehandlinger.length).toBeGreaterThan(1);
    let i = 0;
    while (++i < result.klagebehandlinger.length) {
      expect(
        result.klagebehandlinger[i].hjemmel === "1000.008.003" ||
          result.klagebehandlinger[i].hjemmel === "1000.008.004"
      ).toBe(true);
    }
  });
  it("filtrer etter dato fullført", async () => {
    let query = {
      antall: 15,
      start: 0,
      fullfortFom: "2020-01-01",
      rekkefoelge: "SYNKENDE" as "SYNKENDE",
      navIdent: "ZATHRAS",
    };
    let result = await filtrerOppgaver(query);
    expect(result.klagebehandlinger.length).toBeGreaterThan(1);
  });
});
