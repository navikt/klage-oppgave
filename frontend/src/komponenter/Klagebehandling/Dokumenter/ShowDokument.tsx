import React, { useCallback, useMemo, useState } from "react";
import styled from "styled-components";
import { IDokument } from "../../../tilstand/moduler/dokumenter/stateTypes";
// @ts-ignore
import CloseSVG from "./ikoner/cancelblack.svg";
// @ts-ignore
import ExtLink from "./ikoner/extlink.svg";
// @ts-ignore
import ZoomIn from "./ikoner/ZoomIn.svg";
// @ts-ignore
import ZoomOut from "./ikoner/ZoomOut.svg";

const MIN_BREDDE_FORHANDSVISNING = 760;
const MAX_BREDDE_FORHANDSVISNING = 1960;
const ZOOM_STEP = 150;

interface ShowDokumentProps {
  klagebehandlingId: string;
  dokument: IDokument | null;
  close: () => void;
}

export const ShowDokument = ({ klagebehandlingId, dokument, close }: ShowDokumentProps) => {
  const url = useMemo(
    () =>
      `/api/klagebehandlinger/${klagebehandlingId}/journalposter/${dokument?.journalpostId}/dokumenter/${dokument?.dokumentInfoId}`,
    [dokument]
  );
  const [forhandsvisningsbredde, settForhandsvisningsbredde] =
    useState<number>(hentStartStoerrelseZoom);

  const zoom = useCallback(
    (isZoomIn: boolean) => {
      const bredde = isZoomIn
        ? Math.min(forhandsvisningsbredde + ZOOM_STEP, MAX_BREDDE_FORHANDSVISNING)
        : Math.max(forhandsvisningsbredde - ZOOM_STEP, MIN_BREDDE_FORHANDSVISNING);
      settForhandsvisningsbredde(bredde);
      localStorage.setItem("valgtBreddeForhandsvisning", bredde.toString());
    },
    [forhandsvisningsbredde, settForhandsvisningsbredde]
  );

  if (dokument === null) {
    return null;
  }

  return (
    <FullBeholder forhandsvisningsbredde={forhandsvisningsbredde}>
      <Header>
        {dokument.tittel}
        <div>
          <HeaderButton onClick={() => zoom(false)} text="Zoom ut på PDF" icon={ZoomOut} />
          <HeaderButton onClick={() => zoom(true)} text="Zoom inn på PDF" icon={ZoomIn} />
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
    </FullBeholder>
  );
};

const hentStartStoerrelseZoom = () => {
  const localStorageVerdi = localStorage.getItem("valgtBreddeForhandsvisning");
  if (localStorageVerdi === null) {
    return MIN_BREDDE_FORHANDSVISNING;
  }
  const parsed = Number.parseInt(localStorageVerdi, 10);
  return Number.isNaN(parsed) ? MIN_BREDDE_FORHANDSVISNING : parsed;
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

const FullBeholder = styled.section<{ forhandsvisningsbredde: number }>`
  display: block;
  min-width: ${(props) => props.forhandsvisningsbredde}px;
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
