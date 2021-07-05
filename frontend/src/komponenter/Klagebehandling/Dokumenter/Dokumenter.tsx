import React, { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../tilstand/konfigurerTilstand";
import {
  velgAlleDokumenter,
  velgTilknyttedeDokumenter,
} from "../../../tilstand/moduler/dokumenter/selectors";
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
import { IShownDokument } from "./typer";
import { dokumentMatcher } from "./helpers";
import { IDokument } from "../../../tilstand/moduler/dokumenter/stateTypes";

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
  // const lagredeTilknyttedeDokumenter = useAppSelector(velgTilknyttedeDokumenter);
  const [dokument, settDokument] = useState<IShownDokument | null>(null);

  // const tilknyttedeDokumenter = useMemo<IDokument[]>(
  //   () =>
  //     alleDokumenter.dokumenter
  //       .filter(
  //         (dokument) =>
  //           !lagredeTilknyttedeDokumenter.dokumenter.some((t) => dokumentMatcher(t, dokument)) &&
  //           klagebehandling.tilknyttedeDokumenter.some(
  //             (t) => t.journalpostId === dokument.journalpostId
  //           )
  //       )
  //       .concat(lagredeTilknyttedeDokumenter.dokumenter)
  //       .sort((a, b) => {
  //         if (a.registrert > b.registrert) {
  //           return 1;
  //         }
  //         if (a.registrert < b.registrert) {
  //           return -1;
  //         }
  //         return 0;
  //       }),
  //   [lagredeTilknyttedeDokumenter, alleDokumenter]
  // );

  useEffect(() => {
    dispatch(hentDokumenter({ klagebehandlingId: klagebehandling.id, pageReference: null }));
    dispatch(hentTilknyttedeDokumenter(klagebehandling.id));
    return () => {
      dispatch(NULLSTILL_DOKUMENTER());
    };
  }, [klagebehandling.id, dispatch]);

  if (skjult) {
    return null;
  }

  return (
    <>
      <DokumenterBeholder fullvisning={fullvisning}>
        <Header settFullvisning={settFullvisning} fullvisning={fullvisning} />
        <TilknyttedeDokumenter
          skjult={fullvisning}
          // dokumenter={tilknyttedeDokumenter}
          // loading={lagredeTilknyttedeDokumenter.loading || alleDokumenter.loading}
          visDokument={settDokument}
          klagebehandling={klagebehandling}
        />
        <AlleDokumenter
          skjult={!fullvisning}
          dokumenter={alleDokumenter}
          visDokument={settDokument}
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
