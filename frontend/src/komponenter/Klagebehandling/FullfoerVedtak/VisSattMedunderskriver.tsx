import React, { useEffect, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "../../../tilstand/konfigurerTilstand";
import { IKlagebehandling } from "../../../tilstand/moduler/klagebehandling/stateTypes";
import { lastMedunderskrivere } from "../../../tilstand/moduler/medunderskrivere/actions";
import { velgMedunderskrivere } from "../../../tilstand/moduler/medunderskrivere/selectors";
import { velgMeg } from "../../../tilstand/moduler/meg.velgere";
import { StatusBoksMedTittel } from "./styled-components/status-boks";

interface VisSattMedunderskriverProps {
  klagebehandling: IKlagebehandling;
}

export const VisSattMedunderskriver = ({ klagebehandling }: VisSattMedunderskriverProps) => {
  const dispatch = useAppDispatch();
  const {
    graphData: { id },
  } = useAppSelector(velgMeg);
  const { medunderskrivere } = useAppSelector(velgMedunderskrivere);
  const { medunderskriverident, tema } = klagebehandling;

  useEffect(() => {
    dispatch(lastMedunderskrivere({ id, tema }));
  }, [id, tema]);

  const currentMedunderskriver = useMemo(
    () => medunderskrivere.find(({ ident }) => ident === medunderskriverident),
    [medunderskrivere, medunderskriverident]
  );

  if (currentMedunderskriver === undefined) {
    return <StatusBoksMedTittel tittel={"Sendt til medunderskriver"} />;
  }

  const { navn } = currentMedunderskriver;
  return (
    <StatusBoksMedTittel tittel={"Sendt til medunderskriver"}>
      Klagen er nå sendt til {navn}.
    </StatusBoksMedTittel>
  );
};
