import React, { useRef, useCallback, useMemo } from "react";
import { Knapp } from "nav-frontend-knapper";
import { useAppDispatch, useAppSelector } from "../../../tilstand/konfigurerTilstand";
import { velgMeg } from "../../../tilstand/moduler/meg.velgere";
import { lastOppVedlegg } from "../../../tilstand/moduler/vedtak";
import { velgVedtak } from "../../../tilstand/moduler/vedtak.velgere";
import { IKlagebehandling } from "../../../tilstand/moduler/klagebehandling/stateTypes";

interface LastOppVedleggProps {
  klagebehandling: IKlagebehandling;
}

export const LastOppVedlegg = ({ klagebehandling }: LastOppVedleggProps) => {
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector(velgVedtak);
  const { id, valgtEnhet, enheter } = useAppSelector(velgMeg);

  const {
    id: klagebehandlingId,
    klagebehandlingVersjon,
    avsluttetAvSaksbehandler,
    medunderskriverident,
    vedtak: [vedtak],
  } = klagebehandling;
  const { id: vedtakId, file } = vedtak;

  const journalfoerendeEnhet = useMemo(() => enheter[valgtEnhet]?.id, [enheter, valgtEnhet]);

  const fileInput = useRef<HTMLInputElement>(null);
  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      event.preventDefault();
      fileInput.current?.click();
    },
    [fileInput]
  );

  const uploadVedlegg = useCallback(
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
      <Knapp onClick={handleClick} disabled={loading} style={{ marginTop: "1em" }}>
        Last opp vedlegg
      </Knapp>
      <input
        type="file"
        accept=".pdf"
        ref={fileInput}
        onChange={uploadVedlegg}
        style={{ display: "none" }}
        disabled={loading}
      />
    </>
  );
};
