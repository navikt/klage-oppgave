import React, { useEffect, useMemo, useState } from "react";
import { Row } from "../../../../styled-components/Row";
import { Omgjoeringsgrunn } from "./Omgjoeringsgrunn";
import { Utfall } from "./Utfall";
import { BasertPaaHjemmel } from "./BasertPaaLovhjemmel";
import { InternVurdering } from "./InternVurdering";
import { velgKodeverk } from "../../../../tilstand/moduler/kodeverk.velgere";
import { IKodeverkVerdi } from "../../../../tilstand/moduler/kodeverk";
import { useAppDispatch, useAppSelector } from "../../../../tilstand/konfigurerTilstand";
import { IKlagebehandling } from "../../../../tilstand/moduler/klagebehandling/stateTypes";
import { OPPDATER_KLAGEBEHANDLING } from "../../../../tilstand/moduler/klagebehandling/state";
import NavFrontendSpinner from "nav-frontend-spinner";
import { arrayEquals, isNotUndefined } from "../../utils/helpers";

interface KvalitetsskjemaProps {
  klagebehandling: IKlagebehandling;
}

export const Kvalitetsskjema = ({ klagebehandling }: KvalitetsskjemaProps) => {
  const dispatch = useAppDispatch();
  const { kodeverk, lasterKodeverk } = useAppSelector(velgKodeverk);

  const {
    id,
    internVurdering,
    tema,
    vedtak: [vedtak],
  } = klagebehandling;

  const utfallObjekt = useMemo<IKodeverkVerdi | null>(
    () => (lasterKodeverk ? null : kodeverk.utfall.find(({ id }) => id === vedtak.utfall) ?? null),
    [vedtak.utfall, kodeverk.utfall, lasterKodeverk, kodeverk.utfall.length]
  );

  const gyldigeOmgjoeringsgrunner = useMemo<IKodeverkVerdi[]>(() => {
    if (lasterKodeverk || !utfallObjekt) {
      return [];
    }
    return (
      kodeverk.grunnerPerUtfall.find(({ utfallId }) => utfallId == utfallObjekt.id)?.grunner ?? []
    );
  }, [utfallObjekt, lasterKodeverk, kodeverk.grunnerPerUtfall]);

  const omgjoeringsgrunnObjekt = useMemo<IKodeverkVerdi | null>(() => {
    if (vedtak.grunn === null) {
      return null;
    }
    return gyldigeOmgjoeringsgrunner.find(({ id }) => id === vedtak.grunn) ?? null;
  }, [vedtak.grunn, gyldigeOmgjoeringsgrunner]);

  const valgteHjemler = useMemo<IKodeverkVerdi[]>(() => {
    if (lasterKodeverk) {
      return [];
    }
    return vedtak.hjemler
      .map((kode) => kodeverk.hjemmel.find(({ id }) => id === kode))
      .filter(isNotUndefined);
  }, [vedtak.hjemler, lasterKodeverk, kodeverk.hjemmel]);

  const gyldigeHjemler = useMemo(() => {
    if (lasterKodeverk) {
      return [];
    }
    return kodeverk.hjemlerPerTema.find(({ temaId }) => temaId === tema)?.hjemler || [];
  }, [tema, lasterKodeverk, kodeverk.hjemlerPerTema]);

  const visOmgjoeringsgrunner = useMemo<boolean>(
    () => gyldigeOmgjoeringsgrunner.length > 0,
    [gyldigeOmgjoeringsgrunner.length]
  );

  const [uiUtfall, settUiUtfall] = useState<IKodeverkVerdi | null>(utfallObjekt);
  const [uiOmgjoeringsgrunn, settUiOmgjoeringsgrunn] =
    useState<IKodeverkVerdi | null>(omgjoeringsgrunnObjekt);
  const [uiValgteHjemler, settUiValgteHjemler] = useState<IKodeverkVerdi[]>(valgteHjemler);
  const [uiInternVurdering, settUiInternVurdering] = useState<string>(internVurdering);

  useEffect(() => {
    const grunn = uiOmgjoeringsgrunn?.id ?? null;
    const hjemler = uiValgteHjemler.map(({ id }) => id).filter(isNotUndefined);
    const utfall = uiUtfall?.id ?? null;

    if (
      uiInternVurdering === internVurdering &&
      grunn === vedtak.grunn &&
      arrayEquals(hjemler, vedtak.hjemler) &&
      utfall === vedtak.utfall
    ) {
      return;
    }

    dispatch(
      OPPDATER_KLAGEBEHANDLING({
        internVurdering: uiInternVurdering,
        id,
        vedtak: [
          {
            ...vedtak,
            grunn,
            hjemler,
            utfall,
          },
        ],
      })
    );
  }, [id, uiUtfall?.id, uiInternVurdering, uiOmgjoeringsgrunn?.id, uiValgteHjemler]);

  if (lasterKodeverk) {
    return (
      <div className={"detaljer"}>
        <NavFrontendSpinner />
      </div>
    );
  }

  return (
    <div className={"detaljer"}>
      <Row>
        <Utfall
          utfallAlternativer={kodeverk.utfall}
          defaultUtfall={utfallObjekt}
          onChange={settUiUtfall}
        />
      </Row>
      <Row>
        <BasertPaaHjemmel
          gyldigeHjemler={gyldigeHjemler}
          defaultValue={valgteHjemler}
          onChange={settUiValgteHjemler}
        />
      </Row>
      {visOmgjoeringsgrunner && (
        <Row>
          <Omgjoeringsgrunn
            gyldigeOmgjoeringsgrunner={gyldigeOmgjoeringsgrunner}
            defaultValue={omgjoeringsgrunnObjekt}
            onChange={settUiOmgjoeringsgrunn}
          />
        </Row>
      )}
      <Row>
        <InternVurdering defaultValue={internVurdering} onChange={settUiInternVurdering} />
      </Row>
    </div>
  );
};
