interface ComparableDokument {
  dokumentInfoId: string | null;
  journalpostId: string;
}

export const dokumentMatcher = (a: ComparableDokument, b: ComparableDokument): boolean =>
  a.dokumentInfoId === b.dokumentInfoId && a.journalpostId === b.journalpostId;
