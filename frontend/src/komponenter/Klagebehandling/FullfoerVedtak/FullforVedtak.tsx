import React from "react";
import { VisVedlegg } from "./VisVedlegg";
import { VelgOgSendTilMedunderskriver } from "./VelgOgSendTilMedunderskriver";
import { GodkjennOgSendUtVedtak } from "./GodkjennOgSendUtVedtak";
import { LastOppVedlegg } from "./LastOppVedlegg";
import { Beholder } from "./styled-components/beholder";
import { Title } from "./styled-components/title";
import NavFrontendSpinner from "nav-frontend-spinner";
import { SlettVedlegg } from "./SlettVedlegg";
import { velgKlagebehandling } from "../../../tilstand/moduler/klagebehandling/selectors";
import { useAppSelector } from "../../../tilstand/konfigurerTilstand";

interface FullforVedtakProps {
  skjult: boolean;
}

export const FullforVedtak = ({ skjult }: FullforVedtakProps) => {
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
