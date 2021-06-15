import React from "react";
import styled from "styled-components";

interface HeaderProps {
  settFullvisning: (fullvisning: boolean) => void;
  fullvisning: boolean;
}

export const Header = ({ fullvisning, settFullvisning }: HeaderProps) => (
  <DokumenterNav>
    <DokumenterTittel>Dokumenter</DokumenterTittel>
    <VisTilknyttedeKnapp
      onClick={() => {
        settFullvisning(!fullvisning);
        // props.settDokumentGrid("15.5em 1fr 1fr 1fr");
        // props.settDokumentGrid("1fr 1fr 1fr 1fr");
      }}
    >
      {getText(fullvisning)}
    </VisTilknyttedeKnapp>
  </DokumenterNav>
);

const getText = (fullvisning: boolean) =>
  fullvisning ? "Vis kun tilknyttede" : "Se alle dokumenter";

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
