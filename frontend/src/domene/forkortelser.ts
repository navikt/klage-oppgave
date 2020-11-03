export const ytelseOversettelse = (ytelse: string): string => {
  if (!ytelse) debugger;
  switch (ytelse) {
    case "SYK":
      return "Sykepenger";
    case "DAG":
      return "Dagpenger";
    case "FOR":
      return "Foreldrepenger";
    default:
      return ytelse;
  }
};
export const typeOversettelse = (type: string): string => {
  switch (type) {
    case "klage":
      return "Klage";
    case "anke":
      return "Anke";
    default:
      return type;
  }
};
