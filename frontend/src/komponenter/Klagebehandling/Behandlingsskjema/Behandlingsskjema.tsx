import { IKlage } from "../../../tilstand/moduler/klagebehandling";
import { useSelector } from "react-redux";
import { velgKlage } from "../../../tilstand/moduler/klagebehandlinger.velgere";
import React from "react";
import { temaOversettelse, typeOversettelse } from "../../../domene/forkortelser";

import styled from "styled-components";
import { HeaderRow, Row } from "../../../styled-components/Row";
import { FraNavEnhet } from "./FraNavEnhet";
import { faaFulltNavnMedFnr, InfofeltStatisk } from "./TekstDisplay";
import { UtfallSkjema } from "./UtfallSkjema";
import { OversendtKA } from "./OversendtKA";
import { MottattFoersteinstans } from "./MottattFoersteinstans";

const KlageKontainer = styled.div`
  display: ${(props) => props.theme.display};
  grid-template-columns: repeat(2, 1fr);
  gap: 0;
  margin: 1em;
`;

const Detaljer = styled.div`
  display: flex;
  justify-content: space-between;
  max-width: 25em;
`;

const KlageBoks = styled.div`
  width: 100%;
  background: white;
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

function Klager() {
  const klage: IKlage = useSelector(velgKlage);
  return (
    <InfofeltStatisk
      header="Klager"
      info={faaFulltNavnMedFnr(klage.sakenGjelderNavn, klage.sakenGjelderFoedselsnummer)}
    />
  );
}

function VurderingFraFoersteinstans() {
  const klage: IKlage = useSelector(velgKlage);
  return (
    <InfofeltStatisk
      header="Vurdering fra førsteinstans for intern bruk"
      info={klage.kommentarFraFoersteinstans || "-"}
    />
  );
}

function TyperTemaer() {
  const klage: IKlage = useSelector(velgKlage);

  return (
    <Detaljer>
      <div>
        <b>Type:</b>
        <ul className={"detaljliste"}>
          <li>
            <div className={"etikett etikett--type"}>{typeOversettelse(klage.type) ?? "-"}</div>
          </li>
        </ul>
      </div>

      <div>
        <b>Tema:</b>
        <ul className={"detaljliste"}>
          <li>
            <div className={"etikett etikett--sykepenger"}>
              {temaOversettelse(klage.tema) ?? "-"}
            </div>
          </li>
        </ul>
      </div>
    </Detaljer>
  );
}

export default function Behandlingsskjema({ skjult }: { skjult: boolean }) {
  return (
    <KlageKontainer theme={{ display: !skjult ? "grid" : "none" }}>
      <KlageBoks>
        <HeaderRow>
          <h1>Behandlingsdetaljer</h1>
        </HeaderRow>
        <Row>
          <Klager />
        </Row>
        <Row>
          <TyperTemaer />
        </Row>
        <Row>
          <MottattFoersteinstans />
        </Row>
        <Row>
          <FraNavEnhet />
        </Row>
        <Row>
          <OversendtKA />
        </Row>
        <Row>
          <VurderingFraFoersteinstans />
        </Row>
      </KlageBoks>

      <KlageBoks>
        <UtfallSkjema />
      </KlageBoks>
    </KlageKontainer>
  );
}