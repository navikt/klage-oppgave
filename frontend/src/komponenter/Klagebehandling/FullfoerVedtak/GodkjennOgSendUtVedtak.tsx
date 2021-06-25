import React, { useCallback, useMemo } from "react";
import { Knapp } from "nav-frontend-knapper";
import { useAppDispatch, useAppSelector } from "../../../tilstand/konfigurerTilstand";
import { velgMeg } from "../../../tilstand/moduler/meg.velgere";
import { fullfoerVedtak } from "../../../tilstand/moduler/vedtak";
import { velgVedtak } from "../../../tilstand/moduler/vedtak.velgere";
import { StatusBoksMedTittel } from "./styled-components/status-boks";
import { TilbakeTilOppgaverLenke } from "./styled-components/tilbake-link";
import { INavn } from "../../../tilstand/moduler/klagebehandling";
import { IKlagebehandling } from "../../../tilstand/moduler/klagebehandling/stateTypes";
import { useIsSaved } from "../utils/hooks";

interface GodkjennOgSendUtVedtakProps {
  klagebehandling: IKlagebehandling;
}

export const GodkjennOgSendUtVedtak = ({ klagebehandling }: GodkjennOgSendUtVedtakProps) => {
  const dispatch = useAppDispatch();
  const {
    graphData: { id },
    enheter,
    valgtEnhet,
  } = useAppSelector(velgMeg);
  const isSaved = useIsSaved();
  const {
    id: klagebehandlingId,
    klagebehandlingVersjon,
    medunderskriverident,
    vedtak: [vedtak],
    sakenGjelderNavn,
  } = klagebehandling;
  const { loading } = useAppSelector(velgVedtak);

  const { id: vedtakId, ferdigstilt, file } = vedtak;

  const journalfoerendeEnhet = useMemo(() => valgtEnhet.id, [enheter, valgtEnhet]);

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
    [journalfoerendeEnhet, klagebehandlingId, klagebehandlingVersjon, vedtakId]
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
      disabled={loading || !harVedlegg || !isSaved}
    >
      Godkjenn og send ut vedtak
    </Knapp>
  );
};

const formaterNavn = (navn: INavn | null): string => {
  if (navn === null) {
    return "-";
  }
  const { fornavn, mellomnavn, etternavn } = navn;
  return [fornavn, mellomnavn, etternavn]
    .filter((n) => typeof n === "string" && n.length !== 0)
    .join(" ");
};
