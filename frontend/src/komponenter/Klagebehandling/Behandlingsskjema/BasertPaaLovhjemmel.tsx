import React from "react";
import { Filter } from "../../../tilstand/moduler/oppgave";
import filterReducer from "../../Tabell/filterReducer";
import SelectListHeader, { settHjemmel } from "./SelectListHeader";

const R = require("ramda");

interface BasertPaaHjemmelProps {
  gyldigeHjemler: Filter[];
  valgteHjemler: Filter[];
  velgHjemler: (hjemler: Filter[]) => void;
}

export function BasertPaaHjemmel({
  gyldigeHjemler,
  valgteHjemler,
  velgHjemler,
}: BasertPaaHjemmelProps) {
  const { filter_state, filter_dispatch } = filterReducer(10, 0);
  const settFiltrering = (type: string, payload: Filter[]) => {
    filter_dispatch({ type, payload });
  };

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
