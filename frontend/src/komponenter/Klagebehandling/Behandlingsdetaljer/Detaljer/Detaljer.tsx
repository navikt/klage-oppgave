import React from "react";
import styled from "styled-components";
import { temaOversettelse, typeOversettelse } from "../../../../domene/forkortelser";
import { HeaderRow, Row } from "../../../../styled-components/Row";
import { useAppSelector } from "../../../../tilstand/konfigurerTilstand";
import { velgKlagebehandling } from "../../../../tilstand/moduler/klagebehandling/selectors";
import { FraNavEnhet } from "./FraNavEnhet";
import { MottattFoersteinstans } from "./MottattFoersteinstans";
import { OversendtKA } from "./OversendtKA";
import { faaFulltNavnMedFnr } from "./navn";
import { InfofeltStatisk } from "../InfofeltStatisk";

export const Detaljer = () => (
  <>
    <HeaderRow>
      <h1>Behandlingsdetaljer</h1>
    </HeaderRow>
    <div>
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
    </div>
  </>
);

const Klager = () => {
  const klagebehandling = useAppSelector(velgKlagebehandling);
  const info =
    klagebehandling === null
      ? "-"
      : faaFulltNavnMedFnr(
          klagebehandling.sakenGjelderNavn,
          klagebehandling.sakenGjelderFoedselsnummer
        );
  return <InfofeltStatisk header="Klager" info={info} />;
};

const VurderingFraFoersteinstans = () => {
  const klagebehandling = useAppSelector(velgKlagebehandling);
  return (
    <InfofeltStatisk
      header="Melding fra førsteinstans for intern bruk"
      info={klagebehandling?.kommentarFraFoersteinstans || "-"}
    />
  );
};

const TyperTemaer = () => {
  const klagebehandling = useAppSelector(velgKlagebehandling);

  return (
    <Behandlingsinformasjon>
      <div>
        <b>Type:</b>
        <ul className={"detaljliste"}>
          <li>
            <div className={"etikett etikett--type"}>
              {typeOversettelse(klagebehandling?.type) ?? "-"}
            </div>
          </li>
        </ul>
      </div>

      <div>
        <b>Tema:</b>
        <ul className={"detaljliste"}>
          <li>
            <div className={"etikett etikett--sykepenger"}>
              {temaOversettelse(klagebehandling?.tema) ?? "-"}
            </div>
          </li>
        </ul>
      </div>
    </Behandlingsinformasjon>
  );
};

const Behandlingsinformasjon = styled.div`
  display: flex;
  justify-content: space-between;
`;
