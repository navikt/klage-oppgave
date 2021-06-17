import React from "react";
import styled from "styled-components";
import { HeaderRow } from "../../../styled-components/Row";
import { Kvalitetsskjema } from "./Kvalitetsskjema/Kvalitetsskjema";
import { Detaljer } from "./Detaljer/Detaljer";
import { useKanEndre } from "../utils/hooks";
import { ReadOnlyKvalitetsskjema } from "./ReadOnlyKvalitetsskjema/ReadOnlyKvalitetsskjema";
import { IKlagebehandling } from "../../../tilstand/moduler/klagebehandling/stateTypes";

interface BehandlingsdetaljerProps {
  skjult: boolean;
  klagebehandling: IKlagebehandling;
}

export const Behandlingsdetaljer = ({ skjult, klagebehandling }: BehandlingsdetaljerProps) => {
  const kanEndre = useKanEndre();

  if (skjult) {
    return null;
  }

  return (
    <Beholder skjult={skjult}>
      <KlageBoks>
        <Detaljer />
      </KlageBoks>
      <KlageBoks>
        <HeaderRow />
        {kanEndre ? (
          <Kvalitetsskjema klagebehandling={klagebehandling} />
        ) : (
          <ReadOnlyKvalitetsskjema klagebehandling={klagebehandling} />
        )}
      </KlageBoks>
    </Beholder>
  );
};

const Beholder = styled.section`
  display: grid;
  gap: 0;
  grid-template-columns: repeat(2, 1fr);
  margin: 0.25em 0.25em 0.25em 0.25em;
  background: white;
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
  border-radius: 4px;
  width: 40em;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
`;

const KlageBoks = styled.div`
  width: 100%;
  background: white;
  padding: 1.5em 1.5em 0.25em 1.5em;
  display: flex;
  flex-direction: column;
  > div {
    flex-basis: 42px;
  }

  &:not(:first-child) {
    border-left: 1px solid #c9c9c9;
  }

  h1 {
    font-size: 1.25em;
    font-weight: 600;
  }
`;
