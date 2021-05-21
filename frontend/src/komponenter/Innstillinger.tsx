import React, { useEffect, useState } from "react";
import Oppsett from "./Oppsett";
import FiltrerbarHeader, { settFilter } from "./Tabell/FiltrerbarHeader";
import { Filter, IKodeverkVerdi } from "../tilstand/moduler/oppgave";
import { useDispatch, useSelector } from "react-redux";
import { velgFiltrering, velgKodeverk } from "../tilstand/moduler/oppgave.velgere";
import EtikettBase from "nav-frontend-etiketter";
import { Knapp } from "nav-frontend-knapper";
import {
  velgInnstillinger,
  velgEnheter,
  velgMeg,
  valgtEnhet,
} from "../tilstand/moduler/meg.velgere";
import {
  Faner,
  hentInnstillingerHandling,
  settInnstillingerHandling,
} from "../tilstand/moduler/meg";
import styled from "styled-components";

function initState(filter: Array<string> | undefined) {
  if ("undefined" === typeof filter) {
    return [];
  }
  if (!Array.isArray(filter)) return [{ label: filter }];
  return filter.map(function (f: string) {
    return { label: f, value: f };
  });
}

const TableRow = styled.td``;

const Innstillinger = (): JSX.Element => {
  const dispatch = useDispatch();
  const filtrering = useSelector(velgFiltrering);
  const faner = {};
  const meg = useSelector(velgMeg);
  const enheter = useSelector(velgEnheter);
  const innstillinger = useSelector(velgInnstillinger);
  const [reload, settReload] = useState<boolean>(false);
  const [typeFilter, settTypeFilter] = useState<string[] | undefined>(undefined);
  const [aktiveTyper, settAktiveTyper] = useState<Filter[]>(initState(filtrering.typer));
  const [hjemmelFilter, settHjemmelFilter] = useState<string[] | undefined>(undefined);
  const [aktiveHjemler, settAktiveHjemler] = useState<Filter[]>(initState(filtrering.hjemler));
  const [temaFilter, settTemaFilter] = useState<string[] | undefined>(undefined);
  const [aktiveTemaer, settAktiveTemaer] = useState<Filter[]>(initState(filtrering.temaer));
  const [aktiveFaner, settAktiveFaner] = useState<Faner>(faner);
  const [lovligeTemaer, settLovligeTemaer] = useState<Filter[]>([]);
  const [gyldigeHjemler, settGyldigeHjemler] = useState<Filter[]>([]);
  const [gyldigeTyper, settGyldigeTyper] = useState<Filter[]>([]);

  const valgtEnhetIdx = useSelector(valgtEnhet);
  const kodeverk = useSelector(velgKodeverk);

  useEffect(() => {
    if (meg.id)
      dispatch(hentInnstillingerHandling({ navIdent: meg.id, enhetId: enheter[valgtEnhetIdx].id }));
  }, [meg.id, valgtEnhetIdx, reload]);

  useEffect(() => {
    let lovligeTemaer: Filter[] = [];
    if (enheter.length > 0) {
      enheter[valgtEnhetIdx].lovligeTemaer?.forEach((tema: string | any) => {
        if (kodeverk?.tema) {
          let kodeverkTema = kodeverk.tema.filter(
            (t: IKodeverkVerdi) => t.id.toString() === tema.toString()
          )[0];
          if (kodeverkTema?.id)
            lovligeTemaer.push({
              label: kodeverkTema?.beskrivelse,
              value: kodeverkTema?.id.toString(),
            });
        }
      });
    }
    settLovligeTemaer(lovligeTemaer);

    let hjemler: Filter[] = [];
    if (kodeverk.hjemmel) {
      kodeverk.hjemmel.map((hjemmel: IKodeverkVerdi) => {
        hjemler.push({ label: hjemmel.beskrivelse, value: hjemmel.id.toString() });
      });
      settGyldigeHjemler(hjemler);
    }

    let typer: Filter[] = [];
    if (kodeverk.type) {
      kodeverk.type.map((verdi: IKodeverkVerdi) => {
        typer.push({ label: verdi.beskrivelse, value: verdi.id.toString() });
      });
      settGyldigeTyper(typer);
    }
  }, [enheter, valgtEnhetIdx, reload]);

  useEffect(() => {
    settAktiveHjemler(innstillinger?.aktiveHjemler ?? []);
    settAktiveTyper(innstillinger?.aktiveTyper ?? []);
    settAktiveTemaer(innstillinger?.aktiveTemaer ?? []);
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
          aktiveFaner,
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
      settTemaFilter(filtre.map((f) => f.value as string));
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
    <Oppsett visMeny={false}>
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
                filtre={gyldigeTyper}
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
                filtre={gyldigeHjemler}
                dispatchFunc={filtrerHjemmel}
                aktiveFiltere={aktiveHjemler}
              >
                Hjemmel
              </FiltrerbarHeader>
            </tr>
          </thead>
          <tbody>
            <tr>
              <TableRow>
                {!aktiveTyper.length && <div>Ingen typer valgt</div>}
                {aktiveTyper.map((a, idx) => (
                  <div key={`type${idx}`}>
                    <EtikettBase type="info" className={`etikett-type`}>
                      {a.label}
                    </EtikettBase>
                  </div>
                ))}
              </TableRow>

              <TableRow>
                {!aktiveTemaer.length && <div>Ingen temaer valgt</div>}
                {aktiveTemaer.map((a, idx) => (
                  <div key={`tema${idx}`}>
                    <EtikettBase type="info" className={`etikett--hjemmel`}>
                      {a.label}
                    </EtikettBase>
                  </div>
                ))}
              </TableRow>
              <TableRow>
                {!aktiveHjemler.length && <div>Ingen hjemler valgt</div>}
                {aktiveHjemler.map((a, idx) => (
                  <div key={`hjemmel${idx}`}>
                    <EtikettBase type="info" className={`etikett--hjemmel`}>
                      {a.label}
                    </EtikettBase>
                  </div>
                ))}
              </TableRow>
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
