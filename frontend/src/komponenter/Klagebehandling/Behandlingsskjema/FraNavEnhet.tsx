import { Select } from "nav-frontend-skjema";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { EnhetKey, FaaGyldigEnhet } from "../../../domene/enheter";
import { IKlage } from "../../../tilstand/moduler/klagebehandling";
import { velgKlage } from "../../../tilstand/moduler/klagebehandlinger.velgere";

export function FraNavEnhet() {
  const klage: IKlage = useSelector(velgKlage);
  const [fraNAVEnhet, settFraNAVEnhet] = useState<EnhetKey | null>(
    FaaGyldigEnhet(klage.fraNAVEnhet)
  );

  return (
    <Select
      label="Fra NAV-enhet:"
      bredde="l"
      value={fraNAVEnhet ?? undefined}
      onChange={(e) => {
        settFraNAVEnhet(FaaGyldigEnhet(e.target.value));
      }}
    >
      <option value="">Velg enhet</option>
      <option value="4403">4403 NAY Oslo</option>
      <option value="4404">4404 NAY Hamar</option>
      <option value="4405">4405 NAY Lillehammer</option>
      <option value="4407">4407 NAY Tønsberg</option>
      <option value="0104">0104 NAY Test</option>
    </Select>
  );
}
