import React, { ReactNode, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { NavLink, useHistory } from "react-router-dom";
import classNames from "classnames";
import IkonSystem from "./icons/IkonSystem";
import "./Header.less";
import { velgMeg } from "../../tilstand/moduler/meg.velgere";
import { settEnhetHandling } from "../../tilstand/moduler/meg";
import { useOnInteractOutside } from "../Tabell/FiltrerbarHeader";
import styled from "styled-components";
import { velgFeatureToggles } from "../../tilstand/moduler/unleash.velgere";
import { useAppDispatch } from "../../tilstand/konfigurerTilstand";
import isDevLocation from "../../utility/isDevLocation";

const BrukerBoks = styled.div`
  z-index: 2;
`;

export type Brukerinfo = {
  navn: string;
  ident: string;
  enhet?: string;
  rolle?: string;
};

export interface HeaderProps {
  tittel: ReactNode;
  backLink: string;
  brukerinfo: Brukerinfo;
  children?: ReactNode | ReactNode[];
}

export const Bruker = ({ navn, ident, enhet, rolle }: Brukerinfo) => {
  const [aapen, setAapen] = useState(false);
  const [satte_valgtEnhet, settValgtEnhet] = useState(0);
  const [harAdminTilgang, settHarAdminTilgang] = useState(false);
  const person = useSelector(velgMeg);
  const dispatch = useAppDispatch();
  const { enheter, valgtEnhet } = person;
  const ref = useRef<HTMLDivElement>(null);
  const featureToggles = useSelector(velgFeatureToggles);
  const history = useHistory();

  useEffect(() => {
    const adminEnabled = featureToggles.features.find((f) => f?.navn === "klage.admin");
    if (adminEnabled?.isEnabled !== undefined) {
      if (isDevLocation()) settHarAdminTilgang(true);
      else settHarAdminTilgang(adminEnabled.isEnabled);
    }
  }, [featureToggles]);

  useOnInteractOutside({
    ref,
    onInteractOutside: () => setAapen(false),
    active: aapen,
  });

  const settEnhet = (
    event: React.MouseEvent<HTMLElement | HTMLButtonElement>,
    index: number,
    id: string
  ) => {
    settValgtEnhet(index);
    dispatch(settEnhetHandling({ enhetId: id, navIdent: person.graphData.id }));
    setAapen(false);
  };

  const visValgtEnhet = () => {
    return valgtEnhet.navn ?? "";
  };

  return (
    <BrukerBoks className={"bruker-boks"}>
      <button
        className={classNames(aapen ? "header__lukkeknapp" : "header__aapneknapp")}
        onClick={() => setAapen((a) => !a)}
      >
        <div className={classNames("header__brukerinfo", "header__rad", "header__gap")}>
          <div className={"header__tekstNormal"}>
            <div>{navn}</div>
            <div>{visValgtEnhet()}</div>
          </div>
          <div className="header__knapp ">
            <div className={classNames(aapen ? "header__aapen" : "header__lukket")} />
          </div>
        </div>
      </button>
      <div className={classNames(aapen ? "velg-enhet maksimert" : "minimert")} ref={ref}>
        <div className={"enheter"}>
          {(() => {
            if (isDevLocation() || !harAdminTilgang) {
              return enheter.map((enhet, index) => {
                return (
                  <div
                    className={classNames({
                      enhet: true,
                      active: person.valgtEnhet.id === enhet.id,
                    })}
                    key={enhet.id}
                  >
                    <NavLink to={"#"} onClick={(e) => settEnhet(e, index, enhet.id)}>
                      {enhet.id} {enhet.navn}
                    </NavLink>
                  </div>
                );
              });
            }
          })()}
          <hr />
          {harAdminTilgang && (
            <NavLink to={"/admin"} className={classNames({ enhet: true, navlink: true })}>
              Admin
            </NavLink>
          )}
          <NavLink to={"/innstillinger"} className={classNames({ enhet: true, navlink: true })}>
            Innstillinger
          </NavLink>
          <a href={"/internal/logout"} className={classNames({ enhet: true, navlink: true })}>
            Logg ut
          </a>
        </div>
      </div>
    </BrukerBoks>
  );
};

export const Header = ({ tittel, backLink, children, brukerinfo }: HeaderProps) => {
  const history = useHistory();

  return (
    <header className={"header__kontainer"}>
      <div
        className={"header__rad pointer"}
        onClick={() => history.push(backLink ? backLink : `/`)}
      >
        <h1 className={"header__tittel"}>{tittel}</h1>
        <div className={"header__avdeler skjult"} />
        {children}
      </div>
      <div className={"header__rad"}>
        <button className={"header__systemknapp skjult"}>
          <IkonSystem />
        </button>
        <div className={"header__avdeler skjult"} />
        <Bruker {...brukerinfo}>
          <IkonSystem />
        </Bruker>
      </div>
    </header>
  );
};
