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
  max-height: 70vh;
  overflow: auto;
`;

const DokumenterContainer = styled.div`
  margin: 0.25em;
  background: white;
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
  border-radius: 4px;
`;

const DokumenterTittel = styled.h1`
  padding: 0 0.5em;
  font-size: 24px;
  font-weight: bold;
`;

const VisTilknyttedeKnapp = styled.button`
  margin: 0 0.75em;
  padding: 0.3em 0.55em;
  background: white;
  font-size: 0.9em;
  color: #0067c5;
  border: 1px solid #0067c5;
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
  grid-template-columns: 1fr 1fr 8em 3em;
  grid-template-rows: 1fr;
`;

const DokumentTittel = styled.li`
  color: #0067c5;
`;

const DokumentTema = styled.li`
  max-width: 8em;
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
`;

const DokumentSjekkboks = styled.li`
  max-width: 2em;
  text-align: right;
`;

const PreviewContainer = styled.div`
  display: ${(props) => props.theme.display};
  margin: 0.25em;
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

  return (
    <div className={`dokument-wrapper ${skjult ? "skjult" : ""}`}>
      <DokumentTabell
        settAktivPDF={settAktivPDF}
        settjournalpostId={settjournalpostId}
        settdokumentTittel={settdokumentTittel}
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
            {Array.from(new Array(numPages), (el, index) => (
              <Page key={`page_${index + 1}`} pageNumber={index + 1} />
            ))}
          </Document>
        </Preview>
      </PreviewContainer>
    </div>
  );
}

export interface Item {
  id: string;
  journalpostId: string;
  dokumentInfoId: string;
}

/*
 <Document
            file={`/api/klagebehandlinger/${klage.id}/journalposter/${journalpostId}/dokumenter/${dokumentInfoId}`}
          />
 */
function sjekkErTilordnet(klage: any, item: any): boolean {
  if (!klage.dokumenterTilordnede) {
    return false;
  }
  let res = klage.dokumenterTilordnede.filter(
    (klage: any) =>
      klage.journalpostId === item.journalpostId && klage.dokumentInfoId === item.dokumentInfoId
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

  if (!klage.dokumenter) {
    return <NavFrontendSpinner />;
  }
  return (
    <DokumenterContainer>
      <DokumenterTittel>Dokumenter</DokumenterTittel>
      <VisTilknyttedeKnapp>Vis kun tilknyttede</VisTilknyttedeKnapp>

      <ListeContainer ref={rootRef}>
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
                    checked={sjekkErTilordnet(klage, item)}
                    onChange={() => {
                      if (sjekkErTilordnet(klage, item)) {
                        return fradelDokument(klage.id, item.journalpostId, item.dokumentInfoId);
                      } else {
                        return tilordneDokument(klage.id, item.journalpostId, item.dokumentInfoId);
                      }
                    }}
                  />
                </DokumentSjekkboks>
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
