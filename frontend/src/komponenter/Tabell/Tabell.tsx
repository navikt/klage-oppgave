import { Filter, oppgaveRequest, temaType } from "../../tilstand/moduler/oppgave";
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
import { GyldigeHjemler } from "../../domene/filtre";
import { hentFeatureToggleHandling } from "../../tilstand/moduler/unleash";
import { velgFeatureToggles } from "../../tilstand/moduler/unleash.velgere";
import filterReducer from "./filterReducer";
import Debug from "./Debug";

const R = require("ramda");

const OppgaveTabell: React.FunctionComponent = () => {
  const dispatch = useDispatch();
  const meg = useSelector(velgMeg);
  const sideLaster = useSelector(velgSideLaster);
  const oppgaver = useSelector(velgOppgaver);
  const forrigeSti = useSelector(velgForrigeSti);
  const utvidetProjeksjon = useSelector(velgProjeksjon);
  const location = useLocation();

  const [showDebug, setDebug] = useState(false);
  useEffect(() => {
    document.addEventListener("keydown", (e) => {
      if (e.ctrlKey && e.key === "D") {
        setDebug(!showDebug);
      }
    });
  });

  interface ParamTypes {
    side: string | undefined;
  }

  let { side } = useParams<ParamTypes>();
  let tolketStart = parseInt(side as string, 10) || 1;

  const [forrigeStart, settForrigeStart] = useState<number>(1);

  const [hjemmelFilter, settHjemmelFilter] = useState<string[] | undefined>(undefined);
  const [forrigeHjemmelFilter, settForrigeHjemmelFilter] = useState<string[] | undefined>(
    undefined
  );

  const [temaFilter, settTemaFilter] = useState<temaType[] | undefined>(undefined);
  const [forrigeTemaFilter, settForrigeTemaFilter] = useState<temaType[] | undefined>(undefined);
  const [lovligeTemaer, settLovligeTemaer] = useState<Filter[]>([]);

  const [typeFilter, settTypeFilter] = useState<string[] | undefined>(undefined);
  const [forrigeTypeFilter, settForrigeTypeFilter] = useState<string[] | undefined>(undefined);

  const [valgtOppgave, settValgtOppgave] = useState<valgtOppgaveType>({ id: "", versjon: 0 });

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

  /** NAVIDENT
   * Vi ønsker å hente oppgaver når NAVIDENT og EnhetsID er satt
   */
  useEffect(() => {
    if (meg.id) {
      filter_dispatch({ type: "sett_navident", payload: meg });
    }
  }, [meg]);

  /** UTVIDET PROJEKSJON
   * Med dette flagget kommer det persondata fra klage-oppgave-API. Dette skal skrus
   * på for "MINE OPPGAVER" og dersom det er skrudd på i featuretoggles.
   */
  const [visFnr, settVisFnr] = useState<boolean>(false);
  useEffect(() => {
    dispatch(hentFeatureToggleHandling("klage.listFnr"));
  }, []);
  useEffect(() => {
    filter_dispatch({ type: "sett_projeksjon", payload: utvidetProjeksjon });
  }, [utvidetProjeksjon]);

  useEffect(() => {
    const tilgangEnabled = featureToggles.features.find((f) => f?.navn === "klage.listFnr");
    if (tilgangEnabled?.isEnabled !== undefined) {
      settVisFnr(tilgangEnabled.isEnabled);
      filter_dispatch({ type: "sett_projeksjon", payload: tilgangEnabled.isEnabled });
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
    let lovligeTemaer = [{ label: "Sykepenger", value: "Sykepenger" } as Filter];
    if (enheter.length > 0) {
      enheter[valgtEnhetIdx].lovligeTemaer?.forEach((tema: temaType | any) => {
        if (tema !== "Sykepenger") lovligeTemaer.push({ label: tema, value: tema });
      });
    }
    settLovligeTemaer(lovligeTemaer);
  }, [enheter, valgtEnhetIdx]);

  function skiftSortering(event: React.MouseEvent<HTMLElement | HTMLButtonElement>) {
    event.preventDefault();
    if (sorteringFrist === "synkende") {
      filter_dispatch({ type: "sett_frist", payload: "stigende" });
    } else {
      filter_dispatch({ type: "sett_frist", payload: "synkende" });
    }
    console.debug(
      "%chenter oppgaver basert på endring av sortering ",
      "background: #aa9; color: #222255"
    );
    dispatchTransformering();
    filter_dispatch({ type: "sett_start", payload: 0 });
    history.push(location.pathname.replace(/\d+$/, "1"));
  }

  function toValue<T>(filters: Array<string | temaType | Filter>) {
    return filters.map((filter: any) => filter.value);
  }

  const dispatchTransformering = () => {
    console.debug(
      "%c -> kjører den faktisk oppgave-spørringen",
      "background: #222; color: #bada55"
    );
    return dispatch(
      oppgaveRequest({
        ident: filter_state.ident,
        antall: filter_state.antall,
        start: filter_state.start || 0,
        enhetId: filter_state?.enhetId,
        projeksjon: filter_state?.projeksjon ? "UTVIDET" : undefined,
        tildeltSaksbehandler: filter_state.tildeltSaksbehandler,
        transformasjoner: {
          filtrering: {
            hjemler: toValue(filter_state.transformasjoner.filtrering.hjemler),
            typer: toValue(filter_state.transformasjoner.filtrering.typer),
            temaer: toValue(filter_state.transformasjoner.filtrering.temaer),
          },
          sortering: {
            frist: filter_state.transformasjoner.sortering.frist,
          },
        },
      })
    );
  };
  useEffect(() => {
    if (meg.id) {
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
        innstillinger?.aktiveTemaer.map((type) => type.value as temaType)) ||
      [];
    if (temaer.length) {
      filtre.temaer = (innstillinger?.aktiveTemaer ?? [])
        .filter((tema: Filter) => tema.label !== "Sykepenger")
        .concat([{ label: "Sykepenger", value: "Sykepenger" }]);
      settTemaFilter(temaer);
    } else {
      filtre.temaer = [{ label: "Sykepenger", value: "Sykepenger" }];
      settTemaFilter(["Sykepenger" as temaType]);
    }
    filter_dispatch({ type: "sett_transformasjoner", payload: filtre });
  }, [innstillinger]);

  useEffect(() => {
    if (valgtOppgave.id) {
      dispatch(
        tildelMegHandling({
          oppgaveId: valgtOppgave.id,
          ident: meg.id,
          versjon: valgtOppgave.versjon,
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
        dispatchTransformering();
      }
    }
    settForrigeHjemmelFilter(hjemmelFilter);
    settForrigeTemaFilter(temaFilter);
    settForrigeTypeFilter(typeFilter);
  }, [hjemmelFilter, temaFilter, typeFilter]);

  useEffect(() => {
    if (filter_state.meta.kan_hente_oppgaver || start > 1)
      console.debug("%chenter fordi start har endret seg", "background: #222; color: #bada55");
    if (filter_state.meta.kan_hente_oppgaver) dispatchTransformering();
  }, [start, filter_state.meta.kan_hente_oppgaver]);

  useEffect(() => {
    const ny_start = (tolketStart - 1) * antall;
    settForrigeStart(filter_state.start);
    filter_dispatch({ type: "sett_start", payload: ny_start });
    settStart(ny_start);
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
      settTemaFilter(filtre.map((f) => f.value as temaType));
    }
    settStart(0);
    history.push(location.pathname.replace(/\d+$/, "1"));
  };

  if (oppgaver.meta.feilmelding) {
    return (
      <div className={"feil"}>
        <h1>{oppgaver.meta.feilmelding}</h1>
        <div>Vennligst forsøk igjen litt senere...</div>
      </div>
    );
  }
  if (sideLaster) {
    return (
      <div style={{ width: "100%", textAlign: "center", padding: 20 }}>
        {showDebug && <Debug state={filter_state} />}
        <NavFrontendSpinner />
      </div>
    );
  }

  return (
    <>
      {showDebug && <Debug state={filter_state} />}

      <table className={`Tabell tabell oppgaver tabell--stripet`} cellSpacing={0} cellPadding={10}>
        <thead>
          <tr>
            <FiltrerbarHeader
              onFilter={(filter, velgAlleEllerIngen) =>
                settFilter(
                  settTyper,
                  filter,
                  filter_state?.transformasjoner?.filtrering?.typer,
                  velgAlleEllerIngen
                )
              }
              filtre={[
                { label: "Klage", value: "Klage" },
                { label: "Anke", value: "Anke" },
                { label: "Feilutbetaling", value: "Feilutbetaling" },
              ]}
              dispatchFunc={filtrerType}
              aktiveFiltere={filter_state?.transformasjoner?.filtrering?.typer}
            >
              Type
            </FiltrerbarHeader>

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

            <FiltrerbarHeader
              onFilter={(filter, velgAlleEllerIngen) =>
                settFilter(
                  settHjemler,
                  filter,
                  filter_state?.transformasjoner?.filtrering?.hjemler,
                  velgAlleEllerIngen
                )
              }
              filtre={GyldigeHjemler}
              dispatchFunc={filtrerHjemmel}
              aktiveFiltere={filter_state?.transformasjoner.filtrering?.hjemler}
            >
              Hjemmel
            </FiltrerbarHeader>

            {(filter_state?.projeksjon === "UTVIDET" || visFnr) && <th>&nbsp;</th>}
            {(filter_state?.projeksjon === "UTVIDET" || visFnr) && <th>&nbsp;</th>}

            <th
              role="columnheader"
              aria-sort={sorteringFrist === "stigende" ? "ascending" : "descending"}
            >
              <div
                className={`sortHeader ${
                  sorteringFrist === "stigende" ? "ascending" : "descending"
                }`}
                onClick={skiftSortering}
              >
                Frist
              </div>
            </th>
            <th />
          </tr>
        </thead>
        <tbody>
          {genererTabellRader(settValgtOppgave, oppgaver, filter_state?.projeksjon || visFnr)}
          <tr>
            <td colSpan={visFnr ? 8 : 6}>
              <div className="table-lbl">
                <div className="antall-saker">{visAntallTreff(oppgaver)}</div>
                <div className={"paginering"}>
                  <Paginering
                    startSide={tolketStart}
                    antallSider={oppgaver.meta.sider}
                    pathname={pathname}
                  />
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </>
  );
};

export default OppgaveTabell;
