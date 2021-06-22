import React, { useMemo, useState } from "react";
import styled from "styled-components";
import { Behandlingsdetaljer } from "./Behandlingsdetaljer/Behandlingsdetaljer";
import { IFaner } from "./KlageBehandling";
import { Dokumenter } from "./Dokumenter/Dokumenter";
import { IKlagebehandling } from "../../tilstand/moduler/klagebehandling/stateTypes";
import { useKlagebehandlingUpdater } from "./utils/hooks";
import { FullforVedtak } from "./FullfoerVedtak/FullforVedtak";

interface KlagebehandlingPanelerProps {
  faner: IFaner;
  klagebehandling: IKlagebehandling;
}

export const KlagebehandlingPaneler = ({ faner, klagebehandling }: KlagebehandlingPanelerProps) => {
  const [fullvisning, settFullvisning] = useState<boolean>(true);

  useKlagebehandlingUpdater(klagebehandling);

  return (
    <SideBeholder data-testid={"behandlingsdetaljer"}>
      <Dokumenter
        skjult={!faner.dokumenter.checked}
        settFullvisning={settFullvisning}
        fullvisning={fullvisning}
        klagebehandling={klagebehandling}
      />
      <Behandlingsdetaljer skjult={!faner.detaljer.checked} klagebehandling={klagebehandling} />
      <FullforVedtak skjult={!faner.vedtak.checked} klagebehandling={klagebehandling} />
    </SideBeholder>
  );
};

const SideBeholder = styled.div`
  display: flex;
  margin: 0 0.25em 0 0;
  height: calc(100% - 3em);
  overflow-x: scroll;
  overflow-y: hidden;
  padding-bottom: 0.5em;

  @media screen and (max-width: 1400px) {
    height: calc(100% - 6.25em);
  }
`;
