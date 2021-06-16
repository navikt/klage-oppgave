import { INavn } from "../../../../tilstand/moduler/klagebehandling/stateTypes";

export const faaFulltNavn = (navn: INavn | null): string => {
  if (navn === null) {
    return "-";
  }
  const { fornavn, mellomnavn, etternavn } = navn;
  const navnListe = [fornavn, mellomnavn, etternavn].filter(
    (n) => typeof n === "string" && n.length !== 0
  );
  if (navnListe.length === 0) {
    return "-";
  }
  return navnListe.join(" ");
};

export const faaFulltNavnMedFnr = (navn: INavn | null, fnr: string | null) => {
  const fulltNavn = faaFulltNavn(navn);
  if (typeof fnr === "string" && fnr.length === 11) {
    return `${fulltNavn} (${fnr})`;
  }
  return fulltNavn;
};
