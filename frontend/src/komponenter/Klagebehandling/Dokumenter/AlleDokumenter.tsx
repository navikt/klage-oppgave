import React, { useCallback, useMemo } from "react";
import NavFrontendSpinner from "nav-frontend-spinner";
import { formattedDate } from "../../../domene/datofunksjoner";
import { useAppDispatch } from "../../../tilstand/konfigurerTilstand";
import {
  IDokument,
  IDokumentListe,
  IDokumentVedlegg,
} from "../../../tilstand/moduler/dokumenter/stateTypes";
import { IShownDokument, ITilknyttetDokument, ITilknyttetVedlegg } from "./typer";
import {
  // frakobleDokument,
  hentDokumenter,
  // tilknyttDokument,
} from "../../../tilstand/moduler/dokumenter/actions";
import { useKanEndre } from "../utils/hooks";
import { IKlagebehandling } from "../../../tilstand/moduler/klagebehandling/stateTypes";
import { dokumentMatcher } from "./helpers";
import {
  DokumenterFullvisning,
  DokumentCheckbox,
  DokumentDato,
  DokumentRad,
  DokumentSjekkboks,
  DokumentTema,
  DokumentTittel,
  List,
  ListItem,
  RightAlign,
  TemaText,
  VedleggBeholder,
  VedleggRad,
  VedleggTittel,
  StyledLastFlereKnapp,
} from "./styled-components/fullvisning";
import {
  FRAKOBLE_DOKUMENT,
  TILKNYTT_DOKUMENT,
} from "../../../tilstand/moduler/klagebehandling/state";
import { TilknyttetDokument } from "../../../tilstand/moduler/klagebehandling/types";

interface AlleDokumenterProps {
  dokumenter: IDokumentListe;
  klagebehandling: IKlagebehandling;
  skjult: boolean;
  visDokument: (dokument: IShownDokument) => void;
}

export const AlleDokumenter = ({
  dokumenter,
  klagebehandling,
  skjult,
  visDokument,
}: AlleDokumenterProps) => {
  const dispatch = useAppDispatch();
  const kanEndre = useKanEndre();

  const alleDokumenter = useMemo<ITilknyttetDokument[]>(
    () =>
      dokumenter.dokumenter.map((dokument) => ({
        dokument,
        tilknyttet: klagebehandling.tilknyttedeDokumenter.some((t) => dokumentMatcher(t, dokument)),
      })),
    [dokumenter.dokumenter, dokumenter.loading, klagebehandling.tilknyttedeDokumenter]
  );

  const onCheck = useCallback(
    (checked: boolean, dokument: IDokument) => {
      // dispatch(checked ? tilknyttDokument(dokument) : frakobleDokument(dokument));
      const d: TilknyttetDokument = {
        dokumentInfoId: dokument.dokumentInfoId,
        journalpostId: dokument.journalpostId,
      };
      dispatch(checked ? TILKNYTT_DOKUMENT(dokument) : FRAKOBLE_DOKUMENT(dokument));
    },
    [dispatch]
  );

  const onShowDokument = ({
    journalpostId,
    dokumentInfoId,
    tittel,
    harTilgangTilArkivvariant,
  }: IDokument) =>
    visDokument({ journalpostId, dokumentInfoId, tittel, harTilgangTilArkivvariant });

  if (skjult) {
    return null;
  }

  if (dokumenter.loading && alleDokumenter.length === 0) {
    return <NavFrontendSpinner />;
  }

  return (
    <DokumenterFullvisning>
      <List data-testid={"dokumenter"}>
        {alleDokumenter.map(({ dokument, tilknyttet }) => (
          <ListItem key={dokument.journalpostId + dokument.dokumentInfoId}>
            <DokumentRad>
              <DokumentTittel onClick={() => onShowDokument(dokument)}>
                {dokument.tittel}
              </DokumentTittel>
              <DokumentTema
                onClick={() => onShowDokument(dokument)}
                className={`etikett etikett--mw etikett--info etikett--${dokument
                  .tema!.split(" ")[0]
                  .toLowerCase()}`}
              >
                <TemaText>{dokument.tema}</TemaText>
              </DokumentTema>
              <DokumentDato onClick={() => onShowDokument(dokument)} className={"liten"}>
                {formattedDate(dokument.registrert)}
              </DokumentDato>

              <DokumentSjekkboks>
                <RightAlign>
                  <DokumentCheckbox
                    label={""}
                    disabled={!dokument.harTilgangTilArkivvariant || !kanEndre}
                    defaultChecked={tilknyttet}
                    onChange={(e) => onCheck(e.currentTarget.checked, dokument)}
                  />
                </RightAlign>
              </DokumentSjekkboks>
              <VedleggListe
                dokument={dokument}
                klagebehandling={klagebehandling}
                visDokument={visDokument}
                // onCheck={onCheck}
              />
            </DokumentRad>
          </ListItem>
        ))}
      </List>
      <LastFlere
        dokumenter={dokumenter}
        klagebehandlingId={klagebehandling.id}
        loading={dokumenter.loading}
      />
    </DokumenterFullvisning>
  );
};

interface VedleggListeProps {
  klagebehandling: IKlagebehandling;
  dokument: IDokument;
  visDokument: (dokument: IShownDokument) => void;
  // onCheck: (checked: boolean, dokument: IDokument) => void;
}

const VedleggListe = ({ klagebehandling, dokument, visDokument }: VedleggListeProps) => {
  const vedleggListe = useMemo<ITilknyttetVedlegg[]>(
    () =>
      dokument.vedlegg.map((vedlegg) => ({
        vedlegg,
        tilknyttet: klagebehandling.tilknyttedeDokumenter.some(
          ({ dokumentInfoId, journalpostId }) =>
            vedlegg.dokumentInfoId === dokumentInfoId && dokument.journalpostId === journalpostId
        ),
      })),
    [dokument.vedlegg, dokument.journalpostId, klagebehandling.tilknyttedeDokumenter]
  );

  if (dokument.vedlegg.length === 0) {
    return null;
  }

  return (
    <VedleggBeholder data-testid={"vedlegg"}>
      {vedleggListe.map(({ vedlegg, tilknyttet }) => (
        <VedleggKomponent
          key={`vedlegg_${dokument.journalpostId}_${vedlegg.dokumentInfoId}`}
          vedlegg={vedlegg}
          dokument={dokument}
          tilknyttet={tilknyttet}
          visDokument={visDokument}
        />
      ))}
    </VedleggBeholder>
  );
};

interface VedleggKomponentProps {
  dokument: IDokument;
  vedlegg: IDokumentVedlegg;
  tilknyttet: boolean;
  visDokument: (dokument: IShownDokument) => void;
}

const VedleggKomponent = ({
  vedlegg,
  dokument,
  tilknyttet,
  visDokument,
}: VedleggKomponentProps) => {
  const kanEndre = useKanEndre();
  const dispatch = useAppDispatch();

  const onCheckVedlegg = useCallback(
    (checked: boolean) => {
      const d: TilknyttetDokument = {
        dokumentInfoId: vedlegg.dokumentInfoId,
        journalpostId: dokument.journalpostId,
      };
      // dispatch(TILKNYTT_DOKUMENT(dokument));
      dispatch(checked ? TILKNYTT_DOKUMENT(d) : FRAKOBLE_DOKUMENT(d));
      // dispatch(
      //   checked ? tilknyttDokumentDokumenter(dokument) : frakobleDokumentDokumenter(dokument)
      // );
    },
    [dispatch, vedlegg.dokumentInfoId, dokument]
  );

  return (
    <VedleggRad key={dokument.journalpostId + vedlegg.dokumentInfoId}>
      <VedleggTittel
        onClick={() =>
          visDokument({
            journalpostId: dokument.journalpostId,
            dokumentInfoId: vedlegg.dokumentInfoId,
            tittel: vedlegg.tittel,
            harTilgangTilArkivvariant: vedlegg.harTilgangTilArkivvariant,
          })
        }
      >
        {vedlegg.tittel}
      </VedleggTittel>

      <DokumentSjekkboks className={"dokument-sjekkboks"}>
        <RightAlign>
          <DokumentCheckbox
            label={""}
            disabled={!vedlegg.harTilgangTilArkivvariant || !kanEndre}
            defaultChecked={tilknyttet}
            onChange={(e) => onCheckVedlegg(e.currentTarget.checked)}
          />
        </RightAlign>
      </DokumentSjekkboks>
    </VedleggRad>
  );
};

interface LoadMoreProps {
  dokumenter: IDokumentListe;
  klagebehandlingId: string;
  loading: boolean;
}

const LastFlere = ({ dokumenter, klagebehandlingId, loading }: LoadMoreProps) => {
  const dispatch = useAppDispatch();
  const onClick = useCallback(
    () => dispatch(hentDokumenter({ klagebehandlingId, pageReference: dokumenter.pageReference })),
    [dokumenter.pageReference, klagebehandlingId]
  );

  const remaining = dokumenter.totaltAntall - dokumenter.dokumenter.length;
  const hasMore = remaining !== 0;

  if (!hasMore) {
    return null;
  }

  return (
    <StyledLastFlereKnapp onClick={onClick} spinner={loading} autoDisableVedSpinner={true}>
      Last flere ({remaining})
    </StyledLastFlereKnapp>
  );
};
