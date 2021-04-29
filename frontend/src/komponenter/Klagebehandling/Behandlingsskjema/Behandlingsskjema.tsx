import { IKlage } from "../../../tilstand/moduler/klagebehandling";
import { useSelector } from "react-redux";
import { velgKlage } from "../../../tilstand/moduler/klagebehandlinger.velgere";
import React, { useState } from "react";
import { temaOversettelse } from "../../../domene/forkortelser";

import styled from "styled-components";
import { Row } from "../../../styled-components/Row";
import { Dato, Datoer } from "./Datoer";
import { FraNavEnhet } from "./FraNavEnhet";
import { InfofeltStatisk } from "./TekstDisplay";
import { UtfallSkjema } from "./UtfallSkjema";

const KlageKontainer = styled.div`
  display: ${(props) => props.theme.display};
  grid-template-columns: repeat(4, 1fr);
  gap: 0.2em;
  margin: 1em 0 1em 0;

  @media (max-width: 1600px) {
    grid-template-columns: repeat(2, 1fr);
    margin: 1em 0 1em 0;
  }
`;

const Detaljer = styled.div`
  display: flex;
  justify-content: space-between;
  max-width: 25em;
`;

export interface CustomMaxWidthPercProps {
  maxWidth?: number;
}

// const MaxWidthPercContainer = styled.div<CustomMaxWidthPercProps>`
//   max-width: ${({ maxWidth = 0 }) => maxWidth + "%"};
// `;

const KlageBoks = styled.div`
  width: 100%;
  background: white;
  border-radius: 0.25em;
  margin: 0 0 0 1em;
  padding: 0.25em 1.5em;

  h1 {
    font-size: 1.25em;
    font-weight: 600;
  }
`;

function HjemmelBasis() {
  const klage: IKlage = useSelector(velgKlage);
  return (
    <div className={"detaljer"}>
      <div style={{ marginTop: "1em" }}>
        <span>Utfallet er basert på lovhjemmel:</span>
        <div className={"nedtrekksboks"}>
          <select className={"input__nedtrekk"} onChange={() => {}}>
            <option value="Trukket">1-322</option>
          </select>
        </div>
      </div>
    </div>
  );
}

function OversendtKA() {
  const klage: IKlage = useSelector(velgKlage);
  console.log(klage);
  const [datoOversendtTilKA, settDatoOversendtTilKA] = useState<string | null>(
    klage.mottatt ?? null
  );

  return (
    <Dato label="Oversendt til KA:" dato={datoOversendtTilKA} settDato={settDatoOversendtTilKA} />
  );
}

function Klager() {
  const klage: IKlage = useSelector(velgKlage);
  return <InfofeltStatisk header="Klager" info={klage.sakenGjelderNavn} />;
}

function TyperTemaer() {
  const klage: IKlage = useSelector(velgKlage);
  return (
    <Detaljer>
      <div>
        <b>Type:</b>
        <ul className={"detaljliste"}>
          <li>
            <div className={"etikett etikett--type"}>{klage.type}</div>
          </li>
        </ul>
      </div>

      <div>
        <b>Tema:</b>
        <ul className={"detaljliste"}>
          <li>
            <div className={"etikett etikett--sykepenger"}>{temaOversettelse(klage.tema)}</div>
          </li>
        </ul>
      </div>

      {/* <div>
        Hjemmel:
        <ul className={"detaljliste"}>
          {klage.hjemler.length === 0 && <div>Ingen satt</div>}
          {klage.hjemler.map((hjemmel: any, idx: number) => (
            <li key={`hjemmel${idx}`}>
              <div className={"etikett etikett-Sykepenger etikett--hjemmel"}>
                {hjemmel.original || "ikke satt"}
              </div>
            </li>
          ))}
        </ul>
      </div> */}
    </Detaljer>
  );
}

export default function Behandlingsskjema({ skjult }: { skjult: boolean }) {
  return (
    <KlageKontainer theme={{ display: !skjult ? "grid" : "none" }}>
      <KlageBoks>
        <h1>Behandlingsdetaljer</h1>
        <Row>
          <Klager />
        </Row>
        <Row>
          <TyperTemaer />
        </Row>
        <Datoer />
        <Row>
          <FraNavEnhet />
        </Row>
        <Row>
          <OversendtKA />
        </Row>
      </KlageBoks>

      <KlageBoks>
        <h1>Utarbeide vedtak</h1>
        <UtfallSkjema />
        <HjemmelBasis />
      </KlageBoks>
    </KlageKontainer>
  );
}
