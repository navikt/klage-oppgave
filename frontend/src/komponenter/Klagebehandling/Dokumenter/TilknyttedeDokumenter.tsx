import NavFrontendSpinner from "nav-frontend-spinner";
import React, { useMemo } from "react";
import styled from "styled-components";
import { formattedDate } from "../../../domene/datofunksjoner";
import { useAppSelector } from "../../../tilstand/konfigurerTilstand";
import { velgTilknyttedeDokumenter } from "../../../tilstand/moduler/dokumenter/selectors";
import { IDokumentVedlegg } from "../../../tilstand/moduler/dokumenter/stateTypes";
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
  skjult: boolean;
  klagebehandling: IKlagebehandling;
  visDokument: (dokument: IShownDokument) => void;
}

export const TilknyttedeDokumenter = ({
  visDokument,
  klagebehandling,
  skjult,
}: TilknyttedeDokumenterProps) => {
  const lagredeTilknyttedeDokumenter = useAppSelector(velgTilknyttedeDokumenter);

  const tilknyttedeDokumenter = useMemo<ITilknyttetDokument[]>(
    () =>
      lagredeTilknyttedeDokumenter.dokumenter
        .map((dokument) => ({
          dokument,
          tilknyttet: klagebehandling.tilknyttedeDokumenter.some((t) =>
            dokumentMatcher(t, dokument)
          ),
        }))
        .filter(({ dokument, tilknyttet }) => tilknyttet || dokument.vedlegg.length !== 0),
    [klagebehandling.tilknyttedeDokumenter, lagredeTilknyttedeDokumenter]
  );

  if (skjult) {
    return null;
  }

  // if (lagredeTilknyttedeDokumenter.loading) {
  //   return <NavFrontendSpinner />;
  // }

  return (
    <Container>
      <Loading loading={lagredeTilknyttedeDokumenter.loading} />
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
    </Container>
  );
};

const Container = styled.div`
  position: relative;
`;

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

interface LoadingProps {
  loading: boolean;
}

const Loading = ({ loading }: LoadingProps) =>
  loading ? (
    <SpinnerBackground>
      <NavFrontendSpinner />
    </SpinnerBackground>
  ) : null;

const SpinnerBackground = styled.div`
  display: flex;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: grey;
  opacity: 0.25;
  justify-content: center;
`;
