import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import * as R from "ramda";
import PropTypes from "prop-types";
import Alertstripe from "nav-frontend-alertstriper";
import NavFrontendSpinner from "nav-frontend-spinner";
import { Header } from "./Header/Header";
import { velgMeg } from "../tilstand/moduler/meg.velgere";
import { velgFeatureToggles } from "../tilstand/moduler/unleash.velgere";
import { velgToaster, velgToasterMelding } from "../tilstand/moduler/toaster.velgere";
import { velgExpire } from "../tilstand/moduler/token.velgere";
import { hentFeatureToggleHandling } from "../tilstand/moduler/unleash";
import { hentExpiry } from "../tilstand/moduler/token";
import { kodeverkRequest } from "../tilstand/moduler/oppgave";
import { velgKodeverk } from "../tilstand/moduler/oppgave.velgere";
import { useAppDispatch, useAppSelector } from "../tilstand/konfigurerTilstand";

interface LayoutType {
  visMeny: boolean;
  backLink?: string;
  customClass?: string;
  contentClass?: string;
  children: JSX.Element;
}

export default function Oppsett({
  visMeny,
  backLink,
  customClass,
  contentClass,
  children,
}: LayoutType) {
  const person = useAppSelector(velgMeg);
  const visFeilmelding = useAppSelector(velgToaster);
  const expireTime = useAppSelector(velgExpire);
  const feilmelding = useAppSelector(velgToasterMelding);
  const featureToggles = useAppSelector(velgFeatureToggles);
  const kodeverk = useAppSelector(velgKodeverk);
  const dispatch = useAppDispatch();
  const [generellTilgang, settTilgang] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    dispatch(hentFeatureToggleHandling("klage.generellTilgang"));
    dispatch(hentFeatureToggleHandling("klage.admin"));
    //sjekk innlogging
    dispatch(hentExpiry());
    dispatch(kodeverkRequest());
  }, []);
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

  useEffect(() => {
    const tilgangEnabled = featureToggles.features.find((f) => f?.navn === "klage.generellTilgang");
    if (tilgangEnabled?.isEnabled !== undefined) {
      settTilgang(tilgangEnabled.isEnabled);
    }
  }, [featureToggles]);
  if (generellTilgang === undefined) {
    return <NavFrontendSpinner />;
  }
  if (!generellTilgang) {
    return <div>Beklager, men din bruker har ikke tilgang til denne siden</div>;
  }
  if (R.isEmpty(kodeverk)) {
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
          </ul>
        </nav>
        <div className={`toaster ${visFeilmelding.display ? "active" : ""}`}>
          {visFeilmelding.display && (
            <Alertstripe type={visFeilmelding.type}>
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
