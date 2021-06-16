import React, { useEffect, useMemo, useState } from "react";
import NavFrontendSpinner from "nav-frontend-spinner";
import { useAppDispatch, useAppSelector } from "../../../tilstand/konfigurerTilstand";
import {
  velgDokumenter,
  velgDokumenterLoading,
  velgDokumenterPageReference,
  velgTilknyttedeDokumenter,
} from "../../../tilstand/moduler/dokumenter/selectors";
import { IDokument } from "../../../tilstand/moduler/dokumenter/stateTypes";
import { velgKlagebehandling } from "../../../tilstand/moduler/klagebehandling/selectors";
import { ShowDokument } from "./ShowDokument";
import { DokumenterBeholder } from "./styled-components/styled-components";
import { TilknyttedeDokumenter } from "./TilknyttedeDokumenter";
import { DokumenterProps, ITilknyttetDokument } from "./typer";
import { AlleDokumenter } from "./AlleDokumenter";
import {
  hentDokumenter,
  hentTilknyttedeDokumenter,
} from "../../../tilstand/moduler/dokumenter/actions";
import { NULLSTILL_DOKUMENTER } from "../../../tilstand/moduler/dokumenter/state";
import { Header } from "./Header";

export const Dokumenter = (props: DokumenterProps) => {
  const dispatch = useAppDispatch();
  const klagebehandling = useAppSelector(velgKlagebehandling);
  const loading = useAppSelector(velgDokumenterLoading);
  const dokumenter = useAppSelector(velgDokumenter);
  const tilknyttedeDokumenter = useAppSelector(velgTilknyttedeDokumenter);
  const pageReference = useAppSelector(velgDokumenterPageReference);
  const [dokument, settDokument] = useState<IDokument | null>(null);

  const alleDokumenter = useMemo<ITilknyttetDokument[]>(
    () =>
      dokumenter.map((dokument) => ({
        ...dokument,
        tilknyttet:
          klagebehandling?.tilknyttedeDokumenter.some((t) => dokumentMatcher(t, dokument)) ?? false,
      })),
    [dokumenter, klagebehandling?.tilknyttedeDokumenter]
  );

  useEffect(() => {
    if (klagebehandling !== null) {
      dispatch(hentDokumenter({ klagebehandlingId: klagebehandling.id, pageReference }));
      dispatch(hentTilknyttedeDokumenter(klagebehandling.id));
    }
    return () => {
      dispatch(NULLSTILL_DOKUMENTER());
    };
  }, [klagebehandling?.id]);

  if (props.skjult) {
    return null;
  }

  const { settFullvisning, fullvisning } = props;

  if (klagebehandling === null || (loading && dokumenter.length === 0)) {
    return (
      <DokumenterBeholder fullvisning={fullvisning}>
        <NavFrontendSpinner />
      </DokumenterBeholder>
    );
  }

  return (
    <>
      <DokumenterBeholder fullvisning={fullvisning}>
        <Header settFullvisning={settFullvisning} fullvisning={fullvisning} />
        <TilknyttedeDokumenter
          skjult={fullvisning}
          dokumenter={tilknyttedeDokumenter}
          settDokument={settDokument}
        />
        <AlleDokumenter
          skjult={!fullvisning}
          dokumenter={alleDokumenter}
          settDokument={settDokument}
          klagebehandlingId={klagebehandling.id}
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

interface ComparableDokument {
  dokumentInfoId: string | null;
  journalpostId: string;
}

const dokumentMatcher = (a: ComparableDokument, b: ComparableDokument) =>
  a.dokumentInfoId === b.dokumentInfoId && a.journalpostId === b.journalpostId;
