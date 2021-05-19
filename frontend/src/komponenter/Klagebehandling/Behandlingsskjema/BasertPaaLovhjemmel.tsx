import React from "react";
import { useSelector } from "react-redux";
import { Filter, IKodeverkVerdi } from "../../../tilstand/moduler/oppgave";
import { velgKodeverk } from "../../../tilstand/moduler/oppgave.velgere";
import filterReducer from "../../Tabell/filterReducer";
import SelectListHeader, { settHjemmel } from "./SelectListHeader";

const R = require("ramda");

interface BasertPaaHjemmelProps {
  tema: string;
  valgteHjemler: Filter[];
  velgHjemler: (hjemler: Filter[]) => void;
}

export function BasertPaaHjemmel({ tema, valgteHjemler, velgHjemler }: BasertPaaHjemmelProps) {
  const kodeverk = useSelector(velgKodeverk);

  const { filter_state, filter_dispatch } = filterReducer(10, 0);
  const settFiltrering = (type: string, payload: Filter[]) => {
    filter_dispatch({ type, payload });
  };

  let temahjemler: IKodeverkVerdi[] = [];
  let gyldigeHjemler: Filter[] = [];

  temahjemler =
    kodeverk.hjemlerPerTema.filter((_hjemler: any) => _hjemler.temaId === tema)[0]?.hjemler || [];

  temahjemler.forEach((hjemmel: IKodeverkVerdi) => {
    gyldigeHjemler.push({ label: hjemmel.beskrivelse, value: hjemmel.id.toString() });
  });

  const settHjemler = (hjemler: Filter[]) => {
    R.curry(settFiltrering)("sett_aktive_hjemler")(hjemler);
    velgHjemler(hjemler);
  };

  return (
    <div>
      <b>Utfallet er basert på lovhjemmel:</b>
      <SelectListHeader
        valgmuligheter={gyldigeHjemler}
        onSelect={(hjemmel) => settHjemmel(settHjemler, hjemmel, valgteHjemler)}
        dispatchFunc={settHjemmel}
        aktiveValgmuligheter={filter_state?.transformasjoner.filtrering?.hjemler}
      >
        {gyldigeHjemler.length > 0 ? "Velg hjemmel" : "Ingen hjemler under valgt tema"}
      </SelectListHeader>
    </div>
  );
}
