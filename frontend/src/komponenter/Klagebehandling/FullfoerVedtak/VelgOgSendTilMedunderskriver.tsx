import React, { useState, useMemo } from "react";
import { useAppSelector } from "../../../tilstand/konfigurerTilstand";
import { velgMedunderskrivere } from "../../../tilstand/moduler/medunderskrivere/selectors";
import { SendTilMedunderskriver } from "./SendTilMedunderskriver";
import { TilbakeTilOppgaverLenke } from "./styled-components/tilbake-link";
import { VisSattMedunderskriver } from "./VisSattMedunderskriver";
import { VelgMedunderskriver } from "./VelgMedunderskriver";
import { velgMeg } from "../../../tilstand/moduler/meg.velgere";
import { IKlagebehandling } from "../../../tilstand/moduler/klagebehandling/stateTypes";
import { useIsSaved } from "../utils/hooks";

interface VelgOgSendTilMedunderskriverProps {
  klagebehandling: IKlagebehandling;
}

export const VelgOgSendTilMedunderskriver = ({
  klagebehandling,
}: VelgOgSendTilMedunderskriverProps) => {
  const {
    graphData: { id },
  } = useAppSelector(velgMeg);
  const { loading, medunderskrivere } = useAppSelector(velgMedunderskrivere);
  const isSaved = useIsSaved();
  const {
    tema,
    medunderskriverident,
    vedtak: [vedtak],
  } = klagebehandling;
  const [valgtMedunderskriver, settValgtMedunderskriver] = useState<string | undefined>(
    medunderskriverident ?? undefined
  );

  const isValidSelection = useMemo(
    () => medunderskrivere.some(({ ident }) => ident === valgtMedunderskriver),
    [medunderskrivere, valgtMedunderskriver]
  );

  // Hvis du er medunderskriver.
  if (medunderskriverident === id) {
    return null;
  }

  // Hvis vedtaket er sent til medunderskriver.
  if (typeof medunderskriverident === "string" && medunderskriverident.length !== 0) {
    return (
      <>
        <VisSattMedunderskriver klagebehandling={klagebehandling} />
        <TilbakeTilOppgaverLenke to={"/mineoppgaver"}>Tilbake til oppgaver</TilbakeTilOppgaverLenke>
      </>
    );
  }

  const { file } = vedtak;
  // Hvis det ikke er lastet opp et vedtak.
  if (file === null) {
    return null;
  }

  return (
    <>
      <VelgMedunderskriver
        tema={tema}
        value={valgtMedunderskriver}
        onSelect={settValgtMedunderskriver}
      />
      <SendTilMedunderskriver
        klagebehandling={klagebehandling}
        disabled={loading || !isValidSelection || !isSaved}
        medunderskriverident={valgtMedunderskriver}
      />
    </>
  );
};
