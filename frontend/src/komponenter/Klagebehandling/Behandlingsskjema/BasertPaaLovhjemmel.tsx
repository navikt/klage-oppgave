import EtikettBase from "nav-frontend-etiketter";
import React from "react";
import styled from "styled-components";
import { Filter } from "../../../tilstand/moduler/oppgave";
import filterReducer from "../../Tabell/filterReducer";
import MultipleChoiceHeader, { settHjemmel } from "./MultipleChoiceHeader";

const R = require("ramda");

interface BasertPaaHjemmelProps {
  gyldigeHjemler: Filter[];
  valgteHjemler: Filter[];
  velgHjemler: (hjemler: Filter[]) => void;
}

const Etikettliste = styled.div`
  display: flex;
  flex-flow: row;
  flex-wrap: wrap;
  justify-content: start;
  > * {
    margin: 3px 10px 3px 0;
  }
`;

export function forkortet(hjemmel: string): string {
  const paragrafPos = hjemmel.indexOf("§");
  return paragrafPos !== -1 ? hjemmel.slice(paragrafPos) : hjemmel;
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

  const hjemmelTagsDisplay = () => {
    if (gyldigeHjemler.length > 0) {
      if (valgteHjemler.length > 0) {
        return (
          <Etikettliste>
            {valgteHjemler
              .map((hjemmel) => forkortet("" + hjemmel.label))
              .sort((a: string, b: string) => {
                return +a.replace(/[§-]/g, "") - +b.replace(/[§-]/g, "");
              })
              .map((hjemmelTag) => {
                return (
                  <EtikettBase key={hjemmelTag} type="info" className={`etikett-type`}>
                    {forkortet("" + hjemmelTag)}
                  </EtikettBase>
                );
              })}
          </Etikettliste>
        );
      } else {
        return "Velg hjemmel";
      }
    } else {
      return "Ingen hjemler under valgt tema";
    }
  };

  return (
    <div>
      <MultipleChoiceHeader
        label="Utfallet er basert på lovhjemmel:"
        valgmuligheter={gyldigeHjemler}
        onSelect={(hjemmel) => settHjemmel(settHjemler, hjemmel, valgteHjemler)}
        dispatchFunc={settHjemmel}
        aktiveValgmuligheter={filter_state?.transformasjoner.filtrering?.hjemler}
      >
        {hjemmelTagsDisplay()}
      </MultipleChoiceHeader>
    </div>
  );
}
