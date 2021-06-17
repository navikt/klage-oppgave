import React from "react";
import { VisVedlegg } from "./VisVedlegg";
import { VelgOgSendTilMedunderskriver } from "./VelgOgSendTilMedunderskriver";
import { GodkjennOgSendUtVedtak } from "./GodkjennOgSendUtVedtak";
import { LastOppVedlegg } from "./LastOppVedlegg";
import { Beholder } from "./styled-components/beholder";
import { Title } from "./styled-components/title";
import { SlettVedlegg } from "./SlettVedlegg";
import { IKlagebehandling } from "../../../tilstand/moduler/klagebehandling/stateTypes";

interface FullforVedtakProps {
  skjult: boolean;
  klagebehandling: IKlagebehandling;
}

export const FullforVedtak = ({ skjult, klagebehandling }: FullforVedtakProps) => {
  if (skjult) {
    return null;
  }
  return (
    <Beholder>
      <Title>Fullfør vedtak</Title>
      <VisVedlegg klagebehandling={klagebehandling} />
      <SlettVedlegg klagebehandling={klagebehandling} />
      <LastOppVedlegg klagebehandling={klagebehandling} />
      <VelgOgSendTilMedunderskriver klagebehandling={klagebehandling} />
      <GodkjennOgSendUtVedtak klagebehandling={klagebehandling} />
    </Beholder>
  );
};
