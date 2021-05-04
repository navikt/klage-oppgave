import { Select } from "nav-frontend-skjema";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { EnhetKey, FaaGyldigEnhet } from "../../../domene/enheter";
import { IKlage } from "../../../tilstand/moduler/klagebehandling";
import { velgKlage } from "../../../tilstand/moduler/klagebehandlinger.velgere";
import { InfofeltStatisk } from "./TekstDisplay";

export function FraNavEnhet() {
  const klage: IKlage = useSelector(velgKlage);

  return (
    <InfofeltStatisk
      header="Fra NAV-enhet"
      info={klage.fraNAVEnhet + " " + klage.fraNAVEnhetNavn}
    />
  );
}
