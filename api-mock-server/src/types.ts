export interface OppgaveQuery {
  typer?: string;
  hjemler?: string;
  temaer?: string;
  antall: number;
  start: number;
  rekkefoelge: "SYNKENDE" | "STIGENDE";
  navIdent?: string;
  tildeltSaksbehandler?: string;
  ferdigstiltFom?: string;
}
