import React, { useCallback } from "react";
import { Knapp } from "nav-frontend-knapper";
import { useAppDispatch } from "../../../../tilstand/konfigurerTilstand";
import { settMedunderskriver } from "../../../../tilstand/moduler/medunderskrivere/actions";
import { IKlagebehandling } from "../../../../tilstand/moduler/klagebehandling/stateTypes";

interface SendTilMedunderskriverProps {
  disabled: boolean;
  medunderskriverident?: string;
  klagebehandling: IKlagebehandling;
}

export const SendTilMedunderskriver = ({
  medunderskriverident,
  disabled,
  klagebehandling,
}: SendTilMedunderskriverProps) => {
  const dispatch = useAppDispatch();
  const { id: klagebehandlingId, klagebehandlingVersjon } = klagebehandling;

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
