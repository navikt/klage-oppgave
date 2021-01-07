import React, { useState } from "react";
import Oppsett from "./Oppsett";
import FiltrerbarHeader, { settFilter } from "./Tabell/FiltrerbarHeader";
import { Filter } from "../tilstand/moduler/oppgave";
import { useSelector } from "react-redux";
import { velgFiltrering } from "../tilstand/moduler/oppgave.velgere";

function initState(filter: Array<string> | undefined) {
  if ("undefined" === typeof filter) {
    return [];
  }
  if (!Array.isArray(filter)) return [{ label: filter }];
  return filter.map(function (f: string) {
    return { label: f, value: f };
  });
}

const Innstillinger = (): JSX.Element => {
  const filtrering = useSelector(velgFiltrering);

  const [typeFilter, settTypeFilter] = useState<string[] | undefined>(undefined);
  const [aktiveTyper, settAktiveTyper] = useState<Filter[]>(initState(filtrering.typer));

  const filtrerType = (filtre: Filter[]) => {
    if (!filtre.length) {
      settTypeFilter(undefined);
    } else {
      settTypeFilter(filtre.map((f) => f.value as string));
    }
  };

  return (
    <Oppsett>
      <>
        <h1>Innstillinger</h1>
        <h3>Velg hvilke ytelser og hjemler du har kompetanse til å behandle</h3>
        <table>
          <thead>
            <tr>
              <FiltrerbarHeader
                onFilter={(filter, velgAlleEllerIngen) =>
                  settFilter(settAktiveTyper, filter, aktiveTyper, velgAlleEllerIngen)
                }
                filtre={[
                  { label: "Klage", value: "Klage" },
                  { label: "Anke", value: "Anke" },
                  { label: "Feilutbetaling", value: "Feilutbetaling" },
                ]}
                dispatchFunc={filtrerType}
                aktiveFiltere={aktiveTyper}
              >
                Type
              </FiltrerbarHeader>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                {aktiveTyper.map((a) => (
                  <div id={a.value}>{a.label}</div>
                ))}
              </td>
              <td>
                {aktiveTyper.map((a) => (
                  <div id={a.value}>{a.label}</div>
                ))}
              </td>
            </tr>
          </tbody>
        </table>
      </>
    </Oppsett>
  );
};

export default Innstillinger;
