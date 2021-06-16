import { Select } from "nav-frontend-skjema";
import React, { useState } from "react";
import { IKodeverkVerdi } from "../../../../tilstand/moduler/kodeverk";
import { useKanEndre } from "../../utils/hooks";

interface OmgjoeringsgrunnProps {
  gyldigeOmgjoeringsgrunner: IKodeverkVerdi[];
  defaultValue: IKodeverkVerdi | null;
  onChange: (omgjoeringsgrunn: IKodeverkVerdi | null) => void;
}
export const Omgjoeringsgrunn = ({
  gyldigeOmgjoeringsgrunner,
  defaultValue,
  onChange,
}: OmgjoeringsgrunnProps) => {
  const [omgjoeringsgrunn, settOmgjoeringsgrunn] = useState<IKodeverkVerdi | null>(defaultValue);
  const kanEndre = useKanEndre();

  return (
    <Select
      disabled={!kanEndre}
      label="Omgjøringsgrunn:"
      bredde="l"
      value={omgjoeringsgrunn?.id}
      onChange={(e) => {
        if (!e.target.value) {
          onChange(null);
          settOmgjoeringsgrunn(null);
        } else {
          const valgtOmgjoeringsgrunn =
            gyldigeOmgjoeringsgrunner.find(({ id }) => e.target.value === id) ?? null;
          onChange(valgtOmgjoeringsgrunn);
          settOmgjoeringsgrunn(valgtOmgjoeringsgrunn);
        }
      }}
    >
      <option value={undefined}>Velg omgjøringsgrunn</option>
      {gyldigeOmgjoeringsgrunner.map(({ navn, id }) => {
        return (
          <option key={id} value={id}>
            {navn}
          </option>
        );
      })}
    </Select>
  );
};
