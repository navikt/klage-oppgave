import { Select } from "nav-frontend-skjema";
import React from "react";
import { IKodeverkVerdi } from "../../../tilstand/moduler/oppgave";

interface OmgjoeringsgrunnProps {
  gyldigeOmgjoeringsgrunner: IKodeverkVerdi[];
  omgjoeringsgrunn: IKodeverkVerdi | null;
  velgOmgjoeringsgrunn: (omgjoeringsgrunn: IKodeverkVerdi | null) => void;
}
export function Omgjoeringsgrunn({
  gyldigeOmgjoeringsgrunner,
  omgjoeringsgrunn,
  velgOmgjoeringsgrunn,
}: OmgjoeringsgrunnProps) {
  return (
    <Select
      label="Omgjøringsgrunn:"
      bredde="l"
      value={gyldigeOmgjoeringsgrunner.findIndex(
        (omgjoeringObj: IKodeverkVerdi) => omgjoeringObj.id === omgjoeringsgrunn?.id
      )}
      onChange={(e) => {
        if (!e.target.value) {
          velgOmgjoeringsgrunn(null);
        } else {
          const valgtOmgjoeringsgrunn = gyldigeOmgjoeringsgrunner[e.target.value];
          velgOmgjoeringsgrunn(valgtOmgjoeringsgrunn);
        }
      }}
    >
      <option value={undefined}>Velg omgjøringsgrunn</option>
      {gyldigeOmgjoeringsgrunner.map((omgjoeringObj, index) => {
        return (
          <option key={index} value={index}>
            {omgjoeringObj.navn}
          </option>
        );
      })}
    </Select>
  );
}
