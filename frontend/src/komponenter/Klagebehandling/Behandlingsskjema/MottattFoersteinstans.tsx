import React from "react";
import { isoDateToPretty } from "../../../domene/datofunksjoner";
import { useAppSelector } from "../../../tilstand/konfigurerTilstand";
import { velgKlagebehandling } from "../../../tilstand/moduler/klagebehandling/selectors";
import { InfofeltStatisk } from "./TekstDisplay";

export function MottattFoersteinstans() {
  const klagebehandling = useAppSelector(velgKlagebehandling);

  return (
    <InfofeltStatisk
      header="Mottatt førsteinstans"
      info={isoDateToPretty(klagebehandling?.mottattFoersteinstans ?? null) ?? "-"}
    />
  );
}
