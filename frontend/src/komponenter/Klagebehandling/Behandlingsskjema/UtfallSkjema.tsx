import { Select } from "nav-frontend-skjema";
import React, { useState } from "react";
import { Row } from "../../../styled-components/Row";
import { Utfall, OmgjoeringsgrunnValg } from "./UtfallEnums";

interface ResultatProps {
  utfall: string;
  settUtfall: (utfall: string) => void;
}
function Resultat({ utfall, settUtfall }: ResultatProps) {
  return (
    <Select
      label="Utfall/resultat:"
      bredde="m"
      value={utfall}
      onChange={(e) => {
        settUtfall(e.target.value);
      }}
    >
      <option value={Utfall.MEDHOLD}>{Utfall.MEDHOLD}</option>
      <option value={Utfall.TRUKKET}>{Utfall.TRUKKET}</option>
      <option value={Utfall.RETUR}>{Utfall.RETUR}</option>
      <option value={Utfall.OPPHEVET}>{Utfall.OPPHEVET}</option>
      <option value={Utfall.DELVIS_MEDHOLD}>{Utfall.DELVIS_MEDHOLD}</option>
      <option value={Utfall.OPPRETTHOLD}>{Utfall.OPPRETTHOLD}</option>
      <option value={Utfall.UGUNST}>{Utfall.UGUNST}</option>
      <option value={Utfall.AVVIST}>{Utfall.AVVIST}</option>
    </Select>
  );
}

function BasertPaaHjemmel() {
  const [hjemler, settHjemler] = useState<string>();

  return (
    <Select
      label="Utfallet er basert på lovhjemmel:"
      bredde="l"
      value={hjemler}
      onChange={(e) => {
        settHjemler(e.target.value);
      }}
    >
      <option value="medhold">Medhold</option>
      <option value="trukket">Trukket</option>
      <option value="retur">Retur</option>
      <option value="opphevet">Opphevet</option>
      <option value="delvisMehold">Delvis Mehold</option>
      <option value="oppretthold">Oppretthold</option>
      <option value="ugunst">Ugunst (Ugyldig)</option>
      <option value="avvist">Avvist</option>
    </Select>
  );
}

function Omgjoeringsgrunn() {
  const [omgjoeringsgrunn, settOmgjoeringsgrunn] = useState<string>(
    OmgjoeringsgrunnValg.MANGELFULL_UTREDNING
  );
  return (
    <Select
      label="Omgjøringsgrunn:"
      bredde="m"
      value={omgjoeringsgrunn}
      onChange={(e) => {
        settOmgjoeringsgrunn(e.target.value);
      }}
    >
      <option value="medhold">Medhold</option>
      <option value="trukket">Trukket</option>
      <option value="retur">Retur</option>
      <option value="opphevet">Opphevet</option>
      <option value="delvisMehold">Delvis Mehold</option>
      <option value="oppretthold">Oppretthold</option>
      <option value="ugunst">Ugunst (Ugyldig)</option>
      <option value="avvist">Avvist</option>
    </Select>
  );
}

function Vurdering() {
  const [vurdering, settVurdering] = useState<string>();
  return (
    <Select
      label="Utfall/resultat:"
      bredde="m"
      value={vurdering}
      onChange={(e) => {
        settVurdering(e.target.value);
      }}
    >
      <option value="medhold">Medhold</option>
      <option value="trukket">Trukket</option>
      <option value="retur">Retur</option>
      <option value="opphevet">Opphevet</option>
      <option value="delvisMehold">Delvis Mehold</option>
      <option value="oppretthold">Oppretthold</option>
      <option value="ugunst">Ugunst (Ugyldig)</option>
      <option value="avvist">Avvist</option>
    </Select>
  );
}

export function UtfallSkjema() {
  const [utfall, settUtfall] = useState<string>(Utfall.MEDHOLD);

  return (
    <div className={"detaljer"}>
      <Row>
        <Resultat utfall={utfall} settUtfall={settUtfall} />
      </Row>
      <Row>
        <BasertPaaHjemmel />
      </Row>
    </div>
  );
}
