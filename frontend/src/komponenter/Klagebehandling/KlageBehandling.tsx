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

const Knapper = styled.div`
  display: flex;
  justify-content: space-between;
  margin: 0.5em 0 0.2em 0;
`;
const Person = styled.div`
  display: block;
  margin: 0.5em 0 0.2em 0;
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
  clickFn,
  label,
  faner,
}: {
  id: string;
  clickFn: Function;
  label: string;
  faner: any;
}) {
  return (
    <label htmlFor="toggle" className="toggle-flex">
      <div className="toggle-container" onClick={() => clickFn(id)}>
        <input
          type="checkbox"
          readOnly={true}
          checked={faner[id].checked}
          id={id}
          className="real-checkbox"
        />
        <div className="toggle-button" />
      </div>
      <div className={`toggle-label ${faner[id].checked ? "fet" : ""}`}>{label}</div>
    </label>
  );
}

export default function Klagebehandling() {
  const { klage_state, klage_dispatch } = klageReducer();
  const location = useLocation();
  const dispatch = useDispatch();
  const klage: IKlage = useSelector(velgKlage);
  const innstillinger = useSelector(velgInnstillinger);

  function toggleFane(id: string) {
    settAktiveFaner({
      ...faner,
      [id]: {
        checked: !faner[id].checked,
      },
    });
  }

  const [faner, settAktiveFaner] = useState({
    detaljer: {
      checked: innstillinger?.aktiveFaner?.detaljer?.checked || true,
    },
    dokumenter: {
      checked: innstillinger?.aktiveFaner?.dokumenter?.checked || true,
    },
    vedtak: {
      checked: innstillinger?.aktiveFaner?.vedtak?.checked || true,
    },
  });

  const [showDebug, setDebug] = useState(false);
  useEffect(() => {
    document.addEventListener("keydown", (e) => {
      if (e.ctrlKey && e.key === "D") {
        setDebug(!showDebug);
      }
    });
  });

  useEffect(() => {
    settAktiveFaner({
      detaljer: {
        checked: innstillinger?.aktiveFaner?.detaljer?.checked || true,
      },
      dokumenter: {
        checked: innstillinger?.aktiveFaner?.dokumenter?.checked || true,
      },
      vedtak: {
        checked: innstillinger?.aktiveFaner?.vedtak?.checked || true,
      },
    });
  }, [innstillinger?.aktiveFaner]);

  useEffect(() => {
    console.debug({ faner });
  }, [faner]);

  useEffect(() => {
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
          <Person>FORNAVN ETTERNAVN {klage.foedselsnummer} </Person>

          <Knapper>
            <ToggleKnapp
              id={"dokumenter"}
              label={"Dokumenter"}
              clickFn={() => toggleFane("dokumenter")}
              faner={faner}
            />
            <ToggleKnapp
              id={"detaljer"}
              label={"Detaljer"}
              clickFn={() => toggleFane("detaljer")}
              faner={faner}
            />
            <ToggleKnapp
              id={"vedtak"}
              label={"Fullfør vedtak"}
              clickFn={() => toggleFane("vedtak")}
              faner={faner}
            />
          </Knapper>

          <EksterneLenker klage_state={klage_state} id={klage_state.oppgaveId} />
        </Kontrollpanel>

        {showDebug && <Debug state={klage} />}

        <Dokumenter />
      </>
    </Oppsett>
  );
}
