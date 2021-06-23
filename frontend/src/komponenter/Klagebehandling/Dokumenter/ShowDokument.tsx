import React, { useMemo, useState } from "react";
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

  const MIN_BREDDE_FORHANDSVISNING = 760;
  const MAX_BREDDE_FORHANDSVISNING = 1960;

  const zoom = (zoomValg: "ut" | "inn") => {
    const zoomStorrelse = 150;
    let valgtBredde = forhandsvisningsbredde;
    if (zoomValg === "ut" && forhandsvisningsbredde > MIN_BREDDE_FORHANDSVISNING) {
      if (forhandsvisningsbredde - zoomStorrelse < MIN_BREDDE_FORHANDSVISNING) {
        valgtBredde = MIN_BREDDE_FORHANDSVISNING;
      }
      valgtBredde = forhandsvisningsbredde - zoomStorrelse;
    } else if (zoomValg === "inn" && forhandsvisningsbredde < MAX_BREDDE_FORHANDSVISNING) {
      if (forhandsvisningsbredde + zoomStorrelse > MIN_BREDDE_FORHANDSVISNING) {
        valgtBredde = MAX_BREDDE_FORHANDSVISNING;
      }
      valgtBredde = forhandsvisningsbredde + zoomStorrelse;
    }
    settForhandsvisningsbredde(valgtBredde);
    localStorage.setItem("valgtBreddeForhandsvisning", valgtBredde.toString());
  };

  const hentStartStoerrelseZoom = () => {
    const localStorageVerdi = localStorage.getItem("valgtBreddeForhandsvisning");
    if (localStorageVerdi) {
      return Number(localStorageVerdi);
    }
    return MIN_BREDDE_FORHANDSVISNING;
  };

  const [forhandsvisningsbredde, settForhandsvisningsbredde] =
    useState<number>(hentStartStoerrelseZoom);

  if (dokument === null) {
    return null;
  }

  return (
    <FullBeholder forhandsvisningsbredde={forhandsvisningsbredde}>
      <PreviewBeholder>
        <Preview>
          <PreviewTitle>
            {dokument.tittel}
            <div>
              <SVGIkon alt="Zoom ut på PDF" src={ZoomOut} onClick={() => zoom("ut")} />
              <SVGIkon alt="Zoom inn på PDF" src={ZoomIn} onClick={() => zoom("inn")} />
              <a href={url} target={"_blank"}>
                <EksternalSVGIkon alt="Ekstern lenke" src={ExtLink} />
              </a>
              <SVGIkon alt="Lukk forhåndsvisning" src={CloseSVG} onClick={close} />
            </div>
          </PreviewTitle>
        </Preview>
        <PDF
          data={url}
          role="document"
          type="application/pdf"
          name={dokument.tittel ?? undefined}
        />
      </PreviewBeholder>
    </FullBeholder>
  );
};

const PDF = styled.object`
  width: 100%;
  height: calc(100% - 3.5em);
`;

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

const PreviewBeholder = styled.div`
  display: block;
  width: 100%;
  height: 100%;
`;

const Preview = styled.div`
  overflow-y: auto;
  overflow-x: hidden;
  position: relative;
  z-index: 0;
  canvas {
    width: 100% !important;
    height: auto !important;
  }
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
