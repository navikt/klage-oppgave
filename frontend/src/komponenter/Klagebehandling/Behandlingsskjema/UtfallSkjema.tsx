import { Textarea } from "nav-frontend-skjema";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { HeaderRow, Row } from "../../../styled-components/Row";
import { GrunnerPerUtfall, IKlage } from "../../../tilstand/moduler/klagebehandling";
import { velgKlage } from "../../../tilstand/moduler/klagebehandlinger.velgere";
import { Filter, IKodeverkVerdi } from "../../../tilstand/moduler/oppgave";
import { Omgjoeringsgrunn } from "./Omgjoeringsgrunn";
import { Utfall } from "./Utfall";
import { velgKodeverk } from "../../../tilstand/moduler/oppgave.velgere";
import {
  lagreHjemler,
  lagreInternVurdering,
  lagreOmgjoeringsgrunn,
  lagreUtfall,
} from "../../../tilstand/moduler/behandlingsskjema";
import { BasertPaaHjemmel } from "./BasertPaaLovhjemmel";

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

  const [utfall, settUtfall] = useState<IKodeverkVerdi | null>(
    faaUtfalllObjekt(klage.vedtak[0].utfall) ?? kodeverk.utfall[0]
  );
  const [gyldigeOmgjoeringsgrunner, settGyldigeOmgjoeringsgrunner] = useState<IKodeverkVerdi[]>(
    faaOmgjoeringsgrunner(utfall)
  );
  const [omgjoeringsgrunn, settOmgjoeringsgrunn] = useState<IKodeverkVerdi | null>(
    faaOmgjoeringsgrunnObjekt(klage.vedtak[0].grunn) ?? gyldigeOmgjoeringsgrunner[0]
  );
  const [internVurdering, settInternVurdering] = useState<string>(klage.internVurdering ?? "");

  const [valgteHjemler, settValgteHjemler] = useState<Filter[]>([]); // TODO: Hentes fra klage

  const [internVurdering, settInternVurdering] = useState<string>(klage.internVurdering ?? "");

  function faaOmgjoeringsgrunner(utfall: IKodeverkVerdi | null): IKodeverkVerdi[] {
    if (!utfall) {
      return [];
    }
    return kodeverk.grunnerPerUtfall.find((obj: GrunnerPerUtfall) => obj.utfallId == utfall.id)
      .grunner;
  }

  const gyldigeHjemler = faaGyldigeHjemler(klage.tema);

  function faaGyldigeHjemler(tema: string): Filter[] {
    let temahjemler: IKodeverkVerdi[] = [];
    let gyldigeHjemler: Filter[] = [];

    temahjemler =
      kodeverk.hjemlerPerTema.filter((_hjemler: any) => _hjemler.temaId === tema)[0]?.hjemler || [];

    temahjemler.forEach((hjemmel: IKodeverkVerdi) => {
      gyldigeHjemler.push({ label: hjemmel.beskrivelse, value: hjemmel.id.toString() });
    });
    return gyldigeHjemler;
  }

  function visOmgjoeringsgrunner(): boolean {
    return gyldigeOmgjoeringsgrunner.length > 0;
  }

  function velgUtfall(utfall: IKodeverkVerdi | null) {
    settUtfall(utfall);
    dispatch(
      lagreUtfall({
        klagebehandlingid: klage.id,
        vedtakid: klage.vedtak[0].id,
        utfall: utfall ? utfall.navn : null,
      })
    );
    const omgjoeringsgrunner = faaOmgjoeringsgrunner(utfall);
    settGyldigeOmgjoeringsgrunner(omgjoeringsgrunner);
  }

  function velgOmgjoeringsgrunn(omgjoeringsgrunn: IKodeverkVerdi | null) {
    settOmgjoeringsgrunn(omgjoeringsgrunn);
    dispatch(
      lagreOmgjoeringsgrunn({
        klagebehandlingid: klage.id,
        vedtakid: klage.vedtak[0].id,
        omgjoeringsgrunn: omgjoeringsgrunn ? omgjoeringsgrunn.navn : null,
      })
    );
  }

  function velgHjemler(hjemler: Filter[]) {
    settValgteHjemler(hjemler);
    dispatch(
      lagreHjemler({
        klagebehandlingid: klage.id,
        vedtakid: klage.vedtak[0].id,
        hjemler: hjemler.map((f) => f.value as string),
      })
    );
  }

  function endreInternVurdering(internVurdering: string) {
    settInternVurdering(internVurdering);
    dispatch(
      lagreInternVurdering({
        klagebehandlingid: klage.id,
        internVurdering: internVurdering,
      })
    );
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
    if (utfallnavn === null) {
      return null;
    }
    return kodeverk.utfall.find((obj: IKodeverkVerdi) => obj.navn === utfallnavn) ?? null;
  }

  function faaOmgjoeringsgrunnObjekt(omgjoeringnavn: string | null): IKodeverkVerdi | null {
    if (omgjoeringnavn === null) {
      return null;
    }
    return (
      gyldigeOmgjoeringsgrunner.find((obj: IKodeverkVerdi) => obj.navn === omgjoeringnavn) ?? null
    );
  }

  return (
    <div className={"detaljer"}>
      <Row>
        <Utfall utfallAlternativer={kodeverk.utfall} utfall={utfall} velgUtfall={velgUtfall} />
      </Row>
      <Row>
        <BasertPaaHjemmel
          gyldigeHjemler={gyldigeHjemler}
          valgteHjemler={valgteHjemler}
          velgHjemler={velgHjemler}
        />
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
