import { filtrerOppgaver } from "./oppgaver";

describe("tester oppgavehenting", () => {
  it("filtrer etter type klage", () => {
    let query = {
      antall: 5,
      start: 0,
      type: "Klage",
      rekkefoelge: "SYNKENDE" as "SYNKENDE",
    };
    let result = filtrerOppgaver(query);
    expect(result.antallTreffTotalt).toEqual(51);
    expect(result.oppgaver.length).toEqual(5);
    let i = 0;
    while (++i < result.oppgaver.length)
      expect(result.oppgaver[i].type).toEqual("klage");
  });
  it("filtrer etter type anke", () => {
    let query = {
      antall: 5,
      start: 0,
      type: "Anke",
      rekkefoelge: "SYNKENDE" as "SYNKENDE",
    };
    let result = filtrerOppgaver(query);
    expect(result.antallTreffTotalt).toEqual(51);
    expect(result.oppgaver.length).toEqual(5);
    let i = 0;
    while (++i < result.oppgaver.length)
      expect(result.oppgaver[i].type).toEqual("anke");
  });

  it("filtrer etter ytelse Sykepenger", () => {
    let query = {
      antall: 5,
      start: 0,
      ytelse: "Sykepenger",
      rekkefoelge: "SYNKENDE" as "SYNKENDE",
    };
    let result = filtrerOppgaver(query);
    expect(result.antallTreffTotalt).toEqual(51);
    expect(result.oppgaver.length).toEqual(5);
    let i = 0;
    while (++i < result.oppgaver.length)
      expect(result.oppgaver[i].ytelse).toEqual("Sykepenger");
  });
  it("filtrer etter ytelse Dagpenger", () => {
    let query = {
      antall: 5,
      start: 0,
      ytelse: "Dagpenger",
      rekkefoelge: "SYNKENDE" as "SYNKENDE",
    };
    let result = filtrerOppgaver(query);
    expect(result.antallTreffTotalt).toEqual(51);
    expect(result.oppgaver.length).toEqual(5);
    let i = 0;
    while (++i < result.oppgaver.length)
      expect(result.oppgaver[i].ytelse).toEqual("Dagpenger");
  });
  it("filtrer etter ytelse Foreldrepenger", () => {
    let query = {
      antall: 5,
      start: 0,
      ytelse: "Foreldrepenger",
      rekkefoelge: "SYNKENDE" as "SYNKENDE",
    };
    let result = filtrerOppgaver(query);
    expect(result.antallTreffTotalt).toEqual(51);
    expect(result.oppgaver.length).toEqual(5);
    let i = 0;
    while (++i < result.oppgaver.length)
      expect(result.oppgaver[i].ytelse).toEqual("Foreldrepenger");
  });
  it("filtrer etter hjemmel 8-61", () => {
    let query = {
      antall: 15,
      start: 0,
      hjemmel: "8-61",
      rekkefoelge: "SYNKENDE" as "SYNKENDE",
    };
    let result = filtrerOppgaver(query);
    expect(result.antallTreffTotalt).toEqual(51);
    expect(result.oppgaver.length).toBeGreaterThan(1);
    let i = 0;
    while (++i < result.oppgaver.length)
      expect(result.oppgaver[i].hjemmel).toEqual("8-61");
  });
  xit("filtrer etter hjemmel 8-61 og 8-62", () => {
    let query = {
      antall: 15,
      start: 0,
      hjemmel: "8-61,8-62",
      rekkefoelge: "SYNKENDE" as "SYNKENDE",
    };
    let result = filtrerOppgaver(query);
    expect(result.antallTreffTotalt).toEqual(51);
    expect(result.oppgaver.length).toBeGreaterThan(1);
    let i = 0;
    while (++i < result.oppgaver.length) {
      expect(
        result.oppgaver[i].hjemmel === "8-61" ||
          result.oppgaver[i].hjemmel === "8-62"
      ).toBe(true);
    }
  });
});
