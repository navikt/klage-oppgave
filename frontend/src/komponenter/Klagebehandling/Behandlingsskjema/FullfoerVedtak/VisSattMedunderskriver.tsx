import React, { useEffect, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "../../../../tilstand/konfigurerTilstand";
import { velgKlage } from "../../../../tilstand/moduler/klagebehandlinger.velgere";
import { lastMedunderskrivere } from "../../../../tilstand/moduler/medunderskrivere";
import { velgMedunderskrivere } from "../../../../tilstand/moduler/medunderskrivere.velgere";
import { velgMeg } from "../../../../tilstand/moduler/meg.velgere";
import { StatusBoksMedTittel } from "./styled-components/status-boks";

export const VisSattMedunderskriver = () => {
  const dispatch = useAppDispatch();
  const { id } = useAppSelector(velgMeg);
  const { medunderskrivere } = useAppSelector(velgMedunderskrivere);
  const { medunderskriverident, tema } = useAppSelector(velgKlage);

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
