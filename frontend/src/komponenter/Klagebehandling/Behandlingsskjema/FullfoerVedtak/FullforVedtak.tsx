import React from "react";
import { VisVedlegg } from "./VisVedlegg";
import { VelgOgSendTilMedunderskriver } from "./VelgOgSendTilMedunderskriver";
import { GodkjennOgSendUtVedtak } from "./GodkjennOgSendUtVedtak";
import { LastOppVedlegg } from "./LastOppVedlegg";
import { Beholder } from "./styled-components/beholder";
import { Title } from "./styled-components/title";
import { useAppSelector } from "../../../../tilstand/konfigurerTilstand";
import { velgKlagebehandling } from "../../../../tilstand/moduler/klagebehandling/selectors";
import NavFrontendSpinner from "nav-frontend-spinner";
import { SlettVedlegg } from "./SlettVedlegg";

interface FullforVedtakProps {
  skjult: boolean;
}

const FullforVedtak = ({ skjult }: FullforVedtakProps) => {
  const klagebehandling = useAppSelector(velgKlagebehandling);
  if (klagebehandling === null) {
    return (
      <Beholder skjult={skjult}>
        <NavFrontendSpinner />
      </Beholder>
    );
  }
  return (
    <Beholder skjult={skjult}>
      <Title>Fullfør vedtak</Title>
      <VisVedlegg klagebehandling={klagebehandling} />
      <SlettVedlegg klagebehandling={klagebehandling} />
      <LastOppVedlegg klagebehandling={klagebehandling} />
      <VelgOgSendTilMedunderskriver klagebehandling={klagebehandling} />
      <GodkjennOgSendUtVedtak klagebehandling={klagebehandling} />
    </Beholder>
  );
};

export default FullforVedtak;
