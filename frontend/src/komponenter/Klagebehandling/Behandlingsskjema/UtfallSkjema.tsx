import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Row } from "../../../styled-components/Row";
import {
  GrunnerPerUtfall,
  IKlage,
  lasterDokumenter,
} from "../../../tilstand/moduler/klagebehandling";
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
  settKlageInfo,
} from "../../../tilstand/moduler/behandlingsskjema";
import { BasertPaaHjemmel } from "./BasertPaaLovhjemmel";
import LagringsIndikator from "./AutolagreElement";
import { InternVurdering } from "./InternVurdering";
import { velgBehandlingsskjema } from "../../../tilstand/moduler/behandlingsskjema.velgere";
import debounce from "lodash.debounce";
import { Textarea } from "nav-frontend-skjema";

export function UtfallSkjema() {
  const kodeverk = useSelector(velgKodeverk);
  const klage: IKlage = useSelector(velgKlage);
  const behandlingsskjema = useSelector(velgBehandlingsskjema);
  const dispatch = useDispatch();

  const [utfall, settUtfall] = useState<IKodeverkVerdi | null>(
    faaUtfallObjekt(klage.vedtak[0].utfall) ?? null
  );
  const [gyldigeOmgjoeringsgrunner, settGyldigeOmgjoeringsgrunner] = useState<IKodeverkVerdi[]>(
    faaOmgjoeringsgrunner(utfall)
  );
  const [omgjoeringsgrunn, settOmgjoeringsgrunn] = useState<IKodeverkVerdi | null>(
    faaOmgjoeringsgrunnObjekt(klage.vedtak[0].grunn) ?? gyldigeOmgjoeringsgrunner[0]
  );

  const [valgteHjemler, settValgteHjemler] = useState<Filter[]>(
    klage.hjemler.map((hjemmel) => faaHjemmelFilter("" + hjemmel))
  );

  const [internVurdering, settInternVurdering] = useState<string>(klage.internVurdering ?? "");

  function faaHjemmelFilter(hjemmelkode: string): Filter {
    const hjemmelObj = kodeverk.hjemmel.find(
      (hjemmel: IKodeverkVerdi) => hjemmel.id === hjemmelkode
    );
    return { label: hjemmelObj!.beskrivelse, value: hjemmelObj!.id };
  }

  function faaOmgjoeringsgrunner(utfall: IKodeverkVerdi | null): IKodeverkVerdi[] {
    if (!utfall) {
      return [];
    }
    return kodeverk.grunnerPerUtfall.find((obj: GrunnerPerUtfall) => obj.utfallId == utfall.id)!
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

  const velgUtfall = (utfall: IKodeverkVerdi | null) => {
    settUtfall(utfall);
    dispatch(
      lagreUtfall({
        klagebehandlingid: klage.id,
        klagebehandlingVersjon: klage.klagebehandlingVersjon,
        vedtakid: klage.vedtak[0].id,
        utfall: utfall ? utfall.id : null,
      })
    );
    const omgjoeringsgrunner = faaOmgjoeringsgrunner(utfall);
    settGyldigeOmgjoeringsgrunner(omgjoeringsgrunner);
  };

  function velgOmgjoeringsgrunn(omgjoeringsgrunn: IKodeverkVerdi | null) {
    settOmgjoeringsgrunn(omgjoeringsgrunn);
    dispatch(
      lagreOmgjoeringsgrunn({
        klagebehandlingid: klage.id,
        klagebehandlingVersjon: klage.klagebehandlingVersjon,
        vedtakid: klage.vedtak[0].id,
        omgjoeringsgrunn: omgjoeringsgrunn ? omgjoeringsgrunn.id : null,
      })
    );
  }

  function velgHjemler(hjemler: Filter[]) {
    settValgteHjemler(hjemler);
    dispatch(
      lagreHjemler({
        klagebehandlingid: klage.id,
        vedtakid: klage.vedtak[0].id,
        klagebehandlingVersjon: klage.klagebehandlingVersjon,
        hjemler: hjemler.map((f) => f.value as string),
      })
    );
  }

  function faaUtfallObjekt(utfallnavn: string | null): IKodeverkVerdi | null {
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

  useEffect(() => {
    if (behandlingsskjema.lasterKlage) {
      let valgteHjemlerVerdier = valgteHjemler.map((f) => f.value as string);
      dispatch(
        settKlageInfo({
          utfall: utfall ? utfall.id : null,
          grunn: omgjoeringsgrunn ? omgjoeringsgrunn.id : null,
          hjemler: valgteHjemlerVerdier,
          internVurdering: internVurdering,
        })
      );
    }
  }, []);

  let { lasterKlage } = behandlingsskjema;

  useEffect(() => {
    if (behandlingsskjema.lasterKlage) {
      return;
    }
    let valgteHjemlerVerdier = valgteHjemler.map((h) => h.value);

    if (utfall && behandlingsskjema.utfall !== utfall.id) {
      velgUtfall(utfall);
    }
    if (omgjoeringsgrunn && behandlingsskjema.grunn !== omgjoeringsgrunn.id) {
      velgOmgjoeringsgrunn(omgjoeringsgrunn);
    }
    if (
      behandlingsskjema.hjemler.slice().sort().toString() !== valgteHjemlerVerdier.sort().toString()
    ) {
      velgHjemler(valgteHjemler);
    }
  }, [utfall, omgjoeringsgrunn, valgteHjemler, lasterKlage]);

  let isFirstRunInternVurdering = useRef(true);
  useEffect(() => {
    if (isFirstRunInternVurdering.current) {
      isFirstRunInternVurdering.current = false;
      return;
    }
    if (!klage.klageLastet || behandlingsskjema.lasterKlage) {
      return;
    }
    const timeout = setTimeout(() => {
      dispatch(
        lagreInternVurdering({
          klagebehandlingid: klage.id,
          internVurdering: internVurdering,
          klagebehandlingVersjon: klage.klagebehandlingVersjon,
        })
      );
    }, 1500);
    return () => clearTimeout(timeout);
  }, [internVurdering]);

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
        <InternVurdering
          internVurdering={internVurdering}
          settInternVurdering={settInternVurdering}
        />
      </Row>
      <Row>
        <LagringsIndikator autosaveStatus={behandlingsskjema.lagrerVurdering} />
      </Row>
    </div>
  );
}
