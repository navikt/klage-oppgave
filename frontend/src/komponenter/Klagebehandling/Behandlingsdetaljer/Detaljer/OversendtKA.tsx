import React from "react";
import { isoDateToPretty } from "../../../../domene/datofunksjoner";
import { useAppSelector } from "../../../../tilstand/konfigurerTilstand";
import { velgKlagebehandling } from "../../../../tilstand/moduler/klagebehandling/selectors";
import { InfofeltStatisk } from "../InfofeltStatisk";

export function OversendtKA() {
  const klagebehandling = useAppSelector(velgKlagebehandling);

  return (
    <InfofeltStatisk
      header="Mottatt klageinstans"
      info={isoDateToPretty(klagebehandling?.mottatt ?? null) ?? "-"}
    />
  );
}
