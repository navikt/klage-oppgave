import useInfiniteScroll from "react-infinite-scroll-hook";
import {
  fradelDokumenterHandling,
  hentDokumentAlleHandling,
  hentDokumentTilordnedeHandling,
  hentPreviewHandling,
  IKlage,
  lasterDokumenter,
  nullstillDokumenter,
  tilordneDokumenterHandling,
} from "../../tilstand/moduler/klagebehandling";
import { useDispatch, useSelector } from "react-redux";
import { velgKlage } from "../../tilstand/moduler/klagebehandlinger.velgere";
import React, { useEffect, useRef, useState } from "react";
import NavFrontendSpinner from "nav-frontend-spinner";
import { formattedDate } from "../../domene/datofunksjoner";
import styled from "styled-components";
import { useLoadItems } from "./utils";
import { List, ListItem, Loading } from "./List";

import { Document, Page } from "react-pdf";
// @ts-ignore
import CloseSVG from "../cancelblack.svg";
// @ts-ignore
import ExtLink from "../extlink.svg";

const ListeContainer = styled.div`
  display: ${(props) => props.theme.display};
  max-height: 100vh;
  min-height: 70vh;
  overflow: auto;
`;

const TilknyttedeContainer = styled.div`
  display: ${(props) => props.theme.display};
`;

const Tilknyttet = styled.div`
  padding: 0.5em 1em;
`;

const TilknyttetDato = styled.div`
  font-size: 12px;
`;

const TilknyttetTittel = styled.div`
  font-size: 16px;
  color: #0067c5;
`;

const DokumentContainer = styled.div`
  display: ${(props) => props.theme.display};
  grid-template-columns: ${(props) => props.theme.dokumentgrid};

  &.skjult {
    display: none;
  }
`;

const DokumenterContainer = styled.div`
  margin: 0.25em 0.1em 0.25em 0.25em;
  background: white;
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
  border-radius: 4px;
  width: ${(props) => props.theme.width};
`;

const DokumenterTittel = styled.h1`
  padding: 0 0.5em;
  font-size: 24px;
  font-weight: bold;
`;

const VisTilknyttedeKnapp = styled.button`
  display: ${(props) => props.theme.display};
  margin: 0 0.75em 1em 0.75em;
  padding: 0.3em 0.55em;
  background: white;
  font-size: 0.9em;
  color: #0067c5;
  border: 1px solid #0067c5;
  :hover {
    background: #eee;
  }
  :click {
    background: red;
  }
`;

const Sjekkboks = styled.input`
  width: 24px;
  height: 24px;
  margin: 0px 8px;
  &:checked {
    background-color: rgb(12, 94, 168);
  }
`;

const DokumentRad = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-areas:
    "tittel tema dato sjekkboks"
    "vedlegg vedlegg vedlegg vedlegg";
  grid-template-rows: 1fr;
`;

const DokumentTittel = styled.li`
  color: #0067c5;
  grid-area: tittel;
  width: 11em;
`;

const DokumentTema = styled.li`
  width: 8em;
  grid-area: tema;
`;

const TemaText = styled.div`
  max-width: 8em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin: 0;
`;
const DokumentDato = styled.li`
  max-width: 8em;
  text-align: center;
  font-size: 0.9em;
  grid-area: dato;
`;

const DokumentSjekkboks = styled.li`
  width: 100%;
  text-align: right;
  grid-area: sjekkboks;
`;

const VedleggContainer = styled.div`
  grid-area: vedlegg;
`;

const VedleggRad = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  justify-content: space-between;
`;

const VedleggTittel = styled.li`
  color: #0067c5;
  margin: 0 0 0 2em;
  min-width: 15em;
`;
const PreviewContainer = styled.div`
  display: ${(props) => props.theme.display};
  margin: 0.25em 0;
  background: white;
  border-radius: 4px;
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
  max-width: 40em;
`;

const Preview = styled.div`
  height: 100%;
`;
const PreviewTitle = styled.div`
  background: #cde7d8;
  display: flex;
  padding: 1em 0 1em 0.5em;
  justify-content: space-between;
`;
const SVGIkon = styled.img`
  color: black;
  margin: 0.25em 1em 0 0.2em;
  -webkit-transition: all 0.15s ease-in-out;
  transition: all 0.15s ease-in-out;
  &:hover {
    transform: scale(1.1);
  }
  width: 1em;
  height: 1em;
`;
const EksternalSVGIkon = styled.img`
  color: black;
  margin: 0.25em 1em 0 0.2em;
  -webkit-transition: all 0.15s ease-in-out;
  transition: all 0.15s ease-in-out;
  &:hover {
    transform: scale(1.1);
  }
`;
const PDFContainer = styled.div`
  max-height: 100vh;
  min-height: 70vh;
  overflow: auto;

  .react-pdf {
    &__Document {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    &__Page {
      max-width: calc(~"100% - 1em");
      canvas {
        height: auto !important;
      }
    }
  }
`;

export default function Dokumenter({ skjult }: { skjult: boolean }) {
  const [aktivPDF, settAktivPDF] = useState(false);
  const [journalpostId, settjournalpostId] = useState(0);
  const [dokumentTittel, settdokumentTittel] = useState("");
  const [dokumentInfoId, settdokumentInfoId] = useState(0);
  const klage: IKlage = useSelector(velgKlage);
  const [file, setFile] = useState(null);
  const [numPages, setNumPages] = useState(0);

  function onFileChange(event: any) {
    setFile(event.target.files[0]);
  }

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }
  const options = {
    cMapUrl: "cmaps/",
    cMapPacked: true,
  };

  const [dokumentgrid, settDokumentgrid] = useState("1fr 1fr 1fr");

  return (
    <DokumentContainer theme={{ display: !skjult ? "grid" : "none", dokumentgrid }}>
      <DokumentTabell
        settAktivPDF={settAktivPDF}
        settjournalpostId={settjournalpostId}
        settdokumentTittel={settdokumentTittel}
        settDokumentGrid={settDokumentgrid}
        settdokumentInfoId={settdokumentInfoId}
      />
      <PreviewContainer theme={{ display: aktivPDF ? "unset" : "none" }}>
        <Preview>
          <PreviewTitle>
            {dokumentTittel}
            <div>
              <a href={klage.currentPDF} target={"_blank"}>
                <EksternalSVGIkon alt="Ekstern lenke" src={ExtLink} />
              </a>
              <SVGIkon
                alt="Lukk forhåndsvisning"
                src={CloseSVG}
                onClick={() => settAktivPDF(false)}
              />
            </div>
          </PreviewTitle>
          <Document file={klage.currentPDF} onLoadSuccess={onDocumentLoadSuccess} options={options}>
            <PDFContainer>
              {Array.from(new Array(numPages), (el, index) => (
                <Page key={`page_${index + 1}`} pageNumber={index + 1} />
              ))}
            </PDFContainer>
          </Document>
        </Preview>
      </PreviewContainer>
    </DokumentContainer>
  );
}

export interface Item {
  id: string;
  journalpostId: string;
  dokumentInfoId: string;
}

function sjekkErTilordnet(klage: any, journalpostId: string, dokumentInfoId: string): boolean {
  if (!klage.dokumenterTilordnede) {
    return false;
  }
  let res = klage.dokumenterTilordnede.filter(
    (klage: any) => klage.journalpostId === journalpostId && klage.dokumentInfoId === dokumentInfoId
  );
  if (res.length) {
    return true;
  }
  return false;
}

function DokumentTabell(props: {
  settAktivPDF: Function;
  settdokumentInfoId: Function;
  settdokumentTittel: Function;
  settDokumentGrid: Function;
  settjournalpostId: Function;
}) {
  const klage: IKlage = useSelector(velgKlage);
  const dispatch = useDispatch();
  const { loading, hasNextPage, error, loadMore } = useLoadItems();

  const [liste, setListe] = React.useState<Item[]>([]);

  const [infiniteRef, { rootRef }] = useInfiniteScroll({
    loading: klage.lasterDokumenter,
    hasNextPage: klage.hasMore,
    onLoadMore: handleLoadMore,
    disabled: !!error,
    rootMargin: "0px 0px 200px 0px",
  });

  function hentNeste(ref: string | null) {
    dispatch(lasterDokumenter(false));
    dispatch(hentDokumentAlleHandling({ id: klage.id, ref: ref ?? null, antall: 10 }));
  }

  function handleLoadMore() {
    hentNeste(klage.pageReference);
  }

  useEffect(() => {
    dispatch(nullstillDokumenter());
    dispatch(hentDokumentAlleHandling({ id: klage.id, ref: null, antall: 10 }));
    dispatch(hentDokumentTilordnedeHandling({ id: klage.id }));
  }, []);

  useEffect(() => {
    if (klage.dokumenter) {
      let startCursor = liste.length;
      let newArray: Item[] = [];
      let j = 0;
      for (let i = startCursor; i < startCursor + klage.dokumenter.length; i++) {
        newArray = [...newArray, klage.dokumenter[j++]];
      }
      setListe(newArray);
    }
  }, [klage.dokumenter]);

  function tilordneDokument(behandlingId: string, journalpostId: string, dokumentInfoId: string) {
    dispatch(tilordneDokumenterHandling({ id: behandlingId, journalpostId, dokumentInfoId }));
  }

  function fradelDokument(behandlingId: string, journalpostId: string, dokumentInfoId: string) {
    dispatch(fradelDokumenterHandling({ id: behandlingId, journalpostId, dokumentInfoId }));
  }

  useEffect(() => {
    dispatch(hentDokumentTilordnedeHandling({ id: klage.id }));
  }, [klage.dokumenterOppdatert]);

  function hentPreview({
    behandlingId,
    journalpostId,
    dokumentTittel,
    dokumentInfoId,
    props,
  }: {
    behandlingId: string;
    journalpostId: string;
    dokumentTittel: string;
    dokumentInfoId: string;
    props: any;
  }) {
    props.settAktivPDF(true);
    props.settdokumentInfoId(dokumentInfoId);
    props.settdokumentTittel(dokumentTittel);
    props.settjournalpostId(journalpostId);
    dispatch(hentPreviewHandling({ id: behandlingId, journalpostId, dokumentInfoId }));
  }

  const [visFullContainer, settvisFullContainer] = useState(true);

  if (!klage.dokumenter) {
    return <NavFrontendSpinner />;
  }
  return (
    <DokumenterContainer theme={{ width: visFullContainer ? "40em" : "15em" }}>
      <DokumenterTittel>Dokumenter</DokumenterTittel>
      <VisTilknyttedeKnapp
        theme={{ display: visFullContainer ? "unset" : "none" }}
        onClick={() => {
          settvisFullContainer(false);
          props.settDokumentGrid("15.5em 1fr 1fr");
        }}
      >
        Vis kun tilknyttede
      </VisTilknyttedeKnapp>
      <VisTilknyttedeKnapp
        theme={{ display: !visFullContainer ? "unset" : "none" }}
        onClick={() => {
          settvisFullContainer(true);
          props.settDokumentGrid("1fr 1fr 1fr");
        }}
      >
        Se alle dokumenter
      </VisTilknyttedeKnapp>

      <TilknyttedeContainer theme={{ display: !visFullContainer ? "unset" : "none" }}>
        {liste.map((item: any) => {
          if (sjekkErTilordnet(klage, item.journalpostId, item.dokumentInfoId)) {
            return (
              <Tilknyttet>
                <TilknyttetDato>{formattedDate(item.registrert)}</TilknyttetDato>
                <TilknyttetTittel
                  onClick={() =>
                    hentPreview({
                      behandlingId: klage.id,
                      journalpostId: item.journalpostId,
                      dokumentInfoId: item.dokumentInfoId,
                      dokumentTittel: item.tittel,
                      props: props,
                    })
                  }
                >
                  {item.tittel}
                </TilknyttetTittel>
              </Tilknyttet>
            );
          }
        })}
      </TilknyttedeContainer>

      <ListeContainer ref={rootRef} theme={{ display: visFullContainer ? "grid" : "none" }}>
        <List>
          {liste.map((item: any) => (
            <ListItem key={item.journalpostId + item.dokumentInfoId}>
              <DokumentRad>
                <DokumentTittel
                  onClick={() =>
                    hentPreview({
                      behandlingId: klage.id,
                      journalpostId: item.journalpostId,
                      dokumentInfoId: item.dokumentInfoId,
                      dokumentTittel: item.tittel,
                      props: props,
                    })
                  }
                >
                  {item.tittel}
                </DokumentTittel>
                <DokumentTema
                  onClick={() =>
                    hentPreview({
                      behandlingId: klage.id,
                      journalpostId: item.journalpostId,
                      dokumentInfoId: item.dokumentInfoId,
                      dokumentTittel: item.tittel,
                      props: props,
                    })
                  }
                  className={`etikett etikett--mw etikett--info etikett--${item.tema
                    .split(" ")[0]
                    .toLowerCase()}`}
                >
                  <TemaText>{item.tema}</TemaText>
                </DokumentTema>
                <DokumentDato
                  onClick={() =>
                    hentPreview({
                      behandlingId: klage.id,
                      journalpostId: item.journalpostId,
                      dokumentInfoId: item.dokumentInfoId,
                      dokumentTittel: item.tittel,
                      props: props,
                    })
                  }
                  className={"liten"}
                >
                  {formattedDate(item.registrert)}
                </DokumentDato>
                <DokumentSjekkboks>
                  <Sjekkboks
                    type={"checkbox"}
                    checked={sjekkErTilordnet(klage, item.journalpostId, item.dokumentInfoId)}
                    onChange={() => {
                      if (sjekkErTilordnet(klage, item.journalpostId, item.dokumentInfoId)) {
                        return fradelDokument(klage.id, item.journalpostId, item.dokumentInfoId);
                      } else {
                        return tilordneDokument(klage.id, item.journalpostId, item.dokumentInfoId);
                      }
                    }}
                  />
                </DokumentSjekkboks>
                {item.vedlegg.length > 0 && (
                  <VedleggContainer>
                    {item.vedlegg.map((vedlegg: any, idx: number) => (
                      <VedleggRad key={`vedlegg-${idx}${item.dokumentInfoId}`}>
                        <VedleggTittel
                          onClick={() =>
                            hentPreview({
                              behandlingId: klage.id,
                              journalpostId: item.journalpostId,
                              dokumentInfoId: vedlegg.dokumentInfoId,
                              dokumentTittel: vedlegg.tittel,
                              props: props,
                            })
                          }
                        >
                          {vedlegg.tittel}
                        </VedleggTittel>
                        <DokumentSjekkboks>
                          <Sjekkboks
                            type={"checkbox"}
                            checked={sjekkErTilordnet(
                              klage,
                              item.journalpostId,
                              vedlegg.dokumentInfoId
                            )}
                            onChange={() => {
                              if (
                                sjekkErTilordnet(klage, item.journalpostId, vedlegg.dokumentInfoId)
                              ) {
                                return fradelDokument(
                                  klage.id,
                                  item.journalpostId,
                                  vedlegg.dokumentInfoId
                                );
                              } else {
                                return tilordneDokument(
                                  klage.id,
                                  item.journalpostId,
                                  vedlegg.dokumentInfoId
                                );
                              }
                            }}
                          />
                        </DokumentSjekkboks>
                      </VedleggRad>
                    ))}
                  </VedleggContainer>
                )}
              </DokumentRad>
            </ListItem>
          ))}
          {klage.hasMore && (
            <ListItem ref={infiniteRef}>
              <Loading />
            </ListItem>
          )}
        </List>
      </ListeContainer>
    </DokumenterContainer>
  );
}
