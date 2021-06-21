import React, { useMemo, useState } from "react";
import { Document, Page } from "react-pdf";
import styled from "styled-components";
import NavFrontendSpinner from "nav-frontend-spinner";
import { IDokument } from "../../../tilstand/moduler/dokumenter/stateTypes";
// @ts-ignore
import CloseSVG from "../../cancelblack.svg";
// @ts-ignore
import ExtLink from "../../extlink.svg";

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

  const [numPages, setNumPages] = useState(0);

  const pageKeys = useMemo<string[]>(() => {
    if (dokument === null || numPages === 0) {
      return [];
    }
    return Array.from(
      new Array(numPages),
      (_, index) => `dokument_${dokument.journalpostId}-${dokument.dokumentInfoId}/page_${index}`
    );
  }, [numPages, dokument]);

  if (dokument === null) {
    return null;
  }

  return (
    <FullBeholder>
      <PreviewBeholder>
        <Preview>
          <PreviewTitle>
            {dokument.tittel}
            <div>
              <a href={url} target={"_blank"}>
                <EksternalSVGIkon alt="Ekstern lenke" src={ExtLink} />
              </a>
              <SVGIkon alt="Lukk forhåndsvisning" src={CloseSVG} onClick={close} />
            </div>
          </PreviewTitle>
          <Document
            file={url}
            onLoadSuccess={({ numPages }) => setNumPages(numPages)}
            options={options}
            error={<Feil>Kunne ikke hente PDF</Feil>}
            loading={<NavFrontendSpinner />}
          >
            {pageKeys.map((key, index) => (
              <Page key={key} pageNumber={index + 1} width={760} />
            ))}
          </Document>
        </Preview>
      </PreviewBeholder>
    </FullBeholder>
  );
};

const options = {
  cMapUrl: "cmaps/",
  cMapPacked: true,
};

const FullBeholder = styled.section`
  display: block;
  min-width: 760px;
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
  overflow: scroll;
`;

const Preview = styled.div`
  height: 100%;
  overflow-y: auto;
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

const Feil = styled.div`
  display: block;
  margin: 1em;
`;
