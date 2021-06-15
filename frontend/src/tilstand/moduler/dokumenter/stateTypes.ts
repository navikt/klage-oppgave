export interface IDokumenterState {
  dokumenter: IDokument[];
  tilknyttedeDokumenter: IDokument[];
  pageReference: string | null;
  loading: boolean;
  error: string | null;
}

export interface IDokument {
  journalpostId: string;
  dokumentInfoId: string; // nullable?
  tittel: string | null;
  tema: string | null;
  registrert: string; // LocalDate
  harTilgangTilArkivvariant: boolean;
  vedlegg: IDokumentVedlegg[];
}

export interface IDokumentVedlegg {
  dokumentInfoId: string;
  tittel: string | null;
  harTilgangTilArkivvariant: boolean;
}
