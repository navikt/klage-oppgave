export const temaOversettelse = (tema: string): string => {
  switch (tema) {
    case "SYK":
      return "Sykepenger";
    case "DAG":
      return "Dagpenger";
    case "FOR":
      return "Foreldrepenger";
    default:
      return tema;
  }
};
export const typeOversettelse = (type: string): string => {
  switch (type) {
    case "ae0058":
      return "Klage";
    case "ae0046":
      return "Anke";
    default:
      return type;
  }
};
