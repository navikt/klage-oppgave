import React, { useCallback, useMemo } from "react";
import { File as PreviewFile } from "forhandsvisningsfil";
import { slettVedlegg } from "../../../../tilstand/moduler/vedtak";
import { useAppDispatch, useAppSelector } from "../../../../tilstand/konfigurerTilstand";
import { FilInfoBeholder } from "./styled-components/filinfo-beholder";
import { OpplastetFilNavnTittel } from "./styled-components/opplastet-filnavn-tittel";
import { OpplastetVedleggTittel } from "./styled-components/opplastet-vedlegg-tittel";
import { StyledForhandsvisningsfil } from "./styled-components/forhandvisningsfil";
import { velgKlage } from "../../../../tilstand/moduler/klagebehandlinger.velgere";
import { velgVedtak } from "../../../../tilstand/moduler/vedtak.velgere";
import { velgMeg } from "../../../../tilstand/moduler/meg.velgere";

export const VisVedlegg = () => {
  const dispatch = useAppDispatch();
  const {
    id: klagebehandlingId,
    vedtak,
    klagebehandlingVersjon,
    medunderskriverident,
    avsluttetAvSaksbehandler,
  } = useAppSelector(velgKlage);
  const { loading } = useAppSelector(velgVedtak);
  const { id } = useAppSelector(velgMeg);

  const kanSlettes = useMemo(
    // Om vedtaket er lastet, ikke avsluttet og du ikke er medunderskriver.
    () => !loading && avsluttetAvSaksbehandler === null && medunderskriverident !== id,
    [avsluttetAvSaksbehandler]
  );

  const { id: vedtakId, file } = vedtak[0];

  const deleteVedtak = useCallback(
    (_: PreviewFile) =>
      dispatch(
        slettVedlegg({
          klagebehandlingId,
          vedtakId,
          klagebehandlingVersjon,
        })
      ),
    [klagebehandlingId, vedtakId]
  );

  const vedleggLink = useMemo(
    () => `/api/klagebehandlinger/${klagebehandlingId}/vedtak/${vedtakId}/pdf`,
    [klagebehandlingId, vedtakId]
  );

  if (file === null) {
    return null;
  }

  const { content, name, size } = file;
  return (
    <>
      <FilVisning
        file={{
          content: { base64: content },
          name,
          size,
          mimetype: "application/pdf",
        }}
        onDelete={deleteVedtak}
        showDeleteButton={kanSlettes}
        fileLink={vedleggLink}
      />
      <FilInfoBeholder>
        <OpplastetVedleggTittel>VEDLEGG - OPPLASTET</OpplastetVedleggTittel>
        <OpplastetFilNavnTittel>Filnavn</OpplastetFilNavnTittel>
        <span>{name}</span>
      </FilInfoBeholder>
    </>
  );
};

interface FilVisningProps {
  file: PreviewFile;
  onDelete: (file: PreviewFile) => void;
  showDeleteButton: boolean;
  fileLink: string;
}

const FilVisning = ({ file, onDelete, showDeleteButton, fileLink }: FilVisningProps) => {
  if (file.id === null) {
    return null;
  }

  return (
    <StyledForhandsvisningsfil
      file={file}
      showDeleteButton={showDeleteButton}
      onDeleteFile={onDelete}
      scale={2.5}
      onContentClick={() => window.open(fileLink, "_blank")}
    />
  );
};
