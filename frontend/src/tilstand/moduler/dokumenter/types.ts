import { IDokument } from "./stateTypes";

export interface IDokumentParams {
  id: string;
  idx: number;
  handling: string;
  antall: number;
  ref: string | null;
  historyNavigate: boolean;
}

export interface IDokumenterRespons {
  dokumenter: IDokument[];
  pageReference: string | null;
}

export interface IDokumenterParams {
  klagebehandlingId: string;
  pageReference: string | null;
}
