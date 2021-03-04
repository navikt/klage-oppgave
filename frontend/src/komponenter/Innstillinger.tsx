import React, { useEffect, useState } from "react";
import Oppsett from "./Oppsett";
import FiltrerbarHeader, { settFilter } from "./Tabell/FiltrerbarHeader";
import { Filter, temaType } from "../tilstand/moduler/oppgave";
import { useDispatch, useSelector } from "react-redux";
import { velgFiltrering } from "../tilstand/moduler/oppgave.velgere";
import EtikettBase from "nav-frontend-etiketter";
import { Knapp } from "nav-frontend-knapper";
import {
  velgInnstillinger,
  velgEnheter,
  velgMeg,
  valgtEnhet,
} from "../tilstand/moduler/meg.velgere";
import { hentInnstillingerHandling, settInnstillingerHandling } from "../tilstand/moduler/meg";
import { GyldigeHjemler, GyldigeTemaer } from "../domene/filtre";

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
  const enheter = useSelector(velgEnheter);
  const innstillinger = useSelector(velgInnstillinger);
  const [reload, settReload] = useState<boolean>(false);
  const [typeFilter, settTypeFilter] = useState<string[] | undefined>(undefined);
  const [aktiveTyper, settAktiveTyper] = useState<Filter[]>(initState(filtrering.typer));
  const [hjemmelFilter, settHjemmelFilter] = useState<string[] | undefined>(undefined);
  const [aktiveHjemler, settAktiveHjemler] = useState<Filter[]>(initState(filtrering.hjemler));
  const [temaFilter, settTemaFilter] = useState<temaType[] | undefined>(undefined);
  const [aktiveTemaer, settAktiveTemaer] = useState<Filter[]>(initState(filtrering.temaer));
  const [lovligeTemaer, settLovligeTemaer] = useState<Filter[]>([]);
  const valgtEnhetIdx = useSelector(valgtEnhet);

  useEffect(() => {
    if (meg.id)
      dispatch(hentInnstillingerHandling({ navIdent: meg.id, enhetId: enheter[valgtEnhetIdx].id }));
  }, [meg.id, valgtEnhetIdx, reload]);

  useEffect(() => {
    let lovligeTemaer = [{ label: "Sykepenger", value: "SYK" } as Filter];
    if (enheter.length > 0) {
      enheter[valgtEnhetIdx].lovligeTemaer?.forEach((tema: any) => {
        let label;
        if (tema === "FOR") label = "Foreldrepenger";
        if (tema === "DAG") label = "Dagpenger";
        if (tema === "PEN") label = "Pensjon";
        if (tema !== "SYK") lovligeTemaer.push({ label: label, value: tema });
      });
    }
    settLovligeTemaer(lovligeTemaer);
  }, [enheter, valgtEnhetIdx, reload]);

  useEffect(() => {
    settAktiveHjemler(innstillinger?.aktiveHjemler ?? []);
    settAktiveTyper(innstillinger?.aktiveTyper ?? []);
    settAktiveTemaer(
      (innstillinger?.aktiveTemaer ?? [])
        .filter((tema: Filter) => tema.label !== "Sykepenger")
        .concat([{ label: "Sykepenger", value: "SYK" }])
    );
  }, [innstillinger, meg.id, reload]);

  const lagreInnstillinger = () => {
    settReload(true);
    dispatch(
      settInnstillingerHandling({
        navIdent: meg.id,
        enhetId: enheter[valgtEnhetIdx].id,
        innstillinger: {
          aktiveHjemler,
          aktiveTyper,
          aktiveTemaer,
        },
      })
    );
  };

  useEffect(() => {
    if (reload) settReload(false);
  }, [reload]);

  const filtrerTema = (filtre: Filter[]) => {
    if (!filtre.length) {
      settTemaFilter(undefined);
    } else {
      settTemaFilter(filtre.map((f) => f.value as temaType));
    }
    lagreInnstillinger();
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
    <Oppsett visMeny={true}>
      <div className={"innstillinger"}>
        <h1>Innstillinger</h1>
        <h3>Velg hvilke temaer og hjemler du har kompetanse til å behandle</h3>
        <table className={"innstillinger"}>
          <thead>
            <tr>
              <FiltrerbarHeader
                data-testid={"typefilter"}
                onFilter={(filter, velgAlleEllerIngen) =>
                  settFilter(settAktiveTyper, filter, aktiveTyper, velgAlleEllerIngen)
                }
                filtre={[
                  { label: "Klage", value: "ae0058" },
                  { label: "Anke", value: "ae0046" },
                  { label: "Feilutbetaling", value: "ae0161" },
                ]}
                dispatchFunc={filtrerType}
                aktiveFiltere={aktiveTyper}
              >
                Type
              </FiltrerbarHeader>

              <FiltrerbarHeader
                onFilter={(filter, velgAlleEllerIngen) =>
                  settFilter(settAktiveTemaer, filter, aktiveTemaer, velgAlleEllerIngen)
                }
                filtre={lovligeTemaer}
                dispatchFunc={filtrerTema}
                aktiveFiltere={aktiveTemaer}
              >
                Temaer
              </FiltrerbarHeader>

              <FiltrerbarHeader
                onFilter={(filter, velgAlleEllerIngen) =>
                  settFilter(settAktiveHjemler, filter, aktiveHjemler, velgAlleEllerIngen)
                }
                filtre={GyldigeHjemler}
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
                {aktiveTyper.map((a, idx) => (
                  <div key={`type${idx}`}>
                    <EtikettBase type="info" className={`etikett-type`}>
                      {a.label}
                    </EtikettBase>
                  </div>
                ))}
              </td>

              <td>
                {!aktiveTemaer.length && <div>Ingen temaer valgt</div>}
                {aktiveTemaer.map((a, idx) => (
                  <div key={`tema${idx}`}>
                    <EtikettBase type="info" className={`etikett--hjemmel`}>
                      {a.label}
                    </EtikettBase>
                  </div>
                ))}
                <div>
                  <small>
                    OBS: Sykepenger er satt som forvalgt tema, så det blir aktivt selv om du
                    forsøker å velge det bort.
                  </small>
                </div>
              </td>
              <td>
                {!aktiveHjemler.length && <div>Ingen hjemler valgt</div>}
                {aktiveHjemler.map((a, idx) => (
                  <div key={`hjemmel${idx}`}>
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
      </div>
    </Oppsett>
  );
};

export default Innstillinger;
