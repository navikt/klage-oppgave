export type OppgaveQuery = {
  typer?: string;
  hjemler?: string;
  ytelser?: string;
  antall: number;
  start: number;
  rekkefoelge: "SYNKENDE" | "STIGENDE";
};
