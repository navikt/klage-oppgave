import React, { useEffect, useReducer, useState } from "react";
import Oppsett from "../Oppsett";
import "../../stilark/klagebehandling.less";
import { NavLink, useLocation, useParams } from "react-router-dom";
import klageReducer, { IKlageState } from "../klage-reducer";
import qs from "qs";
import { useDispatch, useSelector } from "react-redux";
import { hentKlageHandling, IKlage } from "../../tilstand/moduler/klagebehandling";
import { velgKlage } from "../../tilstand/moduler/klagebehandlinger.velgere";
import Debug from "../Tabell/Debug";
import KlageMeny from "./KlageMeny";
import Klagen from "./Klagen";
import Dokumenter from "./Dokumenter";
import NavFrontendSpinner from "nav-frontend-spinner";

function UtarbeideVedtak() {
  return <>Utarbeide Vedtak</>;
}

function KvalitetsVurdering() {
  return <>Kvalitetsvurdering</>;
}

function Oppgave() {
  return <>Oppgave</>;
}

export default function Klagebehandling() {
  const { klage_state, klage_dispatch } = klageReducer();
  const location = useLocation();
  const dispatch = useDispatch();
  const klage: IKlage = useSelector(velgKlage);

  const [showDebug, setDebug] = useState(false);
  useEffect(() => {
    document.addEventListener("keydown", (e) => {
      if (e.ctrlKey && e.key === "D") {
        setDebug(!showDebug);
      }
    });
  });

  useEffect(() => {
    console.debug("henter", klage_state.oppgaveId);
    if (klage_state.oppgaveId.length > 0) {
      dispatch(hentKlageHandling(klage_state.oppgaveId));
    }
  }, [klage_state.oppgaveId]);

  useEffect(() => {
    const params = qs.parse(location.pathname);
    let loc = location.pathname.split("/");
    let id = loc[2].split("&")[0];
    if (id) klage_dispatch({ type: "sett_oppgave_id", payload: id });
    if (params.side) klage_dispatch({ type: "sett_aktiv_side", payload: params.side });
  }, [location]);

  if (!klage_state.oppgaveId || !klage.klageLastet) {
    return <NavFrontendSpinner />;
  }

  return (
    <Oppsett visMeny={false}>
      <>
        <div className="klagebehandling__informasjon">
          <div className="rad">FORNAVN ETTERNAVN {klage.foedselsnummer} </div>
        </div>

        {showDebug && <Debug state={klage} />}

        <KlageMeny klage_state={klage_state} id={klage_state.oppgaveId} />

        {klage_state.aktivSide === "klagen" && <Klagen />}
        {klage_state.aktivSide === "dokumenter" && <Dokumenter />}
        {klage_state.aktivSide === "utarbeidevedtak" && <UtarbeideVedtak />}
        {klage_state.aktivSide === "kvalitetsvurdering" && <KvalitetsVurdering />}
        {klage_state.aktivSide === "oppgave" && <Oppgave />}
      </>
    </Oppsett>
  );
}
