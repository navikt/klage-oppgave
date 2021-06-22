import EtikettBase from "nav-frontend-etiketter";
import NavFrontendSpinner from "nav-frontend-spinner";
import React, { useMemo } from "react";
import styled from "styled-components";
import { Row } from "../../../../styled-components/Row";
import { useAppSelector } from "../../../../tilstand/konfigurerTilstand";
import { IKlagebehandling } from "../../../../tilstand/moduler/klagebehandling/stateTypes";
import { IKodeverkVerdi } from "../../../../tilstand/moduler/kodeverk";
import { velgKodeverk } from "../../../../tilstand/moduler/kodeverk.velgere";
import { isNotUndefined } from "../../utils/helpers";
import { InfofeltStatisk } from "../InfofeltStatisk";

interface ReadOnlyKvalitetsskjemaProps {
  klagebehandling: IKlagebehandling;
}

export const ReadOnlyKvalitetsskjema = ({ klagebehandling }: ReadOnlyKvalitetsskjemaProps) => {
  const { kodeverk, lasterKodeverk } = useAppSelector(velgKodeverk);

  const {
    vedtak: [vedtak],
  } = klagebehandling;

  const utfall = useMemo(
    () => kodeverk.utfall.find(({ id }) => id === vedtak.utfall),
    [kodeverk.utfall, vedtak]
  );

  const hjemler = useMemo<IKodeverkVerdi[]>(() => {
    if (lasterKodeverk) {
      return [];
    }
    return vedtak.hjemler
      .map((kode) => kodeverk.hjemmel.find(({ id }) => id === kode))
      .filter(isNotUndefined);
  }, [vedtak.hjemler, lasterKodeverk, kodeverk.hjemmel]);

  const gyldigeOmgjoeringsgrunner = useMemo<IKodeverkVerdi[]>(() => {
    if (lasterKodeverk || utfall === undefined) {
      return [];
    }
    return kodeverk.grunnerPerUtfall.find(({ utfallId }) => utfallId == utfall.id)?.grunner ?? [];
  }, [utfall, lasterKodeverk, kodeverk.grunnerPerUtfall]);

  const visOmgjoeringsgrunner = useMemo<boolean>(
    () => gyldigeOmgjoeringsgrunner.length > 0,
    [gyldigeOmgjoeringsgrunner.length]
  );

  const omgjoeringsgrunn = useMemo<IKodeverkVerdi | null>(() => {
    if (vedtak.grunn === null || !visOmgjoeringsgrunner) {
      return null;
    }
    return gyldigeOmgjoeringsgrunner.find(({ id }) => id === vedtak.grunn) ?? null;
  }, [visOmgjoeringsgrunner, vedtak.grunn, gyldigeOmgjoeringsgrunner]);

  if (lasterKodeverk) {
    return <NavFrontendSpinner />;
  }

  return (
    <>
      <Row>
        <InfofeltStatisk header="Utfall/resultat" info={utfall?.navn ?? "Ingen"} />
      </Row>
      <Row>
        <b>Utfallet er basert på lovhjemmel:</b>
        {hjemler.length > 0 ? (
          <Etikettliste elementer={hjemler.map(({ navn }) => navn)} />
        ) : (
          <p>Ingen</p>
        )}
      </Row>
      <Omgjoeringsgrunn vis={visOmgjoeringsgrunner} grunn={omgjoeringsgrunn} />
      <Row>
        <InfofeltStatisk
          header="Vurdering av kvalitet for intern bruk"
          info={klagebehandling.internVurdering}
        />
      </Row>
    </>
  );
};

interface OmgjoeringsgrunnProps {
  grunn: IKodeverkVerdi | null;
  vis: boolean;
}

const Omgjoeringsgrunn = ({ grunn, vis }: OmgjoeringsgrunnProps) => {
  if (!vis) {
    return null;
  }
  const info = grunn === null ? "Ingen" : grunn.navn;
  return (
    <Row>
      <InfofeltStatisk header="Omgjøringsgrunn" info={info} />
    </Row>
  );
};

const StyledEtikettliste = styled.ul`
  padding: 0;
  margin: 0;
  margin-top: 0.25em;
`;

interface EtikettlisteProps {
  elementer: string[];
  type?: "info" | "suksess" | "advarsel" | "fokus";
}

const Etikettliste = ({ elementer, type = "info" }: EtikettlisteProps) => (
  <StyledEtikettliste>
    {elementer.sort().map((e) => (
      <EtikettBase key={e} type={type}>
        {e}
      </EtikettBase>
    ))}
  </StyledEtikettliste>
);
