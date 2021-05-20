import { Select } from "nav-frontend-skjema";
import React from "react";
import { IKodeverkVerdi } from "../../../tilstand/moduler/oppgave";

interface UtfallProps {
  utfallAlternativer: IKodeverkVerdi[];
  utfall: IKodeverkVerdi | null;
  velgUtfall: (utfall: IKodeverkVerdi | null) => void;
}
export function Utfall({ utfallAlternativer, utfall, velgUtfall }: UtfallProps) {
  return (
    <Select
      label="Utfall/resultat:"
      bredde="m"
      value={
        utfall
          ? "" + utfallAlternativer.findIndex((obj: IKodeverkVerdi) => obj.id === utfall.id)
          : undefined
      }
      onChange={(e) => {
        if (!e.target.value) {
          velgUtfall(null);
        } else {
          const valgtUtfall = utfallAlternativer[e.target.value];
          velgUtfall(valgtUtfall);
        }
      }}
    >
      <option value={undefined}>Velg utfall</option>
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
