import React, { useRef, useCallback } from "react";
import { Knapp } from "nav-frontend-knapper";
import { useAppDispatch, useAppSelector } from "../../../../tilstand/konfigurerTilstand";
import { velgKlage } from "../../../../tilstand/moduler/klagebehandlinger.velgere";
import { velgMeg } from "../../../../tilstand/moduler/meg.velgere";
import { lastOppVedlegg } from "../../../../tilstand/moduler/vedtak";
import { velgVedtak } from "../../../../tilstand/moduler/vedtak.velgere";

export const LastOppVedlegg = () => {
  const dispatch = useAppDispatch();

  const {
    id: klagebehandlingId,
    klagebehandlingVersjon,
    vedtak,
    medunderskriverident,
    avsluttetAvSaksbehandler,
  } = useAppSelector(velgKlage);
  const { loading } = useAppSelector(velgVedtak);
  const { id, valgtEnhet, enheter } = useAppSelector(velgMeg);
  const activeVedtak = vedtak[0];
  const { id: vedtakId, file } = activeVedtak;
  const journalfoerendeEnhet = enheter[valgtEnhet].id;

  const fileInput = useRef<HTMLInputElement>(null);
  const handleVedtakClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      event.preventDefault();
      fileInput.current?.click();
    },
    [fileInput]
  );

  const uploadVedtak = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      event.preventDefault();

      const { files } = event.target;
      if (files === null || files.length !== 1) {
        console.error(`Wrong number of files ${files?.length}.`);
        return;
      }
      dispatch(
        lastOppVedlegg({
          file: files[0],
          klagebehandlingId,
          vedtakId,
          journalfoerendeEnhet,
          klagebehandlingVersjon,
        })
      );
      event.currentTarget.value = "";
    },
    [klagebehandlingId, klagebehandlingVersjon, vedtakId, journalfoerendeEnhet]
  );

  // Hvis det ikke er lastet opp vedlegg, vedtaket er markert som avsluttet eller du er medunderskriver. Ikke vis UI for opplasting.
  if (file !== null || avsluttetAvSaksbehandler !== null || medunderskriverident === id) {
    return null;
  }

  return (
    <>
      <Knapp onClick={handleVedtakClick} disabled={loading} style={{ marginTop: "1em" }}>
        Last opp vedtak
      </Knapp>
      <input
        type="file"
        accept=".pdf"
        ref={fileInput}
        onChange={uploadVedtak}
        style={{ display: "none" }}
        disabled={loading}
      />
    </>
  );
};
