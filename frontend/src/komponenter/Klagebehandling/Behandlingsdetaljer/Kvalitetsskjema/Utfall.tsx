import { Select } from "nav-frontend-skjema";
import React, { useState } from "react";
import { IKodeverkVerdi } from "../../../../tilstand/moduler/kodeverk";
import { useKanEndre } from "../../utils/hooks";

interface UtfallProps {
  utfallAlternativer: IKodeverkVerdi[];
  defaultUtfall: IKodeverkVerdi | null;
  onChange: (utfall: IKodeverkVerdi | null) => void;
}
export const Utfall = ({ utfallAlternativer, defaultUtfall, onChange }: UtfallProps) => {
  const [utfall, settUtfall] = useState<IKodeverkVerdi | null>(defaultUtfall);
  const kanEndre = useKanEndre();

  return (
    <Select
      disabled={!kanEndre}
      label="Utfall/resultat:"
      bredde="m"
      value={utfall?.id}
      onChange={(e) => {
        if (!e.target.value) {
          settUtfall(null);
          onChange(null);
        } else {
          const valgtUtfall = utfallAlternativer.find(({ id }) => id === e.target.value) ?? null;
          settUtfall(valgtUtfall);
          onChange(valgtUtfall);
        }
      }}
    >
      <option value={undefined}>Velg utfall</option>
      {utfallAlternativer.map(({ navn, id }) => {
        return (
          <option key={id} value={id}>
            {navn}
          </option>
        );
      })}
    </Select>
  );
};
