import { Select } from "nav-frontend-skjema";
import React from "react";
import { IKodeverkVerdi } from "../../../tilstand/moduler/oppgave";

interface ResultatProps {
  utfallAlternativer: IKodeverkVerdi[];
  utfall: IKodeverkVerdi;
  velgUtfall: (utfall: IKodeverkVerdi) => void;
}
export function Utfall({ utfallAlternativer, utfall, velgUtfall }: ResultatProps) {
  return (
    <Select
      label="Utfall/resultat:"
      bredde="m"
      value={"" + utfallAlternativer.findIndex((obj: IKodeverkVerdi) => obj.id === utfall.id)}
      onChange={(e) => {
        const valgtUtfall = utfallAlternativer[e.target.value];
        velgUtfall(valgtUtfall);
      }}
    >
      {utfallAlternativer.map((utfallObj, index) => {
        return (
          <option key={index} value={index}>
            {utfallObj.navn}
          </option>
        );
      })}
    </Select>
  );
}
