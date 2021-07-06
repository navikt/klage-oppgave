import NavFrontendSpinner from "nav-frontend-spinner";
import React, { useEffect, useMemo } from "react";
import { formattedDate } from "../../../domene/datofunksjoner";
import { useAppDispatch, useAppSelector } from "../../../tilstand/konfigurerTilstand";
import { hentTilknyttedeDokumenter } from "../../../tilstand/moduler/dokumenter/actions";
import {
  velgAlleDokumenter,
  velgTilknyttedeDokumenter,
} from "../../../tilstand/moduler/dokumenter/selectors";
import {
  IDokument,
  IDokumentListe,
  IDokumentVedlegg,
} from "../../../tilstand/moduler/dokumenter/stateTypes";
import { IKlagebehandling } from "../../../tilstand/moduler/klagebehandling/stateTypes";
import { TilknyttetDokument } from "../../../tilstand/moduler/klagebehandling/types";
import { isNotUndefined } from "../utils/helpers";
import { dokumentMatcher } from "./helpers";
import {
  DokumenterMinivisning,
  Tilknyttet,
  TilknyttetDato,
  TilknyttetKnapp,
} from "./styled-components/minivisning";
import { IShownDokument, ITilknyttetDokument } from "./typer";

interface TilknyttedeDokumenterProps {
  // dokumenter: IDokument[];
  // loading: boolean;
  skjult: boolean;
  klagebehandling: IKlagebehandling;
  visDokument: (dokument: IShownDokument) => void;
}

export const TilknyttedeDokumenter = ({
  // dokumenter,
  // loading,
  visDokument,
  klagebehandling,
  skjult,
}: TilknyttedeDokumenterProps) => {
  // const alleDokumenter = useAppSelector(velgAlleDokumenter);
  const lagredeTilknyttedeDokumenter = useAppSelector(velgTilknyttedeDokumenter);
  // const dispatch = useAppDispatch();

  // useEffect(() => {
  //   dispatch(hentTilknyttedeDokumenter(klagebehandling.id));
  // }, [klagebehandling.id, klagebehandling.tilknyttedeDokumenter, dispatch]);

  // const loading = alleDokumenter.loading || lagredeTilknyttedeDokumenter.loading;

  // const tilknyttedeDokumenter = useMemo<ITilknyttetDokument[]>(
  //   () =>
  //     klagebehandling.tilknyttedeDokumenter
  //       .map(
  //         ({ journalpostId }) =>
  //           lagredeTilknyttedeDokumenter.dokumenter.find(
  //             (d) => d.journalpostId === journalpostId
  //           ) ?? alleDokumenter.dokumenter.find((d) => d.journalpostId === journalpostId)
  //       )
  //       .filter(isNotUndefined)
  //       .sort((a, b) => {
  //         if (a.registrert > b.registrert) {
  //           return -1;
  //         }
  //         if (a.registrert < b.registrert) {
  //           return 1;
  //         }
  //         return 0;
  //       })
  //       .map(({ vedlegg, ...d }) => ({
  //         dokument: {
  //           ...d,
  //           vedlegg: vedlegg.filter((v) =>
  //             klagebehandling.tilknyttedeDokumenter.some(
  //               ({ dokumentInfoId }) => dokumentInfoId === v.dokumentInfoId
  //             )
  //           ),
  //         },
  //         tilknyttet: true,
  //       })),
  //   [
  //     klagebehandling.tilknyttedeDokumenter,
  //     lagredeTilknyttedeDokumenter.dokumenter,
  //     alleDokumenter.dokumenter,
  //   ]
  // );

  // const tilknyttedeDokumenter = loading
  //   ? []
  //   : alleDokumenter.dokumenter
  //       .filter(
  //         (dokument) =>
  //           !lagredeTilknyttedeDokumenter.dokumenter.some((t) => dokumentMatcher(t, dokument)) &&
  //           klagebehandling.tilknyttedeDokumenter.some(
  //             (t) => t.journalpostId === dokument.journalpostId
  //           )
  //       )
  //       .concat(lagredeTilknyttedeDokumenter.dokumenter)
  // .sort((a, b) => {
  //   if (a.registrert > b.registrert) {
  //     return -1;
  //   }
  //   if (a.registrert < b.registrert) {
  //     return 1;
  //   }
  //   return 0;
  // })
  //       .map((dokument) => ({
  //         dokument,
  //         tilknyttet: klagebehandling.tilknyttedeDokumenter.some((t) =>
  //           dokumentMatcher(t, dokument)
  //         ),
  //       }));

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

  if (lagredeTilknyttedeDokumenter.loading) {
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
