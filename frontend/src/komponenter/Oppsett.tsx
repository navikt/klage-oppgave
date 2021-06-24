import React, { useEffect, useState } from "react";
import { Header } from "./Header/Header";
import Alertstripe from "nav-frontend-alertstriper";
import { useSelector } from "react-redux";
import PropTypes from "prop-types";
import { NavLink } from "react-router-dom";
import { velgMeg } from "../tilstand/moduler/meg.velgere";
import { velgFeatureToggles } from "../tilstand/moduler/unleash.velgere";
import { velgToaster, velgToasterMelding } from "../tilstand/moduler/toaster.velgere";
import { velgExpire } from "../tilstand/moduler/token.velgere";
import { hentFeatureToggleHandling } from "../tilstand/moduler/unleash";
import NavFrontendSpinner from "nav-frontend-spinner";
import { hentExpiry } from "../tilstand/moduler/token";
import { toasterSkjul } from "../tilstand/moduler/toaster";
import { useAppDispatch } from "../tilstand/konfigurerTilstand";
import { hentKodeverk } from "../tilstand/moduler/kodeverk";
import { velgKodeverk } from "../tilstand/moduler/kodeverk.velgere";
import { hentMegHandling, hentMegUtenEnheterHandling } from "../tilstand/moduler/meg";
import isDev from "../utility/isDev";

const R = require("ramda");

interface LayoutType {
  visMeny: boolean;
  backLink?: string;
  customClass?: string;
  contentClass?: string;
  children: JSX.Element[] | JSX.Element;
}

export default function Oppsett({
  visMeny,
  backLink,
  customClass,
  contentClass,
  children,
}: LayoutType) {
  const person = useSelector(velgMeg);
  const visFeilmelding = useSelector(velgToaster);
  const expireTime = useSelector(velgExpire);
  const feilmelding = useSelector(velgToasterMelding);
  const featureToggles = useSelector(velgFeatureToggles);
  const kodeverk = useSelector(velgKodeverk);
  const dispatch = useAppDispatch();
  const [generellTilgang, settTilgang] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    dispatch(hentFeatureToggleHandling("klage.generellTilgang"));
    dispatch(hentFeatureToggleHandling("klage.admin"));
    dispatch(hentFeatureToggleHandling("klage.listFnr"));

    //sjekk innlogging
    dispatch(hentExpiry());
    if (R.empty(kodeverk)) {
      dispatch(hentKodeverk());
    }
  }, [dispatch, hentKodeverk, hentFeatureToggleHandling]);
  useEffect(() => {
    const interval = setInterval(() => {
      let expiration = expireTime;
      if (expiration) {
        const now = Math.round(new Date().getTime() / 1000);
        if (Number(expiration) < now) {
          // @ts-ignore
          window.location = "/login";
        }
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const adminEnabled = featureToggles.features.find((f) => f?.navn === "klage.admin");
  const tilgangEnabled = featureToggles.features.find((f) => f?.navn === "klage.generellTilgang");

  useEffect(() => {
    if (adminEnabled !== undefined) {
      if (adminEnabled.isEnabled) {
        if (isDev()) dispatch(hentMegHandling());
        else dispatch(hentMegUtenEnheterHandling());
      } else {
        dispatch(hentMegHandling());
      }
    }
  }, [adminEnabled]);

  useEffect(() => {
    const tilgangEnabled = featureToggles.features.find((f) => f?.navn === "klage.generellTilgang");
    if (tilgangEnabled?.isEnabled !== undefined) {
      settTilgang(tilgangEnabled.isEnabled);
    }
  }, [tilgangEnabled]);
  if (generellTilgang === undefined) {
    return <NavFrontendSpinner />;
  }
  if (!generellTilgang) {
    return <div>Beklager, men din bruker har ikke tilgang til denne siden</div>;
  }
  if (R.isEmpty(kodeverk) || R.isEmpty(person.id)) {
    return <NavFrontendSpinner />;
  }

  return (
    <>
      <main className={`main kontainer ${customClass}`} data-testid="klagesiden">
        <Header
          backLink={backLink ?? "/"}
          tittel="KABAL"
          brukerinfo={{ navn: person.navn, ident: person.id }}
        >
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
              <NavLink className="link" to="/sok">
                Søk&nbsp;på&nbsp;person
              </NavLink>
            </li>
          </ul>
        </nav>
        <div className={`toaster ${visFeilmelding.display ? "active" : ""}`}>
          {visFeilmelding.display && (
            <Alertstripe onClick={() => dispatch(toasterSkjul())} type={visFeilmelding.type}>
              <span>{feilmelding}</span>
            </Alertstripe>
          )}
        </div>
        <article className={`content ${contentClass}`}>{children}</article>
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
