import React, { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import styled from "styled-components";
import qs from "qs";
import NavFrontendSpinner from "nav-frontend-spinner";
import Oppsett from "../Oppsett";
import "../../stilark/klagebehandling.less";
// @ts-ignore
import CloseSVG from "../cancel.svg";
// @ts-ignore
import HakeSVG from "../hake.svg";
import klageReducer from "../klage-reducer";
import { hentKlageHandling, IKlage } from "../../tilstand/moduler/klagebehandling";
import { velgKlage } from "../../tilstand/moduler/klagebehandlinger.velgere";
import KlagebehandlingKontainer from "./KlagebehandlingKontainer";
import EksterneLenker from "./EksterneLenker";
import { velgInnstillinger } from "../../tilstand/moduler/meg.velgere";
import { velgKodeverk } from "../../tilstand/moduler/oppgave.velgere";
import { useAppDispatch, useAppSelector } from "../../tilstand/konfigurerTilstand";

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
  height: 3em;

  @media screen and (max-width: 1400px) {
    height: 6.25em;
    grid-template-areas:
      "Person Person Knapper Knapper"
      "Toggles Toggles Toggles Toggles";
  }

  @media screen and (max-width: 950px) {
    height: 6.25em;
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
const Kjonn = styled.span`
  font-weight: bold;
  padding-right: 0.1em;
  background: #ba3a26;
  border-radius: 50%;
  width: 1.3em;
  height: 1.3em;
  color: white;
  justify-content: center;
  display: inline-flex;
  margin: 0 0.25em 0 0;
`;
const Personnummer = styled.span`
  padding-left: 0.1em;
`;
const SjekkboksLabel = styled.div`
  z-index: 5;
`;

const HorisontalGrid = styled.div`
  display: grid;
  template-area-rows: 1fr 1fr;
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

function fornavn(klage: Partial<IKlage>) {
  if (klage.sakenGjelderNavn?.fornavn) {
    return klage.sakenGjelderNavn.fornavn;
  }
  return "";
}

function etternavn(klage: Partial<IKlage>) {
  if (klage.sakenGjelderNavn?.etternavn) {
    return klage.sakenGjelderNavn.etternavn.padStart(1, " ");
  }
  return "";
}

function mellomnavn(klage: Partial<IKlage>) {
  if (klage.sakenGjelderNavn?.mellomnavn) {
    return klage.sakenGjelderNavn.mellomnavn.padStart(1, " ");
  }
  return "";
}

export interface IFaner {
  detaljer: {
    checked: boolean;
  };
  dokumenter: {
    checked: boolean;
  };
  vedtak: {
    checked: boolean;
  };
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
      <div className="toggle-kontainer">
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
  const dispatch = useAppDispatch();
  const klage: IKlage = useAppSelector(velgKlage);
  const kodeverk = useAppSelector(velgKodeverk);
  const innstillinger = useAppSelector(velgInnstillinger);

  const [kodeverkLaster, settKodeverkLaster] = useState<boolean>(true);

  function toggleFane(id: string) {
    settAktiveFaner({
      ...faner,
      [id]: {
        checked: !faner[id].checked,
      },
    });
  }

  const [faner, settAktiveFaner] = useState<IFaner>({
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

  useEffect(() => {
    settKodeverkLaster(Object.keys(kodeverk).length === 0);
  }, [kodeverk]);

  if (!klage_state.oppgaveId || !klage.klageLastet) {
    return (
      <div style={{ margin: "40vh auto 0 auto" }}>
        <NavFrontendSpinner />
      </div>
    );
  }

  if (klage.klageLastet && klage.klageLastingFeilet) {
    return (
      <Oppsett backLink={"/mineoppgaver"} visMeny={false}>
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
    <Oppsett
      backLink={"/mineoppgaver"}
      visMeny={false}
      customClass={"bg_lysgraa"}
      contentClass={"uten-nav"}
    >
      <>
        <Kontrollpanel>
          <Person>
            <Kjonn>{klage?.sakenGjelderKjoenn[0]}</Kjonn>
            <Navn>{`${fornavn(klage)} ${mellomnavn(klage)} ${etternavn(klage)}`}</Navn>
            <span>/</span>
            <Personnummer>{klage.sakenGjelderFoedselsnummer}</Personnummer>
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

        <KlagebehandlingKontainer faner={faner} />
      </>
    </Oppsett>
  );
}
