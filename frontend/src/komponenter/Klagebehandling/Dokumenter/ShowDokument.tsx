import React, { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { IShownDokument } from "./typer";
// @ts-ignore
import CloseSVG from "./ikoner/cancelblack.svg";
// @ts-ignore
import ExtLink from "./ikoner/extlink.svg";
// @ts-ignore
import ZoomIn from "./ikoner/ZoomIn.svg";
// @ts-ignore
import ZoomOut from "./ikoner/ZoomOut.svg";

const MIN_PDF_WIDTH = 760;
const MAX_PDF_WIDTH = 1960;
const ZOOM_STEP = 150;

interface ShowDokumentProps {
  klagebehandlingId: string;
  dokument: IShownDokument | null;
  close: () => void;
}

export const ShowDokument = ({ klagebehandlingId, dokument, close }: ShowDokumentProps) => {
  const url = useMemo(
    () =>
      `/api/klagebehandlinger/${klagebehandlingId}/journalposter/${dokument?.journalpostId}/dokumenter/${dokument?.dokumentInfoId}`,
    [dokument]
  );

  const [pdfWidth, setPdfWidth] = useState<number>(getSavedPdfWidth);
  const increase = () => setPdfWidth(Math.min(pdfWidth + ZOOM_STEP, MAX_PDF_WIDTH));
  const decrease = () => setPdfWidth(Math.max(pdfWidth - ZOOM_STEP, MIN_PDF_WIDTH));

  useEffect(
    () => localStorage.setItem("valgtBreddeForhandsvisning", pdfWidth.toString()),
    [pdfWidth]
  );

  if (dokument === null) {
    return null;
  }

  return (
    <Beholder width={pdfWidth}>
      <Header>
        {dokument.tittel}
        <div>
          <HeaderButton onClick={decrease} text="Zoom ut på PDF" icon={ZoomOut} />
          <HeaderButton onClick={increase} text="Zoom inn på PDF" icon={ZoomIn} />
          <a href={url} target={"_blank"} title="Åpne i ny fane">
            <EksternalSVGIkon alt="Ekstern lenke" src={ExtLink} />
          </a>
          <HeaderButton onClick={close} text="Lukk forhåndsvisning" icon={CloseSVG} />
        </div>
      </Header>
      <PDF
        data={`${url}#toolbar=0&view=fitH&zoom=page-width`}
        role="document"
        type="application/pdf"
        name={dokument.tittel ?? undefined}
      />
    </Beholder>
  );
};

const getSavedPdfWidth = () => {
  const localStorageVerdi = localStorage.getItem("valgtBreddeForhandsvisning");
  if (localStorageVerdi === null) {
    return MIN_PDF_WIDTH;
  }
  const parsed = Number.parseInt(localStorageVerdi, 10);
  return Number.isNaN(parsed) ? MIN_PDF_WIDTH : parsed;
};

interface HeaderButtonProps {
  icon: string;
  text: string;
  onClick: () => void;
}

const HeaderButton = ({ icon, text, onClick }: HeaderButtonProps) => (
  <StyledHeaderButton onClick={onClick} title={text}>
    <SVGIkon alt={text} src={icon} />
  </StyledHeaderButton>
);

interface BeholderProps {
  width: number;
}

const Beholder = styled.section<BeholderProps>`
  display: block;
  min-width: ${(props) => props.width}px;
  height: 100%;
  margin: 0.25em 0.5em;
  background: white;
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
  border-radius: 4px;
  position: relative;
  overflow: hidden;
`;

const StyledHeaderButton = styled.button`
  border: none;
  background-color: transparent;
  padding: 0;
  margin: 0;
`;

const PDF = styled.object`
  width: 100%;
  height: calc(100% - 3.5em);
`;

const Header = styled.div`
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
