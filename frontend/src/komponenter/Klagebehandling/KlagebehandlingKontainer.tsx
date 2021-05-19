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
import { velgKlage } from "../../tilstand/moduler/klagebehandlinger.velgere";
import React, { useEffect, useState } from "react";
import NavFrontendSpinner from "nav-frontend-spinner";
import { formattedDate } from "../../domene/datofunksjoner";
import styled from "styled-components";
import { useLoadItems } from "./utils";
import { List, ListItem, Loading } from "./List";
import "./sjekkboks.less";
import { Document, Page } from "react-pdf";
// @ts-ignore
import CloseSVG from "../cancelblack.svg";
// @ts-ignore
import ExtLink from "../extlink.svg";
import Behandlingsskjema from "./Behandlingsskjema/Behandlingsskjema";
import { IFaner } from "./KlageBehandling";
import FullforVedtak from "./Behandlingsskjema/FullforVedtak";
import { useAppDispatch, useAppSelector } from "../../tilstand/konfigurerTilstand";

export interface IDokument {
  journalpostId: string;
  dokumentInfoId: string;
  tittel: string;
  tema: string;
  registrert: number;
  harTilgangTilArkivvariant: boolean;
  valgt: boolean;
  vedlegg: Array<IVedlegg>;
}

export interface IVedlegg {
  idx?: number;
  dokumentInfoId: string;
  tittel: string;
  harTilgangTilArkivvariant: boolean;
  valgt: boolean;
}

const maxHeight = "33em";
const infiniteBottomMargin = "600px";

const DokumenterKontainer = styled.div`
  margin: 0.25em 0.25em 0.25em 0.25em;
  background: white;
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
  border-radius: 4px;
  display: ${(props) => props.theme.display};
  width: ${(props) => props.theme.width};
  overflow: hidden;
  position: relative;
`;

const DokumenterFullvisning = styled.div`
  display: ${(props) => props.theme.display};
  height: 100%;
  overflow: auto;
  flex-flow: column;
`;

const DokumenterMinivisning = styled.div`
  display: ${(props) => props.theme.display};
  height: 100%;
  overflow: auto;
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

const DokumentKontainer = styled.div`
  display: grid;
  grid-template-columns: ${(props) => props.theme.dokumentgrid};
  margin: 0 0.25em 0 0;
  height: calc(100% - 3em);
  max-height: 100%;
  @media screen and (max-width: 1400px) {
    height: calc(100% - 6.25em);
  }

  &.skjult {
    display: none;
  }
`;

const DokumenterNav = styled.div`
  position: sticky;
  z-index: 1;
  background: white;
  top: 0;
`;

const DokumenterTittel = styled.h1`
  padding: 0 0 0 0.5em;
  font-size: 1.5em;
  height: 1.25em;
  font-weight: bold;
`;

const VisTilknyttedeKnapp = styled.button`
  display: ${(props) => props.theme.display};
  margin: 0 0.75em 1em 0.75em;
  padding: 0.3em 0.55em;
  height: 2em;
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
  display: none;
`;

const RightAlign = styled.div`
  display: flex;
  justify-content: right;
  float: right; //for safari
`;

const DokumentRad = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0.25em;
  display: grid;
  grid-template-areas:
    "tittel tema dato sjekkboks"
    "vedlegg vedlegg vedlegg vedlegg";
  grid-template-rows: 1fr;
`;

const DokumentTittel = styled.li`
  cursor: pointer;
  color: #0067c5;
  grid-area: tittel;
  width: 11em;
`;

const DokumentTema = styled.li`
  width: 8em;
  cursor: pointer;
  grid-area: tema;
  max-height: 2em;
`;

const TemaText = styled.div`
  max-width: 8em;
  white-space: nowrap;
  cursor: pointer;
  overflow: hidden;
  text-overflow: ellipsis;
  margin: 0;
`;
const DokumentDato = styled.li`
  max-width: 8em;
  cursor: pointer;
  text-align: center;
  font-size: 0.9em;
  grid-area: dato;
`;

const DokumentSjekkboks = styled.li`
  width: 100%;
  text-align: right;
  grid-area: sjekkboks;
`;

const VedleggKontainer = styled.div`
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
  cursor: pointer;
`;
const PreviewKontainer = styled.div`
  display: ${(props) => props.theme.display};
  margin: 0.25em 0.25em 0.25em 0.25em;
  background: white;
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
  border-radius: 4px;
  width: 40em;
  overflow: hidden;
  position: relative;
`;

const Preview = styled.div`
  height: 100%;
  overflow: auto;
  overflow-x: hidden;
  position: relative;
  z-index: 0;
`;
const PreviewTitle = styled.div`
  background: #cde7d8;
  display: flex;
  position: sticky;
  top: 0;
  padding: 1em 0 1em 0.5em;
  z-index: 1;
  justify-content: space-between;
  height: 3.5em;
`;

const SVGIkon = styled.img`
  color: black;
  cursor: pointer;
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
  cursor: pointer;
  color: black;
  margin: 0.25em 1em 0 0.2em;
  -webkit-transition: all 0.15s ease-in-out;
  transition: all 0.15s ease-in-out;
  &:hover {
    transform: scale(1.1);
  }
`;

const PDFKontainer = styled.div`
  overflow: auto;
  overflow-x: hidden; // for safari

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

const Feil = styled.div`
  display: block;
  margin: 1em;
`;

export default function KlagebehandlingKontainer({ faner }: { faner: IFaner }) {
  const [aktivPDF, settAktivPDF] = useState(false);
  const [journalpostId, settjournalpostId] = useState(0);
  const [dokumentTittel, settdokumentTittel] = useState("");
  const [dokumentInfoId, settdokumentInfoId] = useState(0);
  const klage = useAppSelector(velgKlage);
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

  const [dokumentgrid, settDokumentgrid] = useState("1fr 1fr 1fr 1fr");

  return (
    <DokumentKontainer theme={{ dokumentgrid }}>
      <DokumentTabell
        settAktivPDF={settAktivPDF}
        settjournalpostId={settjournalpostId}
        settdokumentTittel={settdokumentTittel}
        settDokumentGrid={settDokumentgrid}
        settdokumentInfoId={settdokumentInfoId}
        faner={faner}
      />
      <PreviewKontainer
        theme={{ display: faner.dokumenter.checked && aktivPDF ? "unset" : "none" }}
      >
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
          <Document
            file={klage.currentPDF}
            onLoadSuccess={onDocumentLoadSuccess}
            options={options}
            error={<Feil>Kunne ikke hente PDF</Feil>}
            loading={<NavFrontendSpinner />}
          >
            <PDFKontainer>
              {Array.from(new Array(numPages), (el, index) => (
                <Page key={`page_${index + 1}`} pageNumber={index + 1} />
              ))}
            </PDFKontainer>
          </Document>
        </Preview>
      </PreviewKontainer>

      <Behandlingsskjema skjult={!faner.detaljer.checked} />
      <FullforVedtak skjult={!faner.vedtak.checked} />
    </DokumentKontainer>
  );
}

export interface Item {
  id: string;
  journalpostId: string;
  dokumentInfoId: string;
}

function itemClicked(
  journalpostId: string,
  dokumentInfoId: string,
  items: Array<Partial<IDokument>>
) {
  return (
    items.filter(
      (it: Partial<IDokument>) =>
        it.journalpostId === journalpostId && it.dokumentInfoId === dokumentInfoId
    ).length > 0
  );
}
function subItemClicked(dokumentInfoId: string, idx: number, items: Array<Partial<IVedlegg>>) {
  return (
    items.filter((it: Partial<IVedlegg>, _idx: number) => it.dokumentInfoId === dokumentInfoId)
      .length > 0
  );
}

function sjekkErTilordnet(klage: any, journalpostId: string, dokumentInfoId: string): boolean {
  if (!klage?.dokumenterTilordnede) {
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
  faner: IFaner;
}) {
  const klage: IKlage = useAppSelector(velgKlage);
  const dispatch = useAppDispatch();
  const { loading, hasNextPage, error, loadMore } = useLoadItems();

  const [liste, setListe] = useState<IDokument[]>([]);

  const [infiniteRef, { rootRef }] = useInfiniteScroll({
    loading: klage.lasterDokumenter,
    hasNextPage: klage.hasMore,
    onLoadMore: handleLoadMore,
    disabled: !!error,
    rootMargin: `0px 0px ${infiniteBottomMargin} 0px`,
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
    dispatch(hentDokumentTilordnedeHandling({ id: klage.id }));
  }, []);

  useEffect(() => {
    if (klage.dokumenter) {
      let startCursor = liste.length;
      let newArray: IDokument[] = [];
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

  const [visFullKontainer, settvisFullKontainer] = useState(true);

  if (!klage.dokumenter) {
    return <NavFrontendSpinner />;
  }
  return (
    <DokumenterKontainer
      theme={{
        display: props.faner.dokumenter.checked ? "block" : "none",
        width: visFullKontainer ? "40em" : "15em",
      }}
    >
      <DokumenterMinivisning theme={{ display: !visFullKontainer ? "unset" : "none" }}>
        <DokumenterNav>
          <DokumenterTittel>Dokumenter</DokumenterTittel>
          <VisTilknyttedeKnapp
            theme={{ display: visFullKontainer ? "unset" : "none" }}
            onClick={() => {
              settvisFullKontainer(false);
              props.settDokumentGrid("15.5em 1fr 1fr 1fr");
            }}
          >
            Vis kun tilknyttede
          </VisTilknyttedeKnapp>
          <VisTilknyttedeKnapp
            theme={{ display: !visFullKontainer ? "unset" : "none" }}
            onClick={() => {
              settvisFullKontainer(true);
              props.settDokumentGrid("1fr 1fr 1fr 1fr");
            }}
          >
            Se alle dokumenter
          </VisTilknyttedeKnapp>
        </DokumenterNav>

        {klage?.dokumenterTilordnede &&
          klage.dokumenterTilordnede.map((item: any) => {
            return (
              <Tilknyttet key={item.journalpostId + item.dokumentInfoId}>
                <TilknyttetDato>{formattedDate(item.registrert)}</TilknyttetDato>
                <TilknyttetTittel
                  onClick={() =>
                    item.harTilgangTilArkivvariant &&
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
          })}
      </DokumenterMinivisning>
      <DokumenterFullvisning ref={rootRef} theme={{ display: visFullKontainer ? "flex" : "none" }}>
        <DokumenterNav>
          <DokumenterTittel>Dokumenter</DokumenterTittel>
          <VisTilknyttedeKnapp
            theme={{ display: visFullKontainer ? "unset" : "none" }}
            onClick={() => {
              settvisFullKontainer(false);
              props.settDokumentGrid("15.5em 1fr 1fr 1fr");
            }}
          >
            Vis kun tilknyttede ({klage.dokumenterTilordnede?.length ?? "0"})
          </VisTilknyttedeKnapp>
          <VisTilknyttedeKnapp
            theme={{ display: !visFullKontainer ? "unset" : "none" }}
            onClick={() => {
              settvisFullKontainer(true);
              props.settDokumentGrid("1fr 1fr 1fr 1fr");
            }}
          >
            Se alle dokumenter
          </VisTilknyttedeKnapp>
        </DokumenterNav>
        <List>
          {liste.map((item: IDokument) => (
            <ListItem key={item.journalpostId + item.dokumentInfoId}>
              <DokumentRad>
                <DokumentTittel
                  onClick={() =>
                    item.harTilgangTilArkivvariant &&
                    hentPreview({
                      behandlingId: klage.id,
                      journalpostId: item.journalpostId,
                      dokumentInfoId: item.dokumentInfoId,
                      dokumentTittel: item.tittel!,
                      props: props,
                    })
                  }
                >
                  {item.tittel}
                </DokumentTittel>
                <DokumentTema
                  onClick={() =>
                    item.harTilgangTilArkivvariant &&
                    hentPreview({
                      behandlingId: klage.id,
                      journalpostId: item.journalpostId,
                      dokumentInfoId: item.dokumentInfoId,
                      dokumentTittel: item.tittel!,
                      props: props,
                    })
                  }
                  className={`etikett etikett--mw etikett--info etikett--${item
                    .tema!.split(" ")[0]
                    .toLowerCase()}`}
                >
                  <TemaText>{item.tema}</TemaText>
                </DokumentTema>
                <DokumentDato
                  onClick={() =>
                    item.harTilgangTilArkivvariant
                      ? hentPreview({
                          behandlingId: klage.id,
                          journalpostId: item.journalpostId,
                          dokumentInfoId: item.dokumentInfoId,
                          dokumentTittel: item.tittel!,
                          props: props,
                        })
                      : console.error("har ikke tilgang")
                  }
                  className={"liten"}
                >
                  {formattedDate(item.registrert)}
                </DokumentDato>

                <DokumentSjekkboks className={"dokument-sjekkboks"}>
                  <RightAlign>
                    <Sjekkboks
                      type={"checkbox"}
                      id={item.journalpostId + item.dokumentInfoId}
                      disabled={!item.harTilgangTilArkivvariant}
                      checked={item.valgt}
                      onChange={() => {
                        console.log("endret sjekkboks main");
                      }}
                    />
                    <label
                      onClick={() => {
                        if (item.valgt) {
                          fradelDokument(klage.id, item.journalpostId, item.dokumentInfoId);
                        } else {
                          tilordneDokument(klage.id, item.journalpostId, item.dokumentInfoId);
                        }
                      }}
                      htmlFor={item.journalpostId + item.dokumentInfoId}
                    />
                  </RightAlign>
                </DokumentSjekkboks>
                {item.vedlegg.length > 0 && (
                  <VedleggKontainer>
                    {item.vedlegg.map((vedlegg: any, idx: number) => (
                      <VedleggRad key={`vedlegg-${idx}${item.dokumentInfoId}`}>
                        <VedleggTittel
                          onClick={() =>
                            item.harTilgangTilArkivvariant
                              ? hentPreview({
                                  behandlingId: klage.id,
                                  journalpostId: item.journalpostId,
                                  dokumentInfoId: vedlegg.dokumentInfoId,
                                  dokumentTittel: vedlegg.tittel,
                                  props: props,
                                })
                              : console.error("ingen tilgang")
                          }
                        >
                          {vedlegg.tittel}
                        </VedleggTittel>

                        <DokumentSjekkboks className={"dokument-sjekkboks"}>
                          <RightAlign>
                            <Sjekkboks
                              id={idx + item.dokumentInfoId}
                              type={"checkbox"}
                              checked={vedlegg.valgt}
                              disabled={!item.harTilgangTilArkivvariant}
                              onChange={() => {
                                console.log("endret sjekkboks sub");
                              }}
                              onClick={() => {
                                if (vedlegg.valgt) {
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
                            <label htmlFor={idx + item.dokumentInfoId} />
                          </RightAlign>
                        </DokumentSjekkboks>
                      </VedleggRad>
                    ))}
                  </VedleggKontainer>
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
      </DokumenterFullvisning>
    </DokumenterKontainer>
  );
}
