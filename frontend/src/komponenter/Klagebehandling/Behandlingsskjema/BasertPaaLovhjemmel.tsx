import React, { useState } from "react";
import { useSelector } from "react-redux";
import { IKlage } from "../../../tilstand/moduler/klagebehandling";
import { velgKlage } from "../../../tilstand/moduler/klagebehandlinger.velgere";
import { Filter, IKodeverkVerdi } from "../../../tilstand/moduler/oppgave";
import { velgKodeverk } from "../../../tilstand/moduler/oppgave.velgere";
import filterReducer from "../../Tabell/filterReducer";
import SelectListHeader, { settHjemmel } from "./SelectListHeader";

const R = require("ramda");

export function BasertPaaHjemmel() {
  const kodeverk = useSelector(velgKodeverk);
  const klage: IKlage = useSelector(velgKlage);
  const { filter_state, filter_dispatch } = filterReducer(10, 0);
  const settFiltrering = (type: string, payload: Filter[]) => {
    filter_dispatch({ type, payload });
  };

  const [valgteHjemler, settValgteHjemler] = useState<string[]>([]);
  const [valgteHjemmelFiltre, settValgteHjemmelFiltre] = useState<Filter[]>([]);

  let hjemler: Filter[] = [];

  let temahjemler: IKodeverkVerdi[] = [];
  temahjemler = temahjemler =
    kodeverk.hjemlerPerTema.filter((_hjemler: any) => _hjemler.temaId === klage.tema)[0]?.hjemler ||
    [];
  hjemler = [];

  temahjemler.forEach((hjemmel: IKodeverkVerdi) => {
    hjemler.push({ label: hjemmel.beskrivelse, value: hjemmel.id.toString() });
  });

  const gyldigeHjemler: Filter[] = hjemler;

  const settHjemler = (hjemler: Filter[]) => {
    R.curry(settFiltrering)("sett_aktive_hjemler")(hjemler);

    if (!hjemler.length) {
      settValgteHjemmelFiltre([]);
      settValgteHjemler([]);
    } else {
      settValgteHjemmelFiltre(hjemler);
      settValgteHjemler(hjemler.map((f) => f.value as string));
    }
  };

  return (
    <div>
      <b>Utfallet er basert på lovhjemmel:</b>
      <SelectListHeader
        valgmuligheter={gyldigeHjemler}
        onSelect={(hjemmel) => settHjemmel(settHjemler, hjemmel, valgteHjemmelFiltre)}
        dispatchFunc={settHjemmel}
        aktiveValgmuligheter={filter_state?.transformasjoner.filtrering?.hjemler}
      >
        Hjemmel
      </SelectListHeader>
    </div>
  );
}
