import { Select, Textarea } from "nav-frontend-skjema";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { HeaderRow, Row } from "../../../styled-components/Row";
import { GrunnerPerUtfall, IKlage } from "../../../tilstand/moduler/klagebehandling";
import { velgKlage } from "../../../tilstand/moduler/klagebehandlinger.velgere";
import { IKodeverkVerdi } from "../../../tilstand/moduler/oppgave";
import { Omgjoeringsgrunn } from "./Omgjoeringsgrunn";
import { Utfall } from "./Utfall";
import { velgKodeverk } from "../../../tilstand/moduler/oppgave.velgere";
import { lagreInternVurdering, lagreUtfall } from "../../../tilstand/moduler/behandlingsskjema";

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

interface InterfaceInterVurderingProps {
  internVurdering: string;
  endreInternVurdering: (internVurdering: string) => void;
}

function Vurdering({ internVurdering, endreInternVurdering }: InterfaceInterVurderingProps) {
  return (
    <Textarea
      id="internVurdering"
      value={internVurdering}
      label="Vurdering av kvalitet for intern bruk:"
      maxLength={0}
      onChange={(e) => {
        endreInternVurdering(e.target.value);
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
  const dispatch = useDispatch();

  const [utfall, settUtfall] = useState<IKodeverkVerdi>(
    faaUtfalllObjekt(klage.vedtak[0].utfall) ?? kodeverk.utfall[0]
  );
  const [gyldigeOmgjoeringsgrunner, settGyldigeOmgjoeringsgrunner] = useState<IKodeverkVerdi[]>(
    faaOmgjoeringsgrunner(utfall)
  );
  const [omgjoeringsgrunn, settOmgjoeringsgrunn] = useState<IKodeverkVerdi | null>(
    faaOmgjoeringsgrunnObjekt(klage.vedtak[0].grunn) ?? gyldigeOmgjoeringsgrunner[0]
  );
  const [internVurdering, settInternVurdering] = useState<string>(klage.internVurdering ?? "");

  function faaOmgjoeringsgrunner(utfall: IKodeverkVerdi): IKodeverkVerdi[] {
    return kodeverk.grunnerPerUtfall.find((obj: GrunnerPerUtfall) => obj.utfallId == utfall.id)
      .grunner;
  }

  function visOmgjoeringsgrunner(): boolean {
    return gyldigeOmgjoeringsgrunner.length > 0;
  }

  function velgUtfall(utfall: IKodeverkVerdi) {
    settUtfall(utfall);
    dispatch(
      lagreUtfall({
        klagebehandlingid: klage.id,
        vedtakid: klage.vedtak[0].id,
        utfall: utfall.navn,
      })
    );
    const omgjoeringsgrunner = faaOmgjoeringsgrunner(utfall);
    settGyldigeOmgjoeringsgrunner(omgjoeringsgrunner);
  }

  function velgOmgjoeringsgrunn(omgjoeringsgrunn: IKodeverkVerdi) {
    settOmgjoeringsgrunn(omgjoeringsgrunn);
  }

  function endreInternVurdering(internVurdering: string) {
    settInternVurdering(internVurdering);
    dispatch(
      lagreInternVurdering({
        klagebehandlingid: klage.id,
        internVurdering: internVurdering,
      })
    );
    const omgjoeringsgrunner = faaOmgjoeringsgrunner(utfall);
    settGyldigeOmgjoeringsgrunner(omgjoeringsgrunner);
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
        <Vurdering internVurdering={internVurdering} endreInternVurdering={endreInternVurdering} />
      </Row>
    </div>
  );
}
