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
import Dokumenter from "./Dokumenter";
import NavFrontendSpinner from "nav-frontend-spinner";
import EksterneLenker from "./EksterneLenker";
import styled from "styled-components";
import { velgInnstillinger } from "../../tilstand/moduler/meg.velgere";

const Kontrollpanel = styled.div`
  display: flex;
  justify-content: space-between;
  margin: 0;
  padding: 0.5em;
  background: #f8f8f8;
`;

function UtarbeideVedtak() {
  return <>Utarbeide Vedtak</>;
}

function KvalitetsVurdering() {
  return <>Kvalitetsvurdering</>;
}

function Oppgave() {
  return <>Oppgave</>;
}

function ToggleKnapp({
  id,
  label,
  checked,
}: {
  id: string;
  label: string;
  checked: { checked?: boolean | undefined } | boolean;
}) {
  return (
    <label htmlFor="toggle" className="toggle-flex">
      <div className="toggle-container">
        {checked && (
          <input type="checkbox" id={id} defaultChecked={true} className="real-checkbox" />
        )}
        {!checked && <input type="checkbox" id={id} className="real-checkbox" />}
        <div className="toggle-button" />
      </div>
      <div className={"toggle-label"}>{label}</div>
    </label>
  );
}

export default function Klagebehandling() {
  const { klage_state, klage_dispatch } = klageReducer();
  const location = useLocation();
  const dispatch = useDispatch();
  const klage: IKlage = useSelector(velgKlage);
  const innstillinger = useSelector(velgInnstillinger);
  console.debug({ innstillinger });

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
    if (klage_state.oppgaveId != 0 && klage_state.oppgaveId.length > 0) {
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
    return (
      <div style={{ margin: "40vh auto 0 auto" }}>
        <NavFrontendSpinner />
      </div>
    );
  }

  if (klage.klageLastet && klage.klageLastingFeilet) {
    return (
      <Oppsett visMeny={false}>
        <div className="klagebehandling__informasjon" style={{ padding: "5em" }}>
          Klage kunne ikke hentes...
        </div>
      </Oppsett>
    );
  }

  return (
    <Oppsett visMeny={false} customClass={"bg_lysgraa"}>
      <>
        <Kontrollpanel>
          <div>FORNAVN ETTERNAVN {klage.foedselsnummer} </div>

          <ToggleKnapp
            id={"dokumenter"}
            label={"Dokumenter"}
            checked={innstillinger?.aktiveFaner?.dokumenter || true}
          />
          <ToggleKnapp
            id={"detaljer"}
            label={"Detaljer"}
            checked={innstillinger?.aktiveFaner?.detaljer || true}
          />
          <ToggleKnapp
            id={"vedtak"}
            label={"Vedtak"}
            checked={innstillinger?.aktiveFaner?.vedtak || false}
          />
          <EksterneLenker klage_state={klage_state} id={klage_state.oppgaveId} />
        </Kontrollpanel>

        {showDebug && <Debug state={klage} />}

        <Dokumenter />
      </>
    </Oppsett>
  );
}
