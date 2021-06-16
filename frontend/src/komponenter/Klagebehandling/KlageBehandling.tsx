import React, { useEffect, useState } from "react";
import Oppsett from "../Oppsett";
import { KlagebehandlingPaneler } from "./KlagebehandlingPaneler";
import { IKlagebehandling } from "../../tilstand/moduler/klagebehandling/stateTypes";
import { Topplinje } from "./Topplinje/Kontrollpanel";
import "../../stilark/klagebehandling.less";
import { useAppSelector } from "../../tilstand/konfigurerTilstand";
import { velgInnstillinger } from "../../tilstand/moduler/meg.velgere";

export interface IFaner {
  detaljer: {
    checked: boolean;
  };
  dokumenter: {
    checked: boolean;
  };
  vedtak: {
    checked: boolean;
  };
}

interface KlagebehandlingProps {
  klagebehandling: IKlagebehandling;
}

export const Klagebehandling = ({ klagebehandling }: KlagebehandlingProps) => {
  const innstillinger = useAppSelector(velgInnstillinger);

  const [faner, settAktiveFaner] = useState<IFaner>({
    detaljer: {
      checked: innstillinger?.aktiveFaner?.detaljer?.checked || true,
    },
    dokumenter: {
      checked: innstillinger?.aktiveFaner?.dokumenter?.checked || true,
    },
    vedtak: {
      checked: innstillinger?.aktiveFaner?.vedtak?.checked || true,
    },
  });

  useEffect(() => {
    settAktiveFaner({
      detaljer: {
        checked: innstillinger?.aktiveFaner?.detaljer?.checked || true,
      },
      dokumenter: {
        checked: innstillinger?.aktiveFaner?.dokumenter?.checked || true,
      },
      vedtak: {
        checked: innstillinger?.aktiveFaner?.vedtak?.checked || true,
      },
    });
  }, [innstillinger?.aktiveFaner]);

  return (
    <Oppsett
      backLink={"/mineoppgaver"}
      visMeny={false}
      customClass={"bg_lysgraa"}
      contentClass={"uten-nav"}
    >
      <Topplinje
        klagebehandling={klagebehandling}
        faner={faner}
        settAktiveFaner={settAktiveFaner}
      />
      <KlagebehandlingPaneler faner={faner} klagebehandling={klagebehandling} />
    </Oppsett>
  );
};
