import { Select, Textarea } from "nav-frontend-skjema";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { HeaderRow, Row } from "../../../styled-components/Row";
import { GrunnerPerUtfall, IKlage } from "../../../tilstand/moduler/klagebehandling";
import { velgKlage } from "../../../tilstand/moduler/klagebehandlinger.velgere";
import { IKodeverkVerdi } from "../../../tilstand/moduler/oppgave";
import { Resultat } from "./Resultat";
import { OmgjoeringsgrunnValg } from "./UtfallEnums";

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
      bredde="l"
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

export function UtfallSkjema({ kodeverk }: { kodeverk: any }) {
  function faaOmgjoeringsgrunner(utfall: IKodeverkVerdi): IKodeverkVerdi[] {
    return kodeverk.grunnerPerUtfall.find((obj: GrunnerPerUtfall) => obj.utfallId == utfall.id)
      .grunner;
  }

  function visOmgjoeringsgrunner(): boolean {
    return omgjoeringsgrunner.length > 0;
  }

  function velgUtfall(utfall: IKodeverkVerdi) {
    settUtfall(utfall);
    const omgjoeringsgrunner = faaOmgjoeringsgrunner(utfall);
    settOmgjoeringsgrunner(omgjoeringsgrunner);
  }

  const [utfall, settUtfall] = useState<IKodeverkVerdi>(kodeverk.utfall[1]);
  const [omgjoeringsgrunner, settOmgjoeringsgrunner] = useState<IKodeverkVerdi[]>(
    faaOmgjoeringsgrunner(utfall)
  );

  return (
    <div className={"detaljer"}>
      <HeaderRow>
        <Resultat utfallAlternativer={kodeverk.utfall} utfall={utfall} velgUtfall={velgUtfall} />
      </HeaderRow>
      <Row>
        <BasertPaaHjemmel />
      </Row>
      {visOmgjoeringsgrunner() && (
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
