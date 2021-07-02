import { IDokument, IDokumentVedlegg } from "../../../tilstand/moduler/dokumenter/stateTypes";

export interface ITilknyttetDokument {
  dokument: IDokument;
  tilknyttet: boolean;
}

export interface ITilknyttetVedlegg {
  vedlegg: IDokumentVedlegg;
  tilknyttet: boolean;
}

export interface IShownDokument {
  journalpostId: string;
  dokumentInfoId: string; // nullable?
  tittel: string | null;
  harTilgangTilArkivvariant: boolean;
}
