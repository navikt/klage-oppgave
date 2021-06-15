import React, { useCallback } from "react";
import { Knapp } from "nav-frontend-knapper";
import { useAppDispatch, useAppSelector } from "../../../../tilstand/konfigurerTilstand";
import { velgKlage } from "../../../../tilstand/moduler/klagebehandlinger.velgere";
import { settMedunderskriver } from "../../../../tilstand/moduler/medunderskrivere";

interface SendTilMedunderskriverProps {
  disabled: boolean;
  medunderskriverident?: string;
}

export const SendTilMedunderskriver = ({
  medunderskriverident,
  disabled,
}: SendTilMedunderskriverProps) => {
  const dispatch = useAppDispatch();
  const { id: klagebehandlingId, klagebehandlingVersjon } = useAppSelector(velgKlage);

  const sendTilMedunderskriver = useCallback(() => {
    if (medunderskriverident === undefined) {
      return;
    }
    dispatch(
      settMedunderskriver({
        medunderskriverident,
        klagebehandlingId,
        klagebehandlingVersjon,
      })
    );
  }, [klagebehandlingId, klagebehandlingVersjon, medunderskriverident]);

  return (
    <Knapp onClick={sendTilMedunderskriver} style={{ marginTop: "1em" }} disabled={disabled}>
      Fullfør og send til medunderskriver
    </Knapp>
  );
};
