import { Select, Textarea } from "nav-frontend-skjema";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Row } from "../../../styled-components/Row";
import { IKlage } from "../../../tilstand/moduler/klagebehandling";
import { velgKlage } from "../../../tilstand/moduler/klagebehandlinger.velgere";
import { Utfall, OmgjoeringsgrunnValg, utfallSomKreverOmgjoering } from "./UtfallEnums";

interface ResultatProps {
  utfall: Utfall;
  settUtfall: (utfall: Utfall) => void;
}
function Resultat({ utfall, settUtfall }: ResultatProps) {
  return (
    <Select
      label="Utfall/resultat:"
      bredde="m"
      value={utfall}
      onChange={(e) => {
        settUtfall(e.target.value as Utfall);
      }}
    >
      {Object.keys(Utfall).map((utfallKey) => {
        return (
          <option key={utfallKey} value={utfallKey}>
            {Utfall[utfallKey]}
          </option>
        );
      })}
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
      {Object.keys(OmgjoeringsgrunnValg).map((omgjoeringKey) => {
        return (
          <option key={omgjoeringKey} value={omgjoeringKey}>
            {OmgjoeringsgrunnValg[omgjoeringKey]}
          </option>
        );
      })}
    </Select>
  );
}

function Vurdering() {
  const klage: IKlage = useSelector(velgKlage);
  const [vurdering, settVurdering] = useState<string>(klage.internVurdering ?? "");
  return (
    <Textarea
      id="vurdering"
      value={vurdering}
      label="Vurdering av kvalitet for intern bruk:"
      maxLength={0}
      onChange={(e) => {
        settVurdering(e.target.value);
      }}
      style={{
        minHeight: "80px",
      }}
    />
  );
}

export function UtfallSkjema() {
  const [utfall, settUtfall] = useState<Utfall>(Utfall.MEDHOLD);
  const [visOmgjoeringsgrunn, settVisOmgjoeringsgrunn] = useState<boolean>();

  useEffect(() => {
    settVisOmgjoeringsgrunn(utfallSomKreverOmgjoering.includes(utfall));
  }, [utfall]);

  return (
    <div className={"detaljer"}>
      <Row>
        <Resultat utfall={utfall} settUtfall={settUtfall} />
      </Row>
      <Row>
        <BasertPaaHjemmel />
      </Row>
      {visOmgjoeringsgrunn && (
        <Row>
          <Omgjoeringsgrunn />
        </Row>
      )}
      <Row>
        <Vurdering />
      </Row>
    </div>
  );
}
