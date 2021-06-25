import React, { useCallback } from "react";
import { Knapp } from "nav-frontend-knapper";
import { useAppDispatch, useAppSelector } from "../../../tilstand/konfigurerTilstand";
import { velgMeg } from "../../../tilstand/moduler/meg.velgere";
import { slettVedlegg } from "../../../tilstand/moduler/vedtak";
import { velgVedtak } from "../../../tilstand/moduler/vedtak.velgere";
import { IKlagebehandling } from "../../../tilstand/moduler/klagebehandling/stateTypes";

interface SlettVedleggProps {
  klagebehandling: IKlagebehandling;
}

export const SlettVedlegg = ({ klagebehandling }: SlettVedleggProps) => {
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector(velgVedtak);
  const {
    graphData: { id },
  } = useAppSelector(velgMeg);

  const {
    id: klagebehandlingId,
    klagebehandlingVersjon,
    avsluttetAvSaksbehandler,
    medunderskriverident,
    vedtak: [vedtak],
  } = klagebehandling;
  const { id: vedtakId, file } = vedtak;

  const deleteVedlegg = useCallback(
    () =>
      dispatch(
        slettVedlegg({
          klagebehandlingId,
          vedtakId,
          klagebehandlingVersjon,
        })
      ),
    [klagebehandlingId, klagebehandlingVersjon, vedtakId]
  );

  // Hvis det er lastet opp vedlegg, vedtaket er markert som avsluttet eller du er medunderskriver. Ikke vis UI for sletting.
  if (file === null || avsluttetAvSaksbehandler !== null || medunderskriverident === id) {
    return null;
  }

  return (
    <Knapp onClick={deleteVedlegg} disabled={loading} style={{ marginTop: "1em" }}>
      Slett vedlegg
    </Knapp>
  );
};
