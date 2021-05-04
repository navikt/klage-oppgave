import { Select, Textarea } from "nav-frontend-skjema";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { HeaderRow, Row } from "../../../styled-components/Row";
import { IKlage } from "../../../tilstand/moduler/klagebehandling";
import { velgKlage } from "../../../tilstand/moduler/klagebehandlinger.velgere";
import { Utfall, OmgjoeringsgrunnValg, utfallSomKreverOmgjoeringsgrunn } from "./UtfallEnums";
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
          <option key={utfallKey} value={Utfall[utfallKey]}>
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
      <option value="todo">TODO</option>
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

function kreverOmgjoeringsgrunn(utfall: Utfall): boolean {
  return utfallSomKreverOmgjoeringsgrunn.includes(utfall);
}

export function UtfallSkjema() {
  const [utfall, settUtfall] = useState<Utfall>(Utfall.MEDHOLD);
  const [visOmgjoeringsgrunn, settVisOmgjoeringsgrunn] = useState<boolean>(
    kreverOmgjoeringsgrunn(utfall)
  );

  useEffect(() => {
    settVisOmgjoeringsgrunn(utfallSomKreverOmgjoeringsgrunn.includes(utfall));
  }, [utfall]);

  return (
    <div className={"detaljer"}>
      <HeaderRow>
        <Resultat utfall={utfall} settUtfall={settUtfall} />
      </HeaderRow>
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
