export type OppgaveQuery = {
  type?: string;
  hjemmel?: string;
  ytelse?: string;
  antall: number;
  start: number;
  rekkefoelge: "SYNKENDE" | "STIGENDE";
};
