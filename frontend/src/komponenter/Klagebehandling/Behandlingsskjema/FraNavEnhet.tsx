import React from "react";
import { useAppSelector } from "../../../tilstand/konfigurerTilstand";
import { velgKlagebehandling } from "../../../tilstand/moduler/klagebehandling/selectors";
import { InfofeltStatisk } from "./TekstDisplay";

export function FraNavEnhet() {
  const klagebehandling = useAppSelector(velgKlagebehandling);
  const info =
    klagebehandling === null
      ? "-"
      : klagebehandling.fraNAVEnhetNavn + " - " + klagebehandling.fraNAVEnhet;

  return <InfofeltStatisk header="Fra NAV-enhet" info={info} />;
}
