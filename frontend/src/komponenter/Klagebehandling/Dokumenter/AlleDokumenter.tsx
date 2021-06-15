import React, { useCallback, useMemo } from "react";
import { Checkbox } from "nav-frontend-skjema";
import { formattedDate } from "../../../domene/datofunksjoner";
import { useAppDispatch, useAppSelector } from "../../../tilstand/konfigurerTilstand";
import { IDokument } from "../../../tilstand/moduler/dokumenter/stateTypes";
import { List, ListItem } from "../List";
import {
  DokumentDato,
  DokumenterFullvisning,
  DokumentRad,
  DokumentSjekkboks,
  DokumentTema,
  DokumentTittel,
  RightAlign,
  TemaText,
  VedleggBeholder,
  VedleggRad,
  VedleggTittel,
} from "./styled-components";
import { ITilknyttetDokument } from "./typer";
import {
  velgDokumenterLoading,
  velgDokumenterPageReference,
} from "../../../tilstand/moduler/dokumenter/selectors";
import { Knapp } from "nav-frontend-knapper";
import {
  frakobleDokument,
  hentDokumenter,
  tilknyttDokument,
} from "../../../tilstand/moduler/dokumenter/actions";
import { useKanEndre } from "../utils/useKlagebehandlingUpdater";

interface AlleDokumenterProps {
  dokumenter: ITilknyttetDokument[];
  klagebehandlingId: string;
  skjult: boolean;
  settDokument: (dokument: IDokument) => void;
}

export const AlleDokumenter = ({
  dokumenter,
  klagebehandlingId,
  skjult,
  settDokument,
}: AlleDokumenterProps) => {
  const dispatch = useAppDispatch();
  const pageReference = useAppSelector(velgDokumenterPageReference);
  const loading = useAppSelector(velgDokumenterLoading);
  const kanEndre = useKanEndre();

  const onCheck = useCallback(
    (checked: boolean, { tilknyttet, ...dokument }: ITilknyttetDokument) => {
      dispatch(checked ? tilknyttDokument(dokument) : frakobleDokument(dokument));
    },
    [dispatch]
  );

  const hasMore = useMemo(() => {
    if (typeof pageReference === "string" || dokumenter.length === 0) {
      return true;
    }
    return false;
  }, [dokumenter.length, pageReference]);

  if (skjult) {
    return null;
  }

  return (
    <DokumenterFullvisning>
      <List data-testid={"dokumenter"}>
        {dokumenter.map((dokument) => (
          <ListItem key={dokument.journalpostId + dokument.dokumentInfoId}>
            <DokumentRad>
              <DokumentTittel
                onClick={() => dokument.harTilgangTilArkivvariant && settDokument(dokument)}
              >
                {dokument.tittel}
              </DokumentTittel>
              <DokumentTema
                onClick={() => dokument.harTilgangTilArkivvariant && settDokument(dokument)}
                className={`etikett etikett--mw etikett--info etikett--${dokument
                  .tema!.split(" ")[0]
                  .toLowerCase()}`}
              >
                <TemaText>{dokument.tema}</TemaText>
              </DokumentTema>
              <DokumentDato
                onClick={() =>
                  dokument.harTilgangTilArkivvariant
                    ? settDokument(dokument)
                    : console.error("har ikke tilgang")
                }
                className={"liten"}
              >
                {formattedDate(dokument.registrert)}
              </DokumentDato>

              <DokumentSjekkboks>
                <RightAlign>
                  <Checkbox
                    readOnly={!kanEndre}
                    label={""}
                    disabled={!dokument.harTilgangTilArkivvariant}
                    defaultChecked={dokument.tilknyttet}
                    checked={dokument.tilknyttet}
                    className={"dokument-sjekkboks"}
                    onClick={(e) => onCheck(e.currentTarget.checked, dokument)}
                  />
                </RightAlign>
              </DokumentSjekkboks>
              {dokument.vedlegg.length > 0 && (
                <VedleggBeholder data-testid={"vedlegg"}>
                  {dokument.vedlegg.map((vedlegg, idx) => (
                    <VedleggRad key={`vedlegg-${idx}${dokument.dokumentInfoId}`}>
                      <VedleggTittel
                        data-testid={`vedlegg-${idx}`}
                        onClick={() =>
                          vedlegg.harTilgangTilArkivvariant
                            ? settDokument({
                                ...dokument,
                                ...vedlegg,
                              })
                            : console.error("ingen tilgang")
                        }
                      >
                        {vedlegg.tittel}
                      </VedleggTittel>

                      <DokumentSjekkboks className={"dokument-sjekkboks"}>
                        <RightAlign>
                          <Checkbox
                            readOnly={!kanEndre}
                            label={""}
                            disabled={!dokument.harTilgangTilArkivvariant}
                            defaultChecked={dokument.tilknyttet}
                            className={"dokument-sjekkboks"}
                            onClick={(e) =>
                              onCheck(e.currentTarget.checked, {
                                ...dokument,
                                ...vedlegg,
                              })
                            }
                          />
                        </RightAlign>
                      </DokumentSjekkboks>
                    </VedleggRad>
                  ))}
                </VedleggBeholder>
              )}
            </DokumentRad>
          </ListItem>
        ))}
      </List>
      <LoadMore
        hasMore={hasMore}
        pageReference={pageReference}
        klagebehandlingId={klagebehandlingId}
        loading={loading}
      />
    </DokumenterFullvisning>
  );
};

interface LoadMoreProps {
  hasMore: boolean;
  pageReference: string | null;
  klagebehandlingId: string;
  loading: boolean;
}

const LoadMore = ({ hasMore, pageReference, klagebehandlingId, loading }: LoadMoreProps) => {
  const dispatch = useAppDispatch();
  const onClick = useCallback(() => {
    dispatch(hentDokumenter({ klagebehandlingId, pageReference }));
  }, [pageReference, klagebehandlingId]);

  if (!hasMore) {
    return null;
  }

  return (
    <Knapp onClick={onClick} spinner={loading} autoDisableVedSpinner={true}>
      Last flere
    </Knapp>
  );
};
