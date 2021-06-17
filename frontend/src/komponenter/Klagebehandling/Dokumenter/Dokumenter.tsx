import React, { useCallback, useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../tilstand/konfigurerTilstand";
import {
  velgAlleDokumenter,
  velgTilknyttedeDokumenter,
} from "../../../tilstand/moduler/dokumenter/selectors";
import { IDokument } from "../../../tilstand/moduler/dokumenter/stateTypes";
import { ShowDokument } from "./ShowDokument";
import { DokumenterBeholder } from "./styled-components/container";
import { TilknyttedeDokumenter } from "./TilknyttedeDokumenter";
import { AlleDokumenter } from "./AlleDokumenter";
import {
  hentDokumenter,
  hentTilknyttedeDokumenter,
} from "../../../tilstand/moduler/dokumenter/actions";
import { NULLSTILL_DOKUMENTER } from "../../../tilstand/moduler/dokumenter/state";
import { Header } from "./Header";
import { IKlagebehandling } from "../../../tilstand/moduler/klagebehandling/stateTypes";

export interface DokumenterProps {
  skjult: boolean;
  settFullvisning: (fullvisning: boolean) => void;
  fullvisning: boolean;
  klagebehandling: IKlagebehandling;
}

export const Dokumenter = ({
  skjult,
  settFullvisning,
  fullvisning,
  klagebehandling,
}: DokumenterProps) => {
  const dispatch = useAppDispatch();
  const alleDokumenter = useAppSelector(velgAlleDokumenter);
  const tilknyttedeDokumenter = useAppSelector(velgTilknyttedeDokumenter);
  const [dokument, settDokument] = useState<IDokument | null>(null);

  useEffect(() => {
    dispatch(hentDokumenter({ klagebehandlingId: klagebehandling.id, pageReference: null }));
    dispatch(hentTilknyttedeDokumenter(klagebehandling.id));
    return () => {
      dispatch(NULLSTILL_DOKUMENTER());
    };
  }, [klagebehandling.id, dispatch]);

  const visDokument = useCallback(
    (dokument: IDokument) => {
      if (dokument.harTilgangTilArkivvariant) {
        settDokument(dokument);
      }
    },
    [settDokument]
  );

  if (skjult) {
    return null;
  }

  return (
    <>
      <DokumenterBeholder fullvisning={fullvisning}>
        <Header settFullvisning={settFullvisning} fullvisning={fullvisning} />
        <TilknyttedeDokumenter
          skjult={fullvisning}
          dokumenter={tilknyttedeDokumenter}
          visDokument={visDokument}
          klagebehandling={klagebehandling}
        />
        <AlleDokumenter
          skjult={!fullvisning}
          dokumenter={alleDokumenter}
          visDokument={visDokument}
          klagebehandling={klagebehandling}
        />
      </DokumenterBeholder>
      <ShowDokument
        dokument={dokument}
        klagebehandlingId={klagebehandling.id}
        close={() => settDokument(null)}
      />
    </>
  );
};
