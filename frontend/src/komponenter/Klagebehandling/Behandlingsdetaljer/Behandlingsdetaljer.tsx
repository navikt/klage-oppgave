import React from "react";
import styled from "styled-components";
import { HeaderRow } from "../../../styled-components/Row";
import { Kvalitetsskjema } from "./Kvalitetsskjema/Kvalitetsskjema";
import { useAppSelector } from "../../../tilstand/konfigurerTilstand";
import { velgKlagebehandling } from "../../../tilstand/moduler/klagebehandling/selectors";
import { Detaljer } from "./Detaljer/Detaljer";
import { useKanEndre } from "../utils/hooks";
import { ReadOnlyKvalitetsskjema } from "./ReadOnlyKvalitetsskjema/ReadOnlyKvalitetsskjema";

export const Behandlingsdetaljer = ({ skjult }: { skjult: boolean }) => {
  const klagebehandling = useAppSelector(velgKlagebehandling);
  const kanEndre = useKanEndre();

  if (klagebehandling === null) {
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

const Beholder = styled.section<{ skjult: boolean }>`
  display: ${(props) => (props.skjult ? "none" : "grid")};
  margin: 0.25em 0.25em 0.25em 0.25em;
  background: white;
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
  border-radius: 4px;
  width: 40em;
  grid-template-columns: repeat(2, 1fr);
  gap: 0;
  height: 100%;
  overflow: scroll;
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
