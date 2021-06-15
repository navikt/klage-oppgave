import React from "react";
import { VisVedlegg } from "./VisVedlegg";
import { VelgOgSendTilMedunderskriver } from "./VelgOgSendTilMedunderskriver";
import { GodkjennOgSendUtVedtak } from "./GodkjennOgSendUtVedtak";
import { LastOppVedlegg } from "./LastOppVedlegg";
import { Beholder } from "./styled-components/beholder";
import { Title } from "./styled-components/title";

interface FullforVedtakProps {
  skjult: boolean;
}

const FullforVedtak = ({ skjult }: FullforVedtakProps) => (
  <Beholder skjult={skjult}>
    <Title>Fullfør vedtak</Title>
    <VisVedlegg />
    <LastOppVedlegg />
    <VelgOgSendTilMedunderskriver />
    <GodkjennOgSendUtVedtak />
  </Beholder>
);

export default FullforVedtak;
