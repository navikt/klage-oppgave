import React from "react";
import styled from "styled-components";
import { gosysEnvironment } from "../../../domene/eksterne_systemer";
//@ts-ignore
import ExtLink from "../../extlinkblue.svg";
import LagringsIndikator from "./AutolagreElement";
import { useIsSaved } from "../utils/hooks";

interface EksterneLenkerProps {
  fnr: string | null;
  id: string;
}

export default function EksterneLenker({ id, fnr }: EksterneLenkerProps) {
  if (fnr === null) {
    return null;
  }
  const isSaved = useIsSaved();

  return (
    <Knapper>
      <Knapperad>
        <Lenke
          target="_blank"
          aria-label={"Ekstern lenke til Gosys for denne personen"}
          href={`${gosysEnvironment(window.location.hostname)}/personoversikt/fnr=${fnr}`}
        >
          Gosys&nbsp;
          <Ikon alt="Ekstern lenke" src={ExtLink} />
        </Lenke>
      </Knapperad>
      <Knapperad>
        <LagringsIndikator autosaveStatus={!isSaved} />
      </Knapperad>
    </Knapper>
  );
}

const Knapper = styled.div`
  display: flex;
  grid-area: Knapper;
  justify-self: right;
  border: 1px solid #e7e9e9;
  border-right: 0;
  border-bottom: 0;
  border-top: 0;
  padding: 1em;
  @media screen and (max-width: 1400px) {
    padding: 1em 0 0 0;
    border: none;
  }
`;
const Lenke = styled.a`
  white-space: nowrap;
  text-decoration: none;
  color: black;
`;
const Ikon = styled.img`
  position: absolute;
  margin: 2px 0 0 0.15em;
  z-index: 0;
`;

const Knapperad = styled.div`
  display: block;
  width: 100%;
  margin: 0 0.5em 0 0;
  text-align: center;
  width: 5em;
  white-space: nowrap;
`;
