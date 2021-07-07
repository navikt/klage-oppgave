import { clone } from "ramda";
import { IKlagebehandlingOppdatering } from "../../../tilstand/moduler/klagebehandling/types";
import { isEqual } from "./hooks";

describe("Klagebehandling oppdatering isEqual", () => {
  const getBaseOppdatering = (): IKlagebehandlingOppdatering => ({
    internVurdering: "internVurdering",
    klagebehandlingId: "klagebehandlingId",
    klagebehandlingVersjon: 1,
    tilknyttedeDokumenter: [],
    vedtak: [
      {
        grunn: "vedtak.grunn",
        brevMottakere: [],
        ferdigstilt: null,
        file: null,
        hjemler: [],
        id: "vedtak.id",
        opplastet: null,
        utfall: "vedtak.utfall",
      },
    ],
  });

  test("Like behandlinger er like", () => {
    const oppdatering = getBaseOppdatering();
    const enAnnenOppdatering = clone(oppdatering);
    expect(oppdatering).not.toBe(enAnnenOppdatering);
    const actual = isEqual(oppdatering, enAnnenOppdatering);
    expect(actual).toBe(true);
  });

  test("Behandlinger med forskjellige dokumenter er ikke like", () => {
    const oppdatering = getBaseOppdatering();
    oppdatering.tilknyttedeDokumenter.push({
      journalpostId: "journalpostId-1",
      dokumentInfoId: "dokumentInfoId-1",
    });
    const enAnnenOppdatering = clone(oppdatering);
    enAnnenOppdatering.tilknyttedeDokumenter.push({
      journalpostId: "journalpostId-2",
      dokumentInfoId: "dokumentInfoId-2",
    });
    expect(oppdatering).not.toBe(enAnnenOppdatering);
    const actual = isEqual(oppdatering, enAnnenOppdatering);
    expect(actual).toBe(false);
  });
});
