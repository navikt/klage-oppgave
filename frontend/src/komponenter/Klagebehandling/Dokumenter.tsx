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
import UendeligListe from "./UendeligListe";
import styled from "styled-components";

interface ListContainerProps {
  scrollable: boolean;
}

const ListeBoks = styled.div<ListContainerProps>`
  max-height: ${(props) => (props.scrollable ? "600px" : "auto")};
  max-width: ${(props) => (props.scrollable ? "600px" : "auto")};
  overflow: auto;
  background-color: #e4e4e4;
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

function DokumentTabell(props: { settaktivtDokument: Function }) {
  const dispatch = useDispatch();
  const klage: IKlage = useSelector(velgKlage);
  const { settaktivtDokument } = props;

  function hentPreview(behandlingId: string, journalpostId: string, dokumentInfoId: string) {
    dispatch(hentPreviewHandling({ id: behandlingId, journalpostId, dokumentInfoId }));
  }

  function hentNeste(ref: string | null) {
    dispatch(lasterDokumenter(false));
    dispatch(hentDokumentAlleHandling({ id: klage.id, ref: ref ?? null, antall: 10 }));
  }

  useEffect(() => {
    dispatch(nullstillDokumenter());
    dispatch(hentDokumentAlleHandling({ id: klage.id, ref: null, antall: 10 }));
    dispatch(hentDokumentTilordnedeHandling({ id: klage.id }));
  }, []);

  function hentForrige(ref: string | null) {
    dispatch(lasterDokumenter(false));
    dispatch(
      hentDokumentAlleHandling({
        id: klage.id,
        ref: ref ?? null,
        antall: 10,
        historyNavigate: true,
      })
    );
  }

  function tilordneDokument(behandlingId: string, journalpostId: string) {
    dispatch(tilordneDokumenterHandling({ id: behandlingId, journalpostId }));
  }

  if (!klage.dokumenter || !klage.dokumenterAlleHentet) {
    return <NavFrontendSpinner />;
  }

  return (
    <div>
      <ListeBoks scrollable={true}>
        <UendeligListe scrollContainer={"parent"} />
      </ListeBoks>
    </div>
  );
}
