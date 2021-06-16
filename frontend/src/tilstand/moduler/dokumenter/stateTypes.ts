export interface IDokumenterState {
  dokumenter: IDokumentListe;
  tilknyttedeDokumenter: IDokumentListe;
  pageReference: string | null;
  error: string | null;
}

export interface IDokumentListe {
  loading: boolean;
  dokumenter: IDokument[];
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
