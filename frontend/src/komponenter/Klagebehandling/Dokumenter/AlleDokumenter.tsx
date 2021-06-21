import React, { useCallback, useMemo } from "react";
import NavFrontendSpinner from "nav-frontend-spinner";
import { formattedDate } from "../../../domene/datofunksjoner";
import { useAppDispatch } from "../../../tilstand/konfigurerTilstand";
import {
  IDokument,
  IDokumentListe,
  IDokumentVedlegg,
} from "../../../tilstand/moduler/dokumenter/stateTypes";
import { ITilknyttetDokument, ITilknyttetVedlegg } from "./typer";
import {
  frakobleDokument,
  hentDokumenter,
  tilknyttDokument,
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

interface AlleDokumenterProps {
  dokumenter: IDokumentListe;
  klagebehandling: IKlagebehandling;
  skjult: boolean;
  visDokument: (dokument: IDokument) => void;
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
      dispatch(checked ? tilknyttDokument(dokument) : frakobleDokument(dokument));
    },
    [dispatch]
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
            <DokumentRad>
              <DokumentTittel onClick={() => visDokument(dokument)}>
                {dokument.tittel}
              </DokumentTittel>
              <DokumentTema
                onClick={() => visDokument(dokument)}
                className={`etikett etikett--mw etikett--info etikett--${dokument
                  .tema!.split(" ")[0]
                  .toLowerCase()}`}
              >
                <TemaText>{dokument.tema}</TemaText>
              </DokumentTema>
              <DokumentDato onClick={() => visDokument(dokument)} className={"liten"}>
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
                onCheck={onCheck}
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
  visDokument: (dokument: IDokument) => void;
  onCheck: (checked: boolean, dokument: IDokument) => void;
}

const VedleggListe = ({ klagebehandling, dokument, visDokument, onCheck }: VedleggListeProps) => {
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
          onCheck={onCheck}
        />
      ))}
    </VedleggBeholder>
  );
};

interface VedleggKomponentProps {
  dokument: IDokument;
  vedlegg: IDokumentVedlegg;
  tilknyttet: boolean;
  visDokument: (dokument: IDokument) => void;
  onCheck: (checked: boolean, dokument: IDokument) => void;
}

const VedleggKomponent = ({
  vedlegg,
  dokument,
  tilknyttet,
  visDokument,
  onCheck,
}: VedleggKomponentProps) => {
  const kanEndre = useKanEndre();
  const vedleggDokument = useMemo(
    () => ({
      ...dokument,
      ...vedlegg,
    }),
    [dokument, vedlegg]
  );

  return (
    <VedleggRad key={dokument.journalpostId + vedlegg.dokumentInfoId}>
      <VedleggTittel onClick={() => visDokument(vedleggDokument)}>{vedlegg.tittel}</VedleggTittel>

      <DokumentSjekkboks className={"dokument-sjekkboks"}>
        <RightAlign>
          <DokumentCheckbox
            label={""}
            disabled={!dokument.harTilgangTilArkivvariant || !kanEndre}
            defaultChecked={tilknyttet}
            onChange={(e) => onCheck(e.currentTarget.checked, vedleggDokument)}
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
  const remaining = useMemo(
    () => dokumenter.totaltAntall - dokumenter.dokumenter.length,
    [dokumenter.dokumenter.length, dokumenter.totaltAntall]
  );
  const hasMore = useMemo(() => remaining !== 0, [remaining]);

  if (!hasMore) {
    return null;
  }

  return (
    <StyledLastFlereKnapp onClick={onClick} spinner={loading} autoDisableVedSpinner={true}>
      Last flere ({remaining})
    </StyledLastFlereKnapp>
  );
};
