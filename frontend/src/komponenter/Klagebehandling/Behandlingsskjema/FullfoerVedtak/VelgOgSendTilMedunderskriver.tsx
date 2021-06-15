import React, { useState, useMemo } from "react";
import { useAppSelector } from "../../../../tilstand/konfigurerTilstand";
import { velgKlage } from "../../../../tilstand/moduler/klagebehandlinger.velgere";
import { velgMedunderskrivere } from "../../../../tilstand/moduler/medunderskrivere.velgere";
import { SendTilMedunderskriver } from "./SendTilMedunderskriver";
import { TilbakeTilOppgaverLenke } from "./styled-components/tilbake-link";
import { VisSattMedunderskriver } from "./VisSattMedunderskriver";
import { VelgMedunderskriver } from "./VelgMedunderskriver";
import { velgMeg } from "../../../../tilstand/moduler/meg.velgere";

export const VelgOgSendTilMedunderskriver = () => {
  const { id } = useAppSelector(velgMeg);
  const { loading, medunderskrivere } = useAppSelector(velgMedunderskrivere);
  const { medunderskriverident, vedtak } = useAppSelector(velgKlage);
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
        <VisSattMedunderskriver />
        <TilbakeTilOppgaverLenke to={"/mineoppgaver"}>Tilbake til oppgaver</TilbakeTilOppgaverLenke>
      </>
    );
  }

  if (vedtak.length === 0) {
    return null;
  }

  const { file } = vedtak[0];
  // Hvis det ikke er lastet opp et vedtak.
  if (file === null) {
    return null;
  }

  return (
    <>
      <VelgMedunderskriver value={valgtMedunderskriver} onSelect={settValgtMedunderskriver} />
      <SendTilMedunderskriver
        disabled={loading || !isValidSelection}
        medunderskriverident={valgtMedunderskriver}
      />
    </>
  );
};
