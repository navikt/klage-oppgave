import NavFrontendSpinner from "nav-frontend-spinner";
import React, { useMemo } from "react";
import { formattedDate } from "../../../domene/datofunksjoner";
import { IDokument, IDokumentVedlegg } from "../../../tilstand/moduler/dokumenter/stateTypes";
import { IKlagebehandling } from "../../../tilstand/moduler/klagebehandling/stateTypes";
import { TilknyttetDokument } from "../../../tilstand/moduler/klagebehandling/types";
import { dokumentMatcher } from "./helpers";
import {
  DokumenterMinivisning,
  Tilknyttet,
  TilknyttetDato,
  TilknyttetKnapp,
} from "./styled-components/minivisning";
import { IShownDokument, ITilknyttetDokument } from "./typer";

interface TilknyttedeDokumenterProps {
  dokumenter: IDokument[];
  loading: boolean;
  skjult: boolean;
  klagebehandling: IKlagebehandling;
  visDokument: (dokument: IShownDokument) => void;
}

export const TilknyttedeDokumenter = ({
  dokumenter,
  loading,
  visDokument,
  klagebehandling,
  skjult,
}: TilknyttedeDokumenterProps) => {
  const tilknyttedeDokumenter = useMemo<ITilknyttetDokument[]>(
    () =>
      loading
        ? []
        : dokumenter.map((dokument) => ({
            dokument,
            tilknyttet: klagebehandling.tilknyttedeDokumenter.some((t) =>
              dokumentMatcher(t, dokument)
            ),
          })),
    [dokumenter, loading, klagebehandling.tilknyttedeDokumenter]
  );

  if (skjult) {
    return null;
  }

  if (loading) {
    return <NavFrontendSpinner />;
  }

  return (
    <DokumenterMinivisning>
      {tilknyttedeDokumenter.map(({ dokument, tilknyttet }) => (
        <Tilknyttet key={dokument.journalpostId + dokument.dokumentInfoId}>
          <TilknyttetDato dateTime={dokument.registrert}>
            {formattedDate(dokument.registrert)}
          </TilknyttetDato>
          <TilknyttetKnapp
            tilknyttet={tilknyttet}
            onClick={() =>
              visDokument({
                journalpostId: dokument.journalpostId,
                dokumentInfoId: dokument.dokumentInfoId,
                tittel: dokument.tittel,
                harTilgangTilArkivvariant: dokument.harTilgangTilArkivvariant,
              })
            }
          >
            {dokument.tittel}
          </TilknyttetKnapp>
          <VedleggListe
            journalpostId={dokument.journalpostId}
            vedleggListe={dokument.vedlegg}
            tilknyttedeDokumenter={klagebehandling.tilknyttedeDokumenter}
            visDokument={visDokument}
          />
        </Tilknyttet>
      ))}
    </DokumenterMinivisning>
  );
};

interface VedleggListeProps {
  vedleggListe: IDokumentVedlegg[];
  tilknyttedeDokumenter: TilknyttetDokument[];
  journalpostId: string;
  visDokument: (dokument: IShownDokument) => void;
}

const VedleggListe = ({
  vedleggListe,
  tilknyttedeDokumenter,
  journalpostId,
  visDokument,
}: VedleggListeProps) => {
  const tilknyttedeVedlegg = useMemo<IDokumentVedlegg[]>(
    () =>
      vedleggListe.filter((vedlegg) =>
        tilknyttedeDokumenter.some(
          ({ dokumentInfoId }) => dokumentInfoId === vedlegg.dokumentInfoId
        )
      ),
    [tilknyttedeDokumenter, vedleggListe]
  );

  return (
    <DokumenterMinivisning>
      {tilknyttedeVedlegg.map((vedlegg) => (
        <Vedlegg
          key={journalpostId + vedlegg.dokumentInfoId}
          journalpostId={journalpostId}
          vedlegg={vedlegg}
          visDokument={visDokument}
        />
      ))}
    </DokumenterMinivisning>
  );
};

interface VedleggProps {
  journalpostId: string;
  vedlegg: IDokumentVedlegg;
  visDokument: (dokument: IShownDokument) => void;
}

const Vedlegg = ({ journalpostId, vedlegg, visDokument }: VedleggProps) => (
  <Tilknyttet>
    <TilknyttetKnapp
      tilknyttet={true}
      onClick={() =>
        visDokument({
          journalpostId,
          dokumentInfoId: vedlegg.dokumentInfoId,
          tittel: vedlegg.tittel,
          harTilgangTilArkivvariant: vedlegg.harTilgangTilArkivvariant,
        })
      }
    >
      {vedlegg.tittel}
    </TilknyttetKnapp>
  </Tilknyttet>
);
