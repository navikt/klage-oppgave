import {
  Filter,
  ferdigstilteRequest,
  hentUtgatte,
  kodeverkRequest,
  oppgaveRequest,
} from "../../tilstand/moduler/oppgave";
import { IKodeverkVerdi } from "../../tilstand/moduler/kodeverk";
import { useDispatch, useSelector } from "react-redux";
import React, { useEffect, useState } from "react";
import {
  valgtEnhet,
  velgEnheter,
  velgInnstillinger,
  velgMeg,
} from "../../tilstand/moduler/meg.velgere";
import {
  velgOppgaver,
  velgSideLaster,
  velgProjeksjon,
  velgKodeverk,
  velgFerdigstilteOppgaver,
} from "../../tilstand/moduler/oppgave.velgere";
import { tildelMegHandling } from "../../tilstand/moduler/saksbehandler";
import "../../stilark/Tabell.less";
import "../../stilark/TabellHead.less";
import FiltrerbarHeader, { settFilter } from "./FiltrerbarHeader";
import { valgtOppgaveType } from "../types";
import { genererTabellRader } from "./tabellfunksjoner";
import Paginering, { visAntallTreff } from "../Paginering/Paginering";
import { useHistory, useParams, useLocation } from "react-router-dom";
import NavFrontendSpinner from "nav-frontend-spinner";
import { routingRequest } from "../../tilstand/moduler/router";
import { velgForrigeSti } from "../../tilstand/moduler/router.velgere";
import { hentInnstillingerHandling, settInnstillingerHandling } from "../../tilstand/moduler/meg";
import { hentFeatureToggleHandling } from "../../tilstand/moduler/unleash";
import { velgFeatureToggles } from "../../tilstand/moduler/unleash.velgere";

import filterReducer from "./filterReducer";
import Debug from "./Debug";
import styled from "styled-components";
import { filter } from "rxjs/operators";
import { velgOppgaveLaster } from "../../tilstand/moduler/oppgavelaster.velgere";
import { settOppgaverLaster } from "../../tilstand/moduler/oppgavelaster";

const R = require("ramda");

const Feil = styled.div`
  display: block;
  margin: 0 1em;
`;

const IkkeFiltrerbarHeader = styled.th`
  display: block;
  padding: 1em;
`;

const FullforteOppgaver = styled.div`
  margin: 4em 0 0 0;
`;

function OppgaveTabell({ visFilter }: { visFilter: boolean }) {
  const dispatch = useDispatch();
  const meg = useSelector(velgMeg);
  const sideLaster = useSelector(velgOppgaveLaster);
  const kodeverk = useSelector(velgKodeverk);
  const klagebehandlinger = useSelector(velgOppgaver);
  const ferdigstilteKlager = useSelector(velgFerdigstilteOppgaver);
  const forrigeSti = useSelector(velgForrigeSti);
  const utvidetProjeksjon = useSelector(velgProjeksjon);
  const location = useLocation();

  interface ParamTypes {
    side: string | undefined;
  }

  let { side } = useParams<ParamTypes>();
  let tolketStart = parseInt(side as string, 10) || 1;

  const [forrigeStart, settForrigeStart] = useState<number>(1);

  const [hjemmelFilter, settHjemmelFilter] = useState<string[] | undefined>(undefined);
  const [forrigeHjemmelFilter, settForrigeHjemmelFilter] =
    useState<string[] | undefined>(undefined);

  const [temaFilter, settTemaFilter] = useState<string[] | undefined>(undefined);
  const [forrigeTemaFilter, settForrigeTemaFilter] = useState<string[] | undefined>(undefined);
  const [lovligeTemaer, settLovligeTemaer] = useState<Filter[]>([]);
  const [gyldigeHjemler, settGyldigeHjemler] = useState<Filter[]>([]);
  const [gyldigeTyper, settGyldigeTyper] = useState<Filter[]>([]);

  const [typeFilter, settTypeFilter] = useState<string[] | undefined>(undefined);
  const [forrigeTypeFilter, settForrigeTypeFilter] = useState<string[] | undefined>(undefined);

  const [valgtOppgave, settValgtOppgave] = useState<valgtOppgaveType>({
    id: "",
    klagebehandlingVersjon: 0,
  });

  const [antall] = useState<number>(10);
  const [start, settStart] = useState<number>(0);
  const history = useHistory();
  const pathname = location.pathname.split("/")[1];
  const innstillinger = useSelector(velgInnstillinger);
  const enheter = useSelector(velgEnheter);
  const valgtEnhetIdx = useSelector(valgtEnhet);
  const featureToggles = useSelector(velgFeatureToggles);

  const { filter_state, filter_dispatch } = filterReducer(antall, start);
  const settFiltrering = (type: string, payload: Filter[]) => {
    filter_dispatch({ type, payload });
  };
  const settTemaer = (payload: Filter[]) => R.curry(settFiltrering)("sett_aktive_temaer")(payload);
  const settHjemler = (payload: Filter[]) =>
    R.curry(settFiltrering)("sett_aktive_hjemler")(payload);
  const settTyper = (payload: Filter[]) => R.curry(settFiltrering)("sett_aktive_typer")(payload);
  const sorteringFrist: "synkende" | "stigende" =
    filter_state?.transformasjoner?.sortering?.frist || "synkende";
  const sorteringMottatt: "synkende" | "stigende" =
    filter_state?.transformasjoner?.sortering?.mottatt || "synkende";

  /** NAVIDENT
   * Vi ønsker å hente oppgaver når NAVIDENT og EnhetsID er satt
   */
  useEffect(() => {
    if (meg.id) {
      filter_dispatch({ type: "sett_navident", payload: meg });
    }
  }, [meg.id, location.pathname]);

  /** UTVIDET PROJEKSJON
   * Med dette flagget kommer det persondata fra kabal-api. Dette skal skrus
   * på for "MINE OPPGAVER" og dersom det er skrudd på i featuretoggles.
   */
  const [visFnr, settVisFnr] = useState<boolean>(location.pathname.startsWith("/mineoppgaver"));
  useEffect(() => {
    dispatch(hentFeatureToggleHandling("klage.listFnr"));
  }, []);

  useEffect(() => {
    filter_dispatch({ type: "sett_projeksjon", payload: utvidetProjeksjon });
  }, [utvidetProjeksjon]);

  useEffect(() => {
    const tilgangEnabled = featureToggles.features.find((f) => f?.navn === "klage.listFnr");
    if (tilgangEnabled?.isEnabled !== undefined) {
      if (!location.pathname.startsWith("/mineoppgaver")) {
        settVisFnr(tilgangEnabled.isEnabled);
        filter_dispatch({ type: "sett_projeksjon", payload: tilgangEnabled.isEnabled });
      }
    }
  }, [featureToggles]);

  const [innstillingerHentet, settInnstillingerHentet] = useState(false);
  useEffect(() => {
    if (meg.id) {
      if (!innstillingerHentet) {
        settInnstillingerHentet(true);
        dispatch(
          hentInnstillingerHandling({ navIdent: meg.id, enhetId: enheter[valgtEnhetIdx].id })
        );
      }
    }
  }, [valgtEnhetIdx, meg.id]);

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
    if (innstillinger?.aktiveTemaer) settLovligeTemaer(innstillinger.aktiveTemaer);
    else settLovligeTemaer(lovligeTemaer);

    let hjemler: Filter[] = [];
    if (innstillinger?.aktiveTemaer) {
      let temahjemler: IKodeverkVerdi[] = [];
      innstillinger.aktiveTemaer.map((tema: Filter) => {
        temahjemler = temahjemler.concat(
          kodeverk.hjemlerPerTema.filter((_hjemler) => _hjemler.temaId === tema.value!)[0]
            ?.hjemler || []
        );
      });
      hjemler = [];
      temahjemler.forEach((hjemmel: IKodeverkVerdi) => {
        hjemler.push({ label: hjemmel.beskrivelse, value: hjemmel.id.toString() });
      });
      settGyldigeHjemler(hjemler);
    } else if (innstillinger?.aktiveHjemler) {
      settGyldigeHjemler(innstillinger.aktiveHjemler);
    } else if (kodeverk.hjemmel) {
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
      if (innstillinger?.aktiveTyper) settGyldigeTyper(innstillinger.aktiveTyper);
      else settGyldigeTyper(typer);
    }
  }, [enheter, valgtEnhetIdx, kodeverk]);

  function skiftSortering(type: string, event: React.MouseEvent<HTMLElement | HTMLButtonElement>) {
    event.preventDefault();
    let sortOrder;
    let sortType;
    if (type === "frist") {
      sortType = "frist" as "frist";
      if (sorteringFrist === "synkende") {
        filter_dispatch({ type: "sett_frist", payload: "stigende" });
        sortOrder = "stigende" as "stigende";
      } else {
        filter_dispatch({ type: "sett_frist", payload: "synkende" as "synkende" });
        sortOrder = "synkende" as "synkende";
      }
    } else {
      sortType = "mottatt" as "mottatt";
      if (sorteringMottatt === "synkende") {
        filter_dispatch({ type: "sett_mottatt", payload: "stigende" as "stigende" });
        sortOrder = "stigende" as "stigende";
      } else {
        filter_dispatch({ type: "sett_mottatt", payload: "synkende" as "synkende" });
        sortOrder = "synkende" as "synkende";
      }
    }

    console.debug(
      "%chenter oppgaver basert på endring av sortering ",
      "background: #aa9; color: #222255"
    );
    dispatchTransformering({ sortType, sortOrder });
    filter_dispatch({ type: "sett_start", payload: 0 });
    history.push(location.pathname.replace(/\d+$/, "1"));
  }

  const skiftSorteringFrist = (event: React.MouseEvent<HTMLElement | HTMLButtonElement>) =>
    R.curry(skiftSortering)("frist")(event);
  const skiftSorteringMottatt = (event: React.MouseEvent<HTMLElement | HTMLButtonElement>) =>
    R.curry(skiftSortering)("mottatt")(event);

  function toValue<T>(filters: Array<string | string | Filter>) {
    return filters.map((filter: any) => filter.value);
  }

  const dispatchTransformering = ({
    sortType,
    sortOrder,
  }: {
    sortType: "frist" | "mottatt";
    sortOrder: "synkende" | "stigende";
  }) => {
    let ident = filter_state.ident;
    let enhetId = filter_state.enhetId;

    if (!filter_state.ident) {
      //todo dette er ikke riktig, ident skal ikke mangle
      //console.debug("%c mangler ident!", "background: #b00b55; color: #ffffff");
      ident = meg.id;
    }
    if (ident && enhetId) {
      console.debug(
        "%c -> kjører den faktisk oppgave-spørringen",
        "background: #222; color: #bada55"
      );
      dispatch(
        hentUtgatte({
          ident: ident,
          antall: filter_state.antall,
          start: filter_state.start || 0,
          enhetId: enhetId,
          projeksjon: filter_state?.projeksjon ? "UTVIDET" : undefined,
          tildeltSaksbehandler: filter_state.tildeltSaksbehandler,
          transformasjoner: {
            filtrering: {
              hjemler: toValue(filter_state.transformasjoner.filtrering.hjemler),
              typer: toValue(filter_state.transformasjoner.filtrering.typer),
              temaer: toValue(filter_state.transformasjoner.filtrering.temaer),
            },
            sortering: {
              type: sortType,
              frist:
                sortType === "frist" ? sortOrder : filter_state.transformasjoner.sortering.frist,
              mottatt:
                sortType === "mottatt"
                  ? sortOrder
                  : filter_state.transformasjoner.sortering.mottatt,
            },
          },
        })
      );
      dispatch(settOppgaverLaster());
      dispatch(
        oppgaveRequest({
          ident: ident,
          antall: filter_state.antall,
          start: filter_state.start || 0,
          enhetId: enhetId,
          ferdigstiltFom: undefined,
          projeksjon: filter_state?.projeksjon ? "UTVIDET" : undefined,
          tildeltSaksbehandler: filter_state.tildeltSaksbehandler,
          transformasjoner: {
            filtrering: {
              hjemler: toValue(filter_state.transformasjoner.filtrering.hjemler),
              typer: toValue(filter_state.transformasjoner.filtrering.typer),
              temaer: toValue(filter_state.transformasjoner.filtrering.temaer),
            },
            sortering: {
              type: sortType,
              frist:
                sortType === "frist" ? sortOrder : filter_state.transformasjoner.sortering.frist,
              mottatt:
                sortType === "mottatt"
                  ? sortOrder
                  : filter_state.transformasjoner.sortering.mottatt,
            },
          },
        })
      );
      location.pathname.startsWith("/mineoppgaver") &&
        dispatch(
          ferdigstilteRequest({
            ident: ident,
            antall: filter_state.antall,
            start: filter_state.start || 0,
            enhetId: enhetId,
            ferdigstiltFom: "2021-05-07",
            projeksjon: filter_state?.projeksjon ? "UTVIDET" : undefined,
            tildeltSaksbehandler: filter_state.tildeltSaksbehandler,
            transformasjoner: {
              filtrering: {
                hjemler: toValue(filter_state.transformasjoner.filtrering.hjemler),
                typer: toValue(filter_state.transformasjoner.filtrering.typer),
                temaer: toValue(filter_state.transformasjoner.filtrering.temaer),
              },
              sortering: {
                type: sortType,
                frist:
                  sortType === "frist" ? sortOrder : filter_state.transformasjoner.sortering.frist,
                mottatt:
                  sortType === "mottatt"
                    ? sortOrder
                    : filter_state.transformasjoner.sortering.mottatt,
              },
            },
          })
        );
    }
  };

  useEffect(() => {
    if (meg.id) {
      if (location.pathname.startsWith("/mineoppgaver")) {
        settVisFnr(true);
        filter_dispatch({ type: "sett_projeksjon", payload: true });
      } else {
        const tilgangEnabled = featureToggles.features.find((f) => f?.navn === "klage.listFnr");
        if (tilgangEnabled?.isEnabled !== undefined) {
          if (!location.pathname.startsWith("/mineoppgaver")) {
            settVisFnr(tilgangEnabled.isEnabled);
            filter_dispatch({ type: "sett_projeksjon", payload: tilgangEnabled.isEnabled });
          }
        } else {
          settVisFnr(false);
          filter_dispatch({ type: "sett_projeksjon", payload: false });
        }
      }
      if (location.pathname.startsWith("/mineoppgaver") && !filter_state.tildeltSaksbehandler) {
        filter_dispatch({ type: "sett_tildelt_saksbehandler", payload: meg.id });
      } else if (!location.pathname.startsWith("/mineoppgaver")) {
        filter_dispatch({ type: "sett_tildelt_saksbehandler", payload: undefined });
      }
    }
  }, [location, meg.id]);

  useEffect(() => {
    let filtre = {
      typer: {},
      temaer: {},
      hjemler: {},
    };
    const hjemler =
      (innstillinger?.aktiveHjemler &&
        innstillinger?.aktiveHjemler.map((hjemmel) => hjemmel.value as string)) ||
      [];
    if (hjemler.length) {
      filtre.hjemler = innstillinger?.aktiveHjemler || [];
      settHjemmelFilter(hjemler);
    } else {
      filtre.hjemler = [];
      settHjemmelFilter(undefined);
    }

    const typer =
      (innstillinger?.aktiveTyper &&
        innstillinger?.aktiveTyper.map((type) => type.value as string)) ||
      [];
    if (typer.length) {
      filtre.typer = innstillinger.aktiveTyper;
      settTypeFilter(typer);
    } else {
      filtre.typer = [];
      settTypeFilter(undefined);
    }

    const temaer =
      (innstillinger?.aktiveTemaer &&
        innstillinger?.aktiveTemaer.map((type) => type.value as string)) ||
      [];
    if (temaer.length) {
      filtre.temaer = innstillinger.aktiveTemaer;
      settTypeFilter(typer);
    } else {
      filtre.temaer = [];
      settTemaFilter(undefined);
    }

    filter_dispatch({ type: "sett_transformasjoner", payload: filtre });
  }, [innstillinger]);

  useEffect(() => {
    if (valgtOppgave.id) {
      dispatch(
        tildelMegHandling({
          oppgaveId: valgtOppgave.id,
          ident: meg.id,
          klagebehandlingVersjon: valgtOppgave.klagebehandlingVersjon,
          enhetId: enheter[valgtEnhetIdx].id,
        })
      );
    }
  }, [valgtOppgave.id]);

  useEffect(() => {
    if (
      !R.equals(forrigeHjemmelFilter, hjemmelFilter) ||
      !R.equals(forrigeTemaFilter, temaFilter) ||
      !R.equals(forrigeTypeFilter, typeFilter)
    ) {
      if (meg.id) {
        console.debug(
          "%chenter oppgaver basert på endring/setting av filter ",
          "background: #af7; color: #222255"
        );
        if (filter_state.transformasjoner.type === "frist")
          dispatchTransformering({
            sortType: filter_state.transformasjoner.sortering.type,
            sortOrder: filter_state.transformasjoner.sortering.frist,
          });
        else
          dispatchTransformering({
            sortType: filter_state.transformasjoner.sortering.type,
            sortOrder: filter_state.transformasjoner.sortering.mottatt,
          });
      }
    }
    settForrigeHjemmelFilter(hjemmelFilter);
    settForrigeTemaFilter(temaFilter);
    settForrigeTypeFilter(typeFilter);
  }, [hjemmelFilter, temaFilter, typeFilter]);

  useEffect(() => {
    if (filter_state.meta.kan_hente_oppgaver || start > -1) {
      //console.debug("%chenter oppgaver", "background: #222; color: #bada55");
      if (filter_state.transformasjoner.type === "frist")
        dispatchTransformering({
          sortType: filter_state.transformasjoner.sortering.type,
          sortOrder: filter_state.transformasjoner.sortering.frist,
        });
      else
        dispatchTransformering({
          sortType: filter_state.transformasjoner.sortering.type,
          sortOrder: filter_state.transformasjoner.sortering.mottatt,
        });
    }
  }, [start, filter_state.meta.kan_hente_oppgaver, meg, enheter]);

  useEffect(() => {
    const ny_start = (tolketStart - 1) * antall;
    settForrigeStart(filter_state.start);
    filter_dispatch({ type: "sett_start", payload: ny_start });
    settStart(ny_start);
    dispatchTransformering({
      sortType: filter_state.transformasjoner.sortering.type,
      sortOrder: filter_state.transformasjoner.sortering.mottatt,
    });
  }, [antall, tolketStart, forrigeSti, location.pathname]);

  const filtrerType = (filtre: Filter[]) => {
    if (!filtre.length) {
      settTypeFilter(undefined);
    } else {
      settTypeFilter(filtre.map((f) => f.value as string));
    }
    settStart(0);
    history.push(location.pathname.replace(/\d+$/, "1"));
  };

  const filtrerHjemmel = (filtre: Filter[]) => {
    if (!filtre.length) {
      settHjemmelFilter(undefined);
    } else {
      settHjemmelFilter(filtre.map((f) => f.value as string));
    }
    settStart(0);
    history.push(location.pathname.replace(/\d+$/, "1"));
  };
  const filtrerTema = (filtre: Filter[]) => {
    if (!filtre.length) {
      settTemaFilter(undefined);
    } else {
      settTemaFilter(filtre.map((f) => f.value as string));
    }
    settStart(0);
    history.push(location.pathname.replace(/\d+$/, "1"));
  };

  if (klagebehandlinger.meta.feilmelding) {
    return (
      <Feil>
        <h1>{klagebehandlinger.meta.feilmelding}</h1>
        <div>Vennligst forsøk igjen litt senere...</div>
      </Feil>
    );
  }
  if (sideLaster) {
    return (
      <div style={{ width: "100%", textAlign: "center", padding: 20 }}>
        <NavFrontendSpinner />
      </div>
    );
  }

  return (
    <>
      <table className={`Tabell tabell oppgaver tabell--stripet`} cellSpacing={0} cellPadding={10}>
        <thead>
          <tr>
            {visFilter && (
              <FiltrerbarHeader
                onFilter={(filter, velgAlleEllerIngen) =>
                  settFilter(
                    settTyper,
                    filter,
                    filter_state?.transformasjoner?.filtrering?.typer,
                    velgAlleEllerIngen
                  )
                }
                filtre={gyldigeTyper}
                dispatchFunc={filtrerType}
                aktiveFiltere={filter_state?.transformasjoner?.filtrering?.typer}
              >
                Type
              </FiltrerbarHeader>
            )}
            {!visFilter && <IkkeFiltrerbarHeader>Type</IkkeFiltrerbarHeader>}

            {visFilter && (
              <FiltrerbarHeader
                onFilter={(filter, velgAlleEllerIngen) =>
                  settFilter(
                    settTemaer,
                    filter,
                    filter_state?.transformasjoner?.filtrering?.temaer,
                    velgAlleEllerIngen
                  )
                }
                filtre={lovligeTemaer}
                dispatchFunc={filtrerTema}
                aktiveFiltere={filter_state?.transformasjoner.filtrering?.temaer}
              >
                Tema
              </FiltrerbarHeader>
            )}
            {!visFilter && <IkkeFiltrerbarHeader>Tema</IkkeFiltrerbarHeader>}

            {visFilter && (
              <FiltrerbarHeader
                onFilter={(filter, velgAlleEllerIngen) =>
                  settFilter(
                    settHjemler,
                    filter,
                    filter_state?.transformasjoner?.filtrering?.hjemler,
                    velgAlleEllerIngen
                  )
                }
                filtre={gyldigeHjemler}
                dispatchFunc={filtrerHjemmel}
                aktiveFiltere={filter_state?.transformasjoner.filtrering?.hjemler}
              >
                Hjemmel
              </FiltrerbarHeader>
            )}
            {!visFilter && <IkkeFiltrerbarHeader>Hjemmel</IkkeFiltrerbarHeader>}

            {(filter_state?.projeksjon === "UTVIDET" || visFnr) && <th>&nbsp;</th>}
            {(filter_state?.projeksjon === "UTVIDET" || visFnr) && <th>&nbsp;</th>}

            <th
              role="columnheader"
              aria-sort={sorteringFrist === "stigende" ? "ascending" : "descending"}
            >
              {visFilter && (
                <div
                  className={`sortHeader 
                ${filter_state.transformasjoner.sortering.type == "frist" ? "" : "inaktiv"}
                ${sorteringFrist === "stigende" ? "ascending" : "descending"}`}
                  onClick={skiftSorteringFrist}
                >
                  Frist
                </div>
              )}
              {!visFilter && <div>Frist</div>}
            </th>

            <th />
          </tr>
        </thead>
        <tbody>
          {genererTabellRader(
            settValgtOppgave,
            klagebehandlinger,
            filter_state?.projeksjon || visFnr
          )}

          {klagebehandlinger.meta.sider > 1 && (
            <tr>
              <td colSpan={visFnr ? 7 : 5}>
                <div className="table-lbl">
                  <div className="antall-saker">{visAntallTreff(klagebehandlinger)}</div>
                  <div className={"paginering"}>
                    <Paginering
                      startSide={tolketStart}
                      antallSider={klagebehandlinger.meta.sider}
                      pathname={pathname}
                    />
                  </div>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
      {location.pathname.startsWith("/mineoppgaver") && ferdigstilteKlager?.rader && (
        <FullforteOppgaver>
          <table
            className={`Tabell tabell oppgaver tabell--stripet`}
            cellSpacing={0}
            cellPadding={10}
          >
            <thead>
              <tr>
                <th colSpan={5}>Fullførte oppgaver siste 7 dager</th>
                <th>Fullført</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {ferdigstilteKlager.rader.length > 0 ? (
                genererTabellRader(
                  settValgtOppgave,
                  ferdigstilteKlager,
                  filter_state?.projeksjon || visFnr
                )
              ) : (
                <tr>
                  <td colSpan={7}>Ingen fullførte oppgaver</td>
                </tr>
              )}
            </tbody>
          </table>
        </FullforteOppgaver>
      )}

      {location.pathname.startsWith("/oppgaver") ? (
        <div style={{ margin: "1em 2em" }}>
          Antall oppgaver med utgåtte frister: {klagebehandlinger.meta.utgaatteFrister}
        </div>
      ) : null}
    </>
  );
}

export default OppgaveTabell;
