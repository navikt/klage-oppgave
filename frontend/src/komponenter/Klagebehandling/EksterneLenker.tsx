//@ts-ignore
import ExtLink from "../extlinkblue.svg";
import React from "react";
import styled from "styled-components";
import {
  aInntektEnvironment,
  gosysEnvironment,
  modiaEnvironment,
  vedtaksEnvironment,
} from "../../domene/eksterne_systemer";

interface EksterneLenkerProps {
  fnr: string | null;
  id: string;
}

export default function EksterneLenker({ id, fnr }: EksterneLenkerProps) {
  if (fnr === null) {
    return null;
  }
  return (
    <Knapper>
      <Knapperad>
        <Lenke
          target="_blank"
          aria-label={"Ekstern lenke til Gosys for denne personen"}
          href={`${gosysEnvironment(window.location.hostname)}/personoversikt/fnr=${fnr}`}
        >
          Gosys
        </Lenke>
        <Lenke2
          target="_blank"
          aria-label={"Ekstern lenke til Gosys for denne personen"}
          href={`${gosysEnvironment(window.location.hostname)}/personoversikt/fnr=${fnr}`}
        >
          <Ikon alt="Ekstern lenke" src={ExtLink} />
        </Lenke2>
      </Knapperad>
    </Knapper>
  );
}

const Knapper = styled.div`
  display: flex;
  grid-area: Knapper;
  justify-content: space-between;
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
  margin: 0 0.25em 0 0.5em;
  white-space: nowrap;
  text-decoration: none;
  color: black;
`;
const Lenke2 = styled.a`
  position: relative;
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
  width: 7em;
  white-space: nowrap;
`;
