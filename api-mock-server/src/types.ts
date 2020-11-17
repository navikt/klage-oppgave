export interface OppgaveQuery {
  typer?: string;
  hjemler?: string;
  ytelser?: string;
  antall: number;
  start: number;
  rekkefoelge: "SYNKENDE" | "STIGENDE";
  tildeltSaksbehandler?: string;
}
