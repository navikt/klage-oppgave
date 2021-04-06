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

const ListContainer = styled.div`
  max-height: 400px;
  max-width: 500px;
  overflow: auto;
  background-color: #fafafa;
`;

export default function Dokumenter() {
  const [aktivtDokument, settaktivtDokument] = useState(0);
  const klage: IKlage = useSelector(velgKlage);

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
      let ARRAY_SIZE = klage.dokumenter.length;
      let newArray: Item[] = [];
      let j = 0;
      for (let i = startCursor; i < startCursor + ARRAY_SIZE; i++) {
        newArray = [...newArray, klage.dokumenter[j++]];
      }
      setListe(newArray);
      //setListe((current) => [...current, ...newArray]);
    }
  }, [klage.dokumenter]);

  /*  const klage: IKlage = useSelector(velgKlage);
       const { settaktivtDokument } = props;

       function hentPreview(behandlingId: string, journalpostId: string, dokumentInfoId: string) {
         dispatch(hentPreviewHandling({ id: behandlingId, journalpostId, dokumentInfoId }));
       }

       function tilordneDokument(behandlingId: string, journalpostId: string) {
         dispatch(tilordneDokumenterHandling({ id: behandlingId, journalpostId }));
       }
       */

  if (!klage.dokumenter || !klage.dokumenterAlleHentet) {
    return <NavFrontendSpinner />;
  }

  return (
    <ListContainer ref={rootRef}>
      <List>
        {liste.map((item: any) => (
          <ListItem key={item.journalpostId + item.dokumentInfoId}>{item.tittel}</ListItem>
        ))}
        {klage.hasMore && (
          <ListItem ref={infiniteRef}>
            <Loading />
          </ListItem>
        )}
      </List>
    </ListContainer>
  );
}
