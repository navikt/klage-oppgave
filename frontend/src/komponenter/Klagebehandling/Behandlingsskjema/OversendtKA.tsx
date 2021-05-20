import React from "react";
import { useSelector } from "react-redux";
import { isoDateToPretty } from "../../../domene/datofunksjoner";
import { IKlage } from "../../../tilstand/moduler/klagebehandling";
import { velgKlage } from "../../../tilstand/moduler/klagebehandlinger.velgere";
import { InfofeltStatisk } from "./TekstDisplay";

export function OversendtKA() {
  const klage: IKlage = useSelector(velgKlage);

  return (
    <InfofeltStatisk header="Mottatt klageinstans" info={isoDateToPretty(klage.mottatt) ?? "-"} />
  );
}
