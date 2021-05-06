import { Select, Textarea } from "nav-frontend-skjema";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { HeaderRow, Row } from "../../../styled-components/Row";
import { GrunnerPerUtfall, IKlage } from "../../../tilstand/moduler/klagebehandling";
import { velgKlage } from "../../../tilstand/moduler/klagebehandlinger.velgere";
import { IKodeverkVerdi } from "../../../tilstand/moduler/oppgave";
import { Omgjoeringsgrunn } from "./Omgjoeringsgrunn";
import { Utfall } from "./Utfall";
import { velgKodeverk } from "../../../tilstand/moduler/oppgave.velgere";

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
  const kodeverk = useSelector(velgKodeverk);
  const klage: IKlage = useSelector(velgKlage);

  const [utfall, settUtfall] = useState<IKodeverkVerdi>(
    faaUtfalllObjekt(klage.vedtak[0].utfall) ?? kodeverk.utfall[0]
  );
  const [gyldigeOmgjoeringsgrunner, settGyldigeOmgjoeringsgrunner] = useState<IKodeverkVerdi[]>(
    faaOmgjoeringsgrunner(utfall)
  );
  const [omgjoeringsgrunn, settOmgjoeringsgrunn] = useState<IKodeverkVerdi | null>(
    faaOmgjoeringsgrunnObjekt(klage.vedtak[0].grunn) ?? gyldigeOmgjoeringsgrunner[0]
  );

  function faaOmgjoeringsgrunner(utfall: IKodeverkVerdi): IKodeverkVerdi[] {
    return kodeverk.grunnerPerUtfall.find((obj: GrunnerPerUtfall) => obj.utfallId == utfall.id)
      .grunner;
  }

  function visOmgjoeringsgrunner(): boolean {
    return gyldigeOmgjoeringsgrunner.length > 0;
  }

  function velgUtfall(utfall: IKodeverkVerdi) {
    settUtfall(utfall);
    const omgjoeringsgrunner = faaOmgjoeringsgrunner(utfall);
    settGyldigeOmgjoeringsgrunner(omgjoeringsgrunner);
  }

  function velgOmgjoeringsgrunn(omgjoeringsgrunn: IKodeverkVerdi) {
    settOmgjoeringsgrunn(omgjoeringsgrunn);
  }

  function faaUtfalllObjekt(utfallnavn: string | null): IKodeverkVerdi | null {
    if (!utfallnavn) {
      return null;
    }
    return kodeverk.utfall.find((obj: IKodeverkVerdi) => obj.navn === utfallnavn) ?? null;
  }

  function faaOmgjoeringsgrunnObjekt(omgjoeringnavn: string | null): IKodeverkVerdi | null {
    if (!omgjoeringnavn) {
      return null;
    }
    return (
      gyldigeOmgjoeringsgrunner.find((obj: IKodeverkVerdi) => obj.navn === omgjoeringnavn) ?? null
    );
  }

  return (
    <div className={"detaljer"}>
      <HeaderRow>
        <Utfall utfallAlternativer={kodeverk.utfall} utfall={utfall} velgUtfall={velgUtfall} />
      </HeaderRow>
      <Row>
        <BasertPaaHjemmel />
      </Row>
      {visOmgjoeringsgrunner() && (
        <Row>
          <Omgjoeringsgrunn
            gyldigeOmgjoeringsgrunner={gyldigeOmgjoeringsgrunner}
            omgjoeringsgrunn={omgjoeringsgrunn}
            velgOmgjoeringsgrunn={velgOmgjoeringsgrunn}
          />
        </Row>
      )}
      <Row>
        <Vurdering />
      </Row>
    </div>
  );
}
