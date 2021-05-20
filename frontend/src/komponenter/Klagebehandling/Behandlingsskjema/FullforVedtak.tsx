import { HeaderRow } from "../../../styled-components/Row";
import React from "react";
import styled from "styled-components";

const Kontainer = styled.div`
  display: ${(props) => props.theme.display};
  margin: 0.25em 0.25em 0.25em 0.25em;
  background: white;
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
  border-radius: 4px;
  width: ${(props) => props.theme.width};
  grid-template-columns: repeat(2, 1fr);
  gap: 0;
`;

const KlageBoks = styled.div`
  width: 100%;
  padding: 0.25em 1.5em;

  &:not(:first-child) {
    border-left: 1px solid #c9c9c9;
  }

  h1 {
    font-size: 1.25em;
    font-weight: 600;
    margin: 16px 0;
  }
`;

function FullforVedtak({ skjult }: { skjult: boolean }) {
  return (
    <Kontainer theme={{ display: !skjult ? "grid" : "none", width: "40em" }}>
      <KlageBoks>
        <HeaderRow>
          <h1>Fullfør vedtak</h1>
        </HeaderRow>
      </KlageBoks>
    </Kontainer>
  );
}

export default FullforVedtak;
