import React, { useMemo, useState } from "react";
import styled from "styled-components";
import Behandlingsskjema from "./Behandlingsskjema/Behandlingsskjema";
import { IFaner } from "./KlageBehandling";
import FullforVedtak from "./Behandlingsskjema/FullfoerVedtak/FullforVedtak";
import { Dokumenter } from "./Dokumenter/Dokumenter";
import "./sjekkboks.less";
import { IKlagebehandling } from "../../tilstand/moduler/klagebehandling/stateTypes";
import { useKlagebehandlingUpdater } from "./utils/useKlagebehandlingUpdater";

interface KlagebehandlingBeholderProps {
  faner: IFaner;
  klagebehandling: IKlagebehandling;
}

export const KlagebehandlingBeholder = ({
  faner,
  klagebehandling,
}: KlagebehandlingBeholderProps) => {
  const [fullvisning, settFullvisning] = useState<boolean>(true);
  const grid = useMemo(() => (fullvisning ? "1fr 1fr 1fr 1fr" : ".5fr 1fr 1fr 1fr"), [fullvisning]);

  useKlagebehandlingUpdater(klagebehandling);

  return (
    <SideBeholder data-testid={"behandlingsdetaljer"} grid={grid}>
      <Dokumenter
        skjult={!faner.dokumenter.checked}
        settFullvisning={settFullvisning}
        fullvisning={fullvisning}
      />
      <Behandlingsskjema skjult={!faner.detaljer.checked} />
      <FullforVedtak skjult={!faner.vedtak.checked} />
    </SideBeholder>
  );
};

const SideBeholder = styled.div<{ grid: string }>`
  display: grid;
  grid-template-columns: ${({ grid }) => grid};
  grid-template-rows: 100%;
  margin: 0 0.25em 0 0;
  height: calc(100% - 3em);
  max-height: 100%;
  overflow-x: scroll;
  @media screen and (max-width: 1400px) {
    height: calc(100% - 6.25em);
  }

  &.skjult {
    display: none;
  }
`;
