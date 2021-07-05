import NavFrontendSpinner from "nav-frontend-spinner";
import React, { useMemo } from "react";
import { formattedDate } from "../../../domene/datofunksjoner";
import {
  IDokument,
  IDokumentListe,
  IDokumentVedlegg,
} from "../../../tilstand/moduler/dokumenter/stateTypes";
import { IKlagebehandling } from "../../../tilstand/moduler/klagebehandling/stateTypes";
import { dokumentMatcher } from "./helpers";
import {
  DokumenterMinivisning,
  Tilknyttet,
  TilknyttetDato,
  TilknyttetTittel,
} from "./styled-components/minivisning";
import { ITilknyttetDokument } from "./typer";

interface TilknyttedeDokumenterProps {
  dokumenter: IDokumentListe;
  skjult: boolean;
  klagebehandling: IKlagebehandling;
  visDokument: (dokument: IDokument) => void;
}

export const TilknyttedeDokumenter = ({
  dokumenter,
  visDokument,
  klagebehandling,
  skjult,
}: TilknyttedeDokumenterProps) => {
  const tilknyttedeDokumenter = useMemo<ITilknyttetDokument[]>(
    () =>
      dokumenter.loading
        ? []
        : dokumenter.dokumenter.map((dokument) => ({
            dokument,
            tilknyttet: klagebehandling.tilknyttedeDokumenter.some((t) =>
              dokumentMatcher(t, dokument)
            ),
          })),
    [dokumenter.dokumenter, dokumenter.loading, klagebehandling.tilknyttedeDokumenter]
  );
  if (skjult) {
    return null;
  }

  if (dokumenter.loading) {
    return <NavFrontendSpinner />;
  }

  return (
    <DokumenterMinivisning>
      {tilknyttedeDokumenter.map(({ dokument, tilknyttet }) => (
        <Tilknyttet key={dokument.journalpostId + dokument.dokumentInfoId}>
          <TilknyttetDato dateTime={dokument.registrert}>
            {formattedDate(dokument.registrert)}
          </TilknyttetDato>
          <TilknyttetTittel tilknyttet={tilknyttet} onClick={() => visDokument(dokument)}>
            {dokument.tittel}
          </TilknyttetTittel>
          <DokumenterMinivisning>
            {dokument.vedlegg.map((vedlegg) => (
              <Vedlegg
                key={dokument.journalpostId + vedlegg.dokumentInfoId}
                dokument={dokument}
                vedlegg={vedlegg}
                visDokument={visDokument}
              />
            ))}
          </DokumenterMinivisning>
        </Tilknyttet>
      ))}
    </DokumenterMinivisning>
  );
};

interface VedleggProps {
  dokument: IDokument;
  vedlegg: IDokumentVedlegg;
  visDokument: (dokument: IDokument) => void;
}

const Vedlegg = ({ dokument, vedlegg, visDokument }: VedleggProps) => {
  return (
    <Tilknyttet>
      <TilknyttetTittel tilknyttet={true} onClick={() => visDokument({ ...dokument, ...vedlegg })}>
        {vedlegg.tittel}
      </TilknyttetTittel>
    </Tilknyttet>
  );
};
