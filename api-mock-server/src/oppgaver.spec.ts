import { filtrerOppgaver } from "./oppgaver";

type Oppgaver = {
  antallTreffTotalt: number;
  oppgaver: [
    {
      frist: string;
      type: string;
      ytelse: string;
      hjemmel: string;
    }
  ];
};

describe("tester oppgavehenting", () => {
  it("filtrer etter type klage", async () => {
    let query = {
      antall: 5,
      start: 0,
      typer: "Klage",
      rekkefoelge: "SYNKENDE" as "SYNKENDE",
      navIdent: "ZATHRAS",
    };
    let resultat: Oppgaver = await filtrerOppgaver(query);
    //expect(result.antallTreffTotalt).toEqual(51);
    expect(resultat.oppgaver?.length).toEqual(5);
    let i = 0;
    while (++i < resultat.oppgaver.length)
      expect(resultat.oppgaver[i].type).toEqual("klage");
  });
  it("filtrer etter type anke", async () => {
    let query = {
      antall: 5,
      start: 0,
      typer: "Anke",
      rekkefoelge: "SYNKENDE" as "SYNKENDE",
      navIdent: "ZATHRAS",
    };
    let resultat: Oppgaver = await filtrerOppgaver(query);
    //expect(result.antallTreffTotalt).toEqual(51);
    expect(resultat.oppgaver?.length).toEqual(5);
    let i = 0;
    while (++i < resultat.oppgaver.length)
      expect(resultat.oppgaver[i].type).toEqual("anke");
  });
  it("filtrer etter type klage og anke", async () => {
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
    while (++i < resultat.oppgaver.length)
      expect(
        resultat.oppgaver[i].type == "anke" ||
          resultat.oppgaver[i].type == "klage"
      ).toBe(true);
  });

  it("filtrer etter ytelse Sykepenger", async () => {
    let query = {
      antall: 5,
      start: 0,
      ytelser: "Sykepenger",
      rekkefoelge: "SYNKENDE" as "SYNKENDE",
      navIdent: "ZATHRAS",
    };
    let resultat: Oppgaver = await filtrerOppgaver(query);
    //expect(result.antallTreffTotalt).toEqual(51);
    expect(resultat.oppgaver?.length).toEqual(5);
    let i = 0;
    while (++i < resultat.oppgaver.length)
      expect(resultat.oppgaver[i].ytelse).toEqual("Sykepenger");
  });
  it("filtrer etter ytelse Dagpenger", async () => {
    let query = {
      antall: 5,
      start: 0,
      ytelser: "Dagpenger",
      rekkefoelge: "SYNKENDE" as "SYNKENDE",
      navIdent: "ZATHRAS",
    };
    let resultat: Oppgaver = await filtrerOppgaver(query);
    //expect(result.antallTreffTotalt).toEqual(51);
    expect(resultat.oppgaver?.length).toEqual(5);
    let i = 0;
    while (++i < resultat.oppgaver.length)
      expect(resultat.oppgaver[i].ytelse).toEqual("Dagpenger");
  });

  it("filtrer etter ytelse Foreldrepenger og Dagpenger", async () => {
    let query = {
      antall: 5,
      start: 0,
      ytelser: "Dagpenger,Foreldrepenger",
      rekkefoelge: "SYNKENDE" as "SYNKENDE",
      navIdent: "ZATHRAS",
    };
    let resultat: Oppgaver = await filtrerOppgaver(query);
    //expect(result.antallTreffTotalt).toEqual(51);
    expect(resultat.oppgaver?.length).toEqual(5);
    let i = 0;
    while (++i < resultat.oppgaver.length)
      expect(
        resultat.oppgaver[i].ytelse == "Foreldrepenger" ||
          resultat.oppgaver[i].ytelse == "Dagpenger"
      ).toBe(true);
  });

  it("filtrer etter ytelse Dagpenger", async () => {
    let query = {
      antall: 5,
      start: 0,
      ytelser: "Dagpenger",
      rekkefoelge: "SYNKENDE" as "SYNKENDE",
      navIdent: "ZATHRAS",
    };
    let resultat: Oppgaver = await filtrerOppgaver(query);
    //expect(result.antallTreffTotalt).toEqual(51);
    expect(resultat.oppgaver?.length).toEqual(5);
    let i = 0;
    while (++i < resultat.oppgaver.length)
      expect(resultat.oppgaver[i].ytelse).toEqual("Dagpenger");
  });

  it("filtrer etter hjemmel 8-61", async () => {
    let query = {
      antall: 15,
      start: 0,
      hjemler: "8-61",
      rekkefoelge: "SYNKENDE" as "SYNKENDE",
      navIdent: "ZATHRAS",
    };
    let result = await filtrerOppgaver(query);
    expect(result.oppgaver.length).toBeGreaterThan(1);
    let i = 0;
    while (++i < result.oppgaver.length)
      expect(result.oppgaver[i].hjemmel).toEqual("8-61");
  });
  it("filtrer etter hjemmel 8-61 og 8-62", async () => {
    let query = {
      antall: 15,
      start: 0,
      hjemler: "8-61,8-62",
      rekkefoelge: "SYNKENDE" as "SYNKENDE",
      navIdent: "ZATHRAS",
    };
    let result = await filtrerOppgaver(query);
    expect(result.oppgaver.length).toBeGreaterThan(1);
    let i = 0;
    while (++i < result.oppgaver.length) {
      expect(
        result.oppgaver[i].hjemmel === "8-61" ||
          result.oppgaver[i].hjemmel === "8-62"
      ).toBe(true);
    }
  });
  it("filtrer etter hjemmel 8-62 og 8-61 og ytelse Foreldrepenger", async () => {
    let query = {
      antall: 15,
      start: 0,
      hjemler: "8-61,8-62",
      ytelser: "Foreldrepenger",
      rekkefoelge: "SYNKENDE" as "SYNKENDE",
      navIdent: "ZATHRAS",
    };
    let result = await filtrerOppgaver(query);
    //expect(result.antallTreffTotalt).toEqual(51);
    expect(result.oppgaver.length).toBeGreaterThan(1);
    let i = 0;
    while (++i < result.oppgaver.length) {
      expect(result.oppgaver[i].ytelse === "Foreldrepenger");
      expect(
        result.oppgaver[i].hjemmel == "8-62" ||
          result.oppgaver[i].hjemmel == "8-61"
      ).toBe(true);
    }
  });
});
