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
  max-height: 68vh;
  overflow: auto;
  z-index: 5;
`;

const DokumenterContainer = styled.div`
  margin: 0.25em;
  background: white;
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
  border-radius: 4px;
  height: 80vh;
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

const TilordneSjekkboks = styled.input`
  padding: 0.3em 0.55em;
  background: white;
  font-size: 0.9em;
  color: #0067c5;
  border: 1px solid #0067c5;
`;

const DokumentRad = styled.ul`
  list-style: none;
  margin: 0;
  display: flex;
  padding: 0;
  justify-content: space-between;
`;

export default function Dokumenter({ skjult }: { skjult: boolean }) {
  const [aktivtDokument, settaktivtDokument] = useState(0);
  const klage: IKlage = useSelector(velgKlage);

  if (skjult) {
    return null;
  } else
    return (
      <div className={"dokument-wrapper"}>
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

  /*  const klage: IKlage = useSelector(velgKlage);
           const { settaktivtDokument } = props;

           function hentPreview(behandlingId: string, journalpostId: string, dokumentInfoId: string) {
             dispatch(hentPreviewHandling({ id: behandlingId, journalpostId, dokumentInfoId }));
           }
           */

  function tilordneDokument(behandlingId: string, journalpostId: string) {
    dispatch(tilordneDokumenterHandling({ id: behandlingId, journalpostId }));
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
                <li>{item.tittel}</li>
                <li
                  className={`etikett etikett--mw etikett--info etikett--${item.tema
                    .split(" ")[0]
                    .toLowerCase()}`}
                >
                  {item.tema}
                </li>
                <li className={"liten"}>{formattedDate(item.registrert)}</li>
                <li>
                  <TilordneSjekkboks
                    type={"checkbox"}
                    className={"input__checkbox"}
                    onClick={() => tilordneDokument(klage.id, item.journalpostId)}
                  />
                </li>
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
