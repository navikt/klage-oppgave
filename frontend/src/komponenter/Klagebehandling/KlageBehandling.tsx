import React, { useEffect, useReducer, useState } from "react";
import Oppsett from "../Oppsett";
import "../../stilark/klagebehandling.less";
// @ts-ignore
import CloseSVG from "../cancel.svg";
// @ts-ignore
import HakeSVG from "../hake.svg";

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
import Detaljer from "./Detaljer";

const IkonHake = styled.img`
  position: absolute;
  display: ${(props) => props.theme.display};
  margin: 0.25em 0 0 -2em;
  -webkit-transition: all 0.4s ease-in-out;
  transition: all 0.4s ease-in-out;
`;
const IkonLukk = styled.img`
  position: absolute;
  display: ${(props) => props.theme.display};
  margin: 0.25em 0 0 0.2em;
  -webkit-transition: all 0.4s ease-in-out;
  transition: all 0.4s ease-in-out;
`;

const Kontrollpanel = styled.div`
  display: grid;
  background: #f8f8f8;
  grid-template-columns: repeat(4, 1fr);
  grid-template-areas: "Person Toggles Toggles Knapper";

  @media screen and (max-width: 1400px) {
    grid-template-areas:
      "Person Person Knapper Knapper"
      "Toggles Toggles Toggles Toggles";
  }

  @media screen and (max-width: 950px) {
    grid-template-areas:
      "Person Knapper Knapper Knapper"
      "Toggles Toggles Toggles Toggles";
  }
`;

const Knapper = styled.div`
  display: flex;
  grid-area: Toggles;
  justify-content: space-between;
  max-width: 35em;
  justify-self: center;
  @media screen and (max-width: 1400px) {
    justify-content: flex-start;
    justify-self: flex-start;
  }
`;
const Person = styled.div`
  border: 1px solid #e7e9e9;
  border-left: 0;
  grid-area: Person;
  border-bottom: 0;
  border-top: 0;
  margin: 0.5em 1em;
  white-space: nowrap;
  padding: 0.5em 1em;
  @media screen and (max-width: 1400px) {
    padding: 0.5em 0 0 0;
    border: none;
  }
`;
const Navn = styled.span`
  font-weight: bold;
  padding-right: 0.1em;
`;
const Personnummer = styled.span`
  padding-left: 0.1em;
`;
const SjekkboksLabel = styled.div`
  z-index: 5;
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

const FeilmeldingInformasjon = styled.div`
  background-color: #f8f8f8;
  display: flex;
  height: 4em;
  font-size: 1.1em;
  justify-content: space-between;

  &.rad {
    margin-top: 1.5em;
    padding: 0 0 0 1em;
  }
`;

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
    <label htmlFor="toggle" className="toggle-flex" onClick={() => clickFn(id)}>
      <div className="toggle-container">
        <input
          type="checkbox"
          readOnly={true}
          checked={faner[id].checked}
          id={id}
          className="real-checkbox"
        />
        <div className="toggle-button">
          <IkonHake
            alt="Slå av fane"
            src={HakeSVG}
            theme={{ display: faner[id].checked ? "unset" : "none" }}
          />
          <IkonLukk
            alt="Slå på fane"
            src={CloseSVG}
            theme={{ display: !faner[id].checked ? "unset" : "none" }}
          />
        </div>
      </div>
      <SjekkboksLabel className={`toggle-label ${faner[id].checked ? "fet" : ""}`}>
        {label}
      </SjekkboksLabel>
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
      checked: innstillinger?.aktiveFaner?.detaljer?.checked || false,
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
        checked: innstillinger?.aktiveFaner?.detaljer?.checked || false,
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
        <FeilmeldingInformasjon className="klagebehandling__informasjon" style={{ padding: "5em" }}>
          <div>Klage kunne ikke hentes...</div>
          <div>
            <NavLink to={"/mineoppgaver"}>Tilbake til Mine Oppgaver</NavLink>
          </div>
        </FeilmeldingInformasjon>
      </Oppsett>
    );
  }

  return (
    <Oppsett visMeny={false} customClass={"bg_lysgraa"}>
      <>
        <Kontrollpanel>
          <Person>
            <Navn>FORNAVN ETTERNAVN</Navn>
            <span>/</span>
            <Personnummer>{klage.foedselsnummer}</Personnummer>
          </Person>

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

        <Dokumenter skjult={!faner.dokumenter.checked} />
        <Detaljer skjult={!faner.detaljer.checked} />
      </>
    </Oppsett>
  );
}
