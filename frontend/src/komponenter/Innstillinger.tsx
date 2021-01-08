import React, { useEffect, useState } from "react";
import Oppsett from "./Oppsett";
import FiltrerbarHeader, { settFilter } from "./Tabell/FiltrerbarHeader";
import { Filter } from "../tilstand/moduler/oppgave";
import { useDispatch, useSelector } from "react-redux";
import { velgFiltrering } from "../tilstand/moduler/oppgave.velgere";
import EtikettBase from "nav-frontend-etiketter";
import { typeOversettelse } from "../domene/forkortelser";
import { Knapp } from "nav-frontend-knapper";
import axios from "axios";
import { velgInnstillinger, velgMeg } from "../tilstand/moduler/meg.velgere";
import { hentInnstillingerHandling, settInnstillingerHandling } from "../tilstand/moduler/meg";

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
  const dispatch = useDispatch();
  const filtrering = useSelector(velgFiltrering);
  const meg = useSelector(velgMeg);
  const innstillinger = useSelector(velgInnstillinger);
  const [typeFilter, settTypeFilter] = useState<string[] | undefined>(undefined);
  const [aktiveTyper, settAktiveTyper] = useState<Filter[]>(initState(filtrering.typer));
  const [hjemmelFilter, settHjemmelFilter] = useState<string[] | undefined>(undefined);
  const [aktiveHjemler, settAktiveHjemler] = useState<Filter[]>(initState(filtrering.hjemler));

  useEffect(() => {
    if (meg.id) dispatch(hentInnstillingerHandling(meg.id));
  }, [meg.id]);

  useEffect(() => {
    settAktiveHjemler(innstillinger?.aktiveHjemler ?? []);
    settAktiveTyper(innstillinger?.aktiveTyper ?? []);
  }, [innstillinger, meg.id]);

  const lagreInnstillinger = () => {
    dispatch(
      settInnstillingerHandling({
        navIdent: meg.id,
        innstillinger: {
          aktiveHjemler,
          aktiveTyper,
        },
      })
    );
  };

  const filtrerType = (filtre: Filter[]) => {
    if (!filtre.length) {
      settTypeFilter(undefined);
    } else {
      settTypeFilter(filtre.map((f) => f.value as string));
    }
    lagreInnstillinger();
  };
  const filtrerHjemmel = (filtre: Filter[]) => {
    if (!filtre.length) {
      settHjemmelFilter(undefined);
    } else {
      settHjemmelFilter(filtre.map((f) => f.value as string));
    }
    lagreInnstillinger();
  };
  return (
    <Oppsett>
      <>
        <h1>Innstillinger</h1>
        <h3>Velg hvilke ytelser og hjemler du har kompetanse til å behandle</h3>
        <table className={"innstillinger"}>
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

              <FiltrerbarHeader
                onFilter={(filter, velgAlleEllerIngen) =>
                  settFilter(settAktiveHjemler, filter, aktiveHjemler, velgAlleEllerIngen)
                }
                filtre={[
                  { label: "8-2, 8-15, 8-47 og 8-49", value: "8-2, 8-15, 8-47, 8-49" },
                  { label: "8-3 og 8-13", value: "8-3, 8-13" },
                  { label: "8-4, 8-7, og 8,8", value: "8-4, 8-7, 8-8" },
                  { label: "8-9", value: "8-9" },
                  { label: "8-12", value: "8-12" },
                  { label: "8-20", value: "8-20" },
                  { label: "8-28 - 8-30", value: "8-28, 8-29, 8-30" },
                  { label: "8-34 - 8-39", value: "8-34, 8-35, 8-36, 8-37, 8-38, 8-39" },
                  { label: "8-40 - 8-43", value: "8-40, 8-41, 8-42, 8-43" },
                  { label: "22-3 og 22-12", value: "22-3, 22-12" },
                  { label: "Annet", value: "?" },
                ]}
                dispatchFunc={filtrerHjemmel}
                aktiveFiltere={aktiveHjemler}
              >
                Hjemmel
              </FiltrerbarHeader>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                {!aktiveTyper.length && <div>Ingen typer valgt</div>}
                {aktiveTyper.map((a) => (
                  <div key={a.value}>
                    <EtikettBase type="info" className={`etikett-type`}>
                      {a.label}
                    </EtikettBase>
                  </div>
                ))}
              </td>
              <td>
                {!aktiveHjemler.length && <div>Ingen hjemler valgt</div>}
                {aktiveHjemler.map((a) => (
                  <div key={a.value}>
                    <EtikettBase type="info" className={`etikett--hjemmel`}>
                      {a.label}
                    </EtikettBase>
                  </div>
                ))}
              </td>
            </tr>
            <tr className={"skjult"}>
              <td colSpan={2} className={"lagre"}>
                <Knapp data-testid={`lagre`} className={"knapp"} onClick={lagreInnstillinger}>
                  Lagre
                </Knapp>
              </td>
            </tr>
          </tbody>
        </table>
      </>
    </Oppsett>
  );
};

export default Innstillinger;
