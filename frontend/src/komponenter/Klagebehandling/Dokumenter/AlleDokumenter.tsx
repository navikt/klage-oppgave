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
import { hentDokumenter } from "../../../tilstand/moduler/dokumenter/actions";
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
  const alleDokumenter = useMemo<ITilknyttetDokument[]>(
    () =>
      dokumenter.dokumenter.map((dokument) => ({
        dokument,
        tilknyttet: klagebehandling.tilknyttedeDokumenter.some((t) => dokumentMatcher(t, dokument)),
      })),
    [dokumenter.dokumenter, klagebehandling.tilknyttedeDokumenter]
  );

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
            <Dokument
              dokument={dokument}
              tilknyttet={tilknyttet}
              visDokument={visDokument}
              klagebehandling={klagebehandling}
            />
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

interface DokumentProps extends ITilknyttetDokument {
  klagebehandling: IKlagebehandling;
  visDokument: (dokument: IShownDokument) => void;
}

const Dokument = ({ dokument, tilknyttet, visDokument, klagebehandling }: DokumentProps) => {
  const dispatch = useAppDispatch();
  const kanEndre = useKanEndre();

  const onShowDokument = ({
    journalpostId,
    dokumentInfoId,
    tittel,
    harTilgangTilArkivvariant,
  }: IDokument) =>
    visDokument({ journalpostId, dokumentInfoId, tittel, harTilgangTilArkivvariant });

  const d: TilknyttetDokument = {
    journalpostId: dokument.journalpostId,
    dokumentInfoId: dokument.dokumentInfoId,
  };
  const onCheck = (checked: boolean) =>
    dispatch(checked ? TILKNYTT_DOKUMENT(d) : FRAKOBLE_DOKUMENT(d));

  return (
    <DokumentRad>
      <DokumentTittel onClick={() => onShowDokument(dokument)}>{dokument.tittel}</DokumentTittel>
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
            onChange={(e) => onCheck(e.currentTarget.checked)}
          />
        </RightAlign>
      </DokumentSjekkboks>
      <VedleggListe
        dokument={dokument}
        klagebehandling={klagebehandling}
        visDokument={visDokument}
      />
    </DokumentRad>
  );
};

interface VedleggListeProps {
  klagebehandling: IKlagebehandling;
  dokument: IDokument;
  visDokument: (dokument: IShownDokument) => void;
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

  const d: TilknyttetDokument = {
    journalpostId: dokument.journalpostId,
    dokumentInfoId: vedlegg.dokumentInfoId,
  };
  const onCheck = (checked: boolean) =>
    dispatch(checked ? TILKNYTT_DOKUMENT(d) : FRAKOBLE_DOKUMENT(d));

  const onVisDokument = () =>
    visDokument({
      journalpostId: dokument.journalpostId,
      dokumentInfoId: vedlegg.dokumentInfoId,
      tittel: vedlegg.tittel,
      harTilgangTilArkivvariant: vedlegg.harTilgangTilArkivvariant,
    });

  return (
    <VedleggRad key={dokument.journalpostId + vedlegg.dokumentInfoId}>
      <VedleggTittel onClick={onVisDokument}>{vedlegg.tittel}</VedleggTittel>
      <DokumentSjekkboks className={"dokument-sjekkboks"}>
        <RightAlign>
          <DokumentCheckbox
            label={""}
            disabled={!vedlegg.harTilgangTilArkivvariant || !kanEndre}
            defaultChecked={tilknyttet}
            onChange={(e) => onCheck(e.currentTarget.checked)}
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
