import useInfiniteScroll from "react-infinite-scroll-hook";

import {
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
import { Document as PDFDocument } from "react-pdf";
import styled from "styled-components";
import { useLoadItems } from "./utils";
import { List, ListItem, Loading } from "./List";

const ListeContainer = styled.div`
  max-height: 500px;
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

export default function Dokumenter({ skjult }: { skjult: boolean }) {
  const [aktivtDokument, settaktivtDokument] = useState(0);
  const klage: IKlage = useSelector(velgKlage);

  return (
    <div className={`dokument-wrapper ${skjult ? "skjult" : ""}`}>
      <DokumentTabell settaktivtDokument={settaktivtDokument} />
      <div className={"preview"}>
        <PDFDocument file={klage.currentPDF} />
      </div>
    </div>
  );
}

export interface Item {
  id: string;
  journalpostId: string;
  dokumentInfoId: string;
}

function DokumentTabell(props: { settaktivtDokument: Function }) {
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
  function hentPreview(behandlingId: string, journalpostId: string, dokumentInfoId: string) {
    debugger;
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
                <DokumentTittel>{item.tittel}</DokumentTittel>
                <DokumentTema
                  onClick={() => hentPreview(klage.id, item.journalpostId, item.dokumentInfoId)}
                  className={`etikett etikett--mw etikett--info etikett--${item.tema
                    .split(" ")[0]
                    .toLowerCase()}`}
                >
                  <TemaText>{item.tema}</TemaText>
                </DokumentTema>
                <DokumentDato className={"liten"}>{formattedDate(item.registrert)}</DokumentDato>
                <DokumentSjekkboks>
                  <Sjekkboks
                    type={"checkbox"}
                    onClick={() =>
                      tilordneDokument(klage.id, item.journalpostId, item.dokumentInfoId)
                    }
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
