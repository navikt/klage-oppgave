import React, { useMemo, useState } from "react";
import { Page } from "react-pdf";
import NavFrontendSpinner from "nav-frontend-spinner";
import { useAppSelector } from "../../../tilstand/konfigurerTilstand";
import { FilInfoBeholder } from "./styled-components/filinfo-beholder";
import { OpplastetFilNavnTittel } from "./styled-components/opplastet-filnavn-tittel";
import { OpplastetVedleggTittel } from "./styled-components/opplastet-vedlegg-tittel";
import { velgVedtak } from "../../../tilstand/moduler/vedtak.velgere";
import { velgMeg } from "../../../tilstand/moduler/meg.velgere";
import { IKlagebehandling } from "../../../tilstand/moduler/klagebehandling/stateTypes";
import { PDF } from "./styled-components/pdf";
import { isoDateTimeToPretty } from "../../../domene/datofunksjoner";

interface VisVedleggProps {
  klagebehandling: IKlagebehandling;
}

export const VisVedlegg = ({ klagebehandling }: VisVedleggProps) => {
  const { loading } = useAppSelector(velgVedtak);
  const { id } = useAppSelector(velgMeg);
  const {
    id: klagebehandlingId,
    avsluttetAvSaksbehandler,
    medunderskriverident,
    vedtak: [vedtak],
  } = klagebehandling;

  const kanSlettes = useMemo(
    // Om vedtaket er lastet, ikke avsluttet og du ikke er medunderskriver.
    () => !loading && avsluttetAvSaksbehandler === null && medunderskriverident !== id,
    [avsluttetAvSaksbehandler]
  );

  const { id: vedtakId, file } = vedtak;

  const vedleggLink = useMemo(
    () => `/api/klagebehandlinger/${klagebehandlingId}/vedtak/${vedtakId}/pdf`,
    [klagebehandlingId, vedtakId]
  );

  const [sider, settSider] = useState(0);

  const opplastetFormatert = useMemo(
    () => isoDateTimeToPretty(file?.opplastet ?? null),
    [file?.opplastet]
  );

  const sizeFormatert = useMemo(() => formatSize(file?.size ?? 0), [file?.size]);

  if (file === null) {
    return null;
  }

  return (
    <>
      <PDF
        file={vedleggLink}
        onLoadSuccess={({ numPages }) => settSider(numPages)}
        options={options}
        error={<span>Kunne ikke hente PDF</span>}
        loading={<NavFrontendSpinner />}
      >
        <a href={vedleggLink} title="Åpne PDF i ny fane." target="_blank">
          <Page pageNumber={1} width={263} />
        </a>
      </PDF>

      <FilInfoBeholder>
        <OpplastetVedleggTittel>VEDLEGG - OPPLASTET</OpplastetVedleggTittel>
        <OpplastetFilNavnTittel>Filnavn</OpplastetFilNavnTittel>
        <span>{file.name}</span>
        <div>Opplastet: {opplastetFormatert}</div>
        <div>Sider: {sider}</div>
        <div>Filstørrelse: {sizeFormatert}</div>
      </FilInfoBeholder>
    </>
  );
};

const options = {
  cMapUrl: "cmaps/",
  cMapPacked: true,
};

const formatSize = (bytes: number): string => {
  if (bytes < 1000) {
    return `${bytes} byte`;
  }
  if (bytes < 1000 * 1000) {
    return `${bytes / 1000} kB`;
  }
  return `${bytes / 1000 / 1000} mB`;
};
