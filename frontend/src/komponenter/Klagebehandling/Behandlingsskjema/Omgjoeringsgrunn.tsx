import { Select } from "nav-frontend-skjema";
import React from "react";
import { IKodeverkVerdi } from "../../../tilstand/moduler/oppgave";

interface OmgjoeringsgrunnProps {
  gyldigeOmgjoeringsgrunner: IKodeverkVerdi[];
  omgjoeringsgrunn: IKodeverkVerdi | null;
  velgOmgjoeringsgrunn: (omgjoeringsgrunn: IKodeverkVerdi) => void;
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
        velgOmgjoeringsgrunn(gyldigeOmgjoeringsgrunner[e.target.value]);
      }}
    >
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
