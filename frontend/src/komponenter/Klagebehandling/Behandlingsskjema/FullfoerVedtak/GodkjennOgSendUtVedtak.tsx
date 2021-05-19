import React, { useCallback, useMemo } from "react";
import { Knapp } from "nav-frontend-knapper";
import { useAppDispatch, useAppSelector } from "../../../../tilstand/konfigurerTilstand";
import { velgKlage } from "../../../../tilstand/moduler/klagebehandlinger.velgere";
import { velgMeg } from "../../../../tilstand/moduler/meg.velgere";
import { fullfoerVedtak } from "../../../../tilstand/moduler/vedtak";
import { velgVedtak } from "../../../../tilstand/moduler/vedtak.velgere";
import { StatusBoksMedTittel } from "./styled-components/status-boks";
import { TilbakeTilOppgaverLenke } from "./styled-components/tilbake-link";
import { INavn } from "../../../../tilstand/moduler/klagebehandling";

export const GodkjennOgSendUtVedtak = () => {
  const dispatch = useAppDispatch();
  const { id, enheter, valgtEnhet } = useAppSelector(velgMeg);
  const {
    id: klagebehandlingId,
    klagebehandlingVersjon,
    medunderskriverident,
    vedtak,
    sakenGjelderNavn,
  } = useAppSelector(velgKlage);
  const { loading } = useAppSelector(velgVedtak);

  const { id: vedtakId, ferdigstilt, file } = vedtak[0];
  const journalfoerendeEnhet = enheter[valgtEnhet].id;

  const godkjennOgSendUt = useCallback(
    () =>
      dispatch(
        fullfoerVedtak({
          journalfoerendeEnhet,
          klagebehandlingId,
          klagebehandlingVersjon,
          vedtakId,
        })
      ),
    [klagebehandlingId, vedtakId]
  );

  const harVedlegg = useMemo(() => file !== null, [file]);

  // Hvis du ikke er medunderskriver.
  if (medunderskriverident !== id) {
    return null;
  }

  // Hvis vedtaket er ferdigstilt.
  if (typeof ferdigstilt === "string" && ferdigstilt.length !== 0) {
    return (
      <>
        <StatusBoksMedTittel tittel={"Sendes til klager"}>
          Vedtaket sendes nå til {formaterNavn(sakenGjelderNavn)}
        </StatusBoksMedTittel>
        <TilbakeTilOppgaverLenke to={"/mineoppgaver"}>Tilbake til oppgaver</TilbakeTilOppgaverLenke>
      </>
    );
  }

  return (
    <Knapp
      onClick={godkjennOgSendUt}
      style={{ marginTop: "1em" }}
      disabled={loading || !harVedlegg}
    >
      Godkjenn og send ut vedtak
    </Knapp>
  );
};

const formaterNavn = ({ fornavn, mellomnavn, etternavn }: INavn): string =>
  [fornavn, mellomnavn, etternavn].filter((n) => typeof n === "string" && n.length !== 0).join(" ");
