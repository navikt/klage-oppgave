import React, { useEffect, useState } from "react";
import { Header } from "./Header/Header";
import Alertstripe from "nav-frontend-alertstriper";

interface LayoutType {
  visMeny: boolean;
  children: JSX.Element;
}

import { useDispatch, useSelector } from "react-redux";
import PropTypes from "prop-types";
import { NavLink, useHistory, useLocation } from "react-router-dom";
import { velgMeg } from "../tilstand/moduler/meg.velgere";
import { velgFeatureToggles } from "../tilstand/moduler/unleash.velgere";

import { velgToaster, velgToasterMelding } from "../tilstand/moduler/toaster.velgere";
import { hentFeatureToggleHandling } from "../tilstand/moduler/unleash";
import NavFrontendSpinner from "nav-frontend-spinner";
import axios from "axios";

export default function Oppsett({ visMeny, children }: LayoutType) {
  const person = useSelector(velgMeg);
  const visFeilmelding = useSelector(velgToaster);
  const feilmelding = useSelector(velgToasterMelding);
  const featureToggles = useSelector(velgFeatureToggles);
  const dispatch = useDispatch();
  const [generellTilgang, settTilgang] = useState<boolean | undefined>(undefined);
  const history = useHistory();

  useEffect(() => {
    dispatch(hentFeatureToggleHandling("klage.generellTilgang"));

    //sjekk innlogging
    axios.get("/internal/token_expiration").then((response) => {
      localStorage.setItem("tokenExpire", response.data.toString());
    });
  }, []);
  useEffect(() => {
    const interval = setInterval(() => {
      let fiftyNineMinutes = 3540;
      let expiration = localStorage.getItem("tokenExpire");
      const now = Math.round(new Date().getTime() / 1000) + fiftyNineMinutes;
      if (Number(expiration) < now) {
        history.push("/login");
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const tilgangEnabled = featureToggles.features.find((f) => f?.navn === "klage.generellTilgang");
    if (tilgangEnabled?.isEnabled !== undefined) {
      settTilgang(tilgangEnabled.isEnabled);
    }
  }, [featureToggles]);

  if (generellTilgang === undefined) {
    return <NavFrontendSpinner />;
  } else if (!generellTilgang) {
    return <div>Beklager, men din bruker har ikke tilgang til denne siden</div>;
  }
  return (
    <>
      <main className="main container" data-testid="klagesiden">
        <Header tittel="KABAL" brukerinfo={{ navn: person.navn, ident: person.id }}>
          {/* <Sok onSok={() => Promise.resolve("test")} /> */}
        </Header>
        <nav className={`main-nav ${!visMeny ? "skjult" : ""}`} role="navigation" aria-label="Meny">
          <ul>
            <li>
              <NavLink className="link" to="/oppgaver">
                Oppgaver
              </NavLink>
            </li>
            <li>
              <NavLink className="link" to="/mineoppgaver">
                Mine&nbsp;Oppgaver
              </NavLink>
            </li>
            <li>
              <NavLink className="link" to="/innstillinger">
                Innstillinger
              </NavLink>
            </li>
          </ul>
        </nav>
        <div className={`toaster ${visFeilmelding ? "active" : ""}`}>
          {visFeilmelding && (
            <Alertstripe type="feil">
              <span>{feilmelding}</span>
            </Alertstripe>
          )}
        </div>
        <article className="content">{children}</article>
      </main>
      <footer className="main-footer">Klagesaksbehandling</footer>
    </>
  );
}

Oppsett.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.element),
    PropTypes.element.isRequired,
  ]),
};
