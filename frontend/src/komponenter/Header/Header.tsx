import React, { ReactNode, useRef, useState } from "react";
import IkonSystem from "./icons/IkonSystem";
import { NavLink } from "react-router-dom";
import classNames from "classnames";
import "./Header.less";
import { useDispatch, useSelector } from "react-redux";
import { velgEnheter } from "../../tilstand/moduler/meg.velgere";
import { settEnhetHandling } from "../../tilstand/moduler/meg";
import { useOnInteractOutside } from "../Tabell/FiltrerbarHeader";

export type Brukerinfo = {
  navn: string;
  ident: string;
  enhet?: string;
  rolle?: string;
};

export interface HeaderProps {
  tittel: ReactNode;
  brukerinfo: Brukerinfo;
  children?: ReactNode | ReactNode[];
}

export const Bruker = ({ navn, ident, enhet, rolle }: Brukerinfo) => {
  const [aapen, setAapen] = useState(false);
  const enheter = useSelector(velgEnheter);
  const dispatch = useDispatch();

  const ref = useRef<HTMLDivElement>(null);

  useOnInteractOutside({
    ref,
    onInteractOutside: () => setAapen(false),
    active: aapen,
  });

  const settEnhet = (event: React.MouseEvent<HTMLElement | HTMLButtonElement>, id: string) => {
    dispatch(settEnhetHandling(id));
    setAapen(false);
  };

  return (
    <div className={"bruker-boks"}>
      <button
        className={classNames(aapen ? "header__lukkeknapp" : "header__aapneknapp")}
        onClick={() => setAapen((a) => !a)}
      >
        <div className={classNames("header__brukerinfo", "header__rad", "header__gap")}>
          <p className={"header__tekstNormal"}>{navn}</p>
          <div className="header__knapp ">
            <div className={classNames(aapen ? "header__lukket" : "header__aapen")} />
          </div>
        </div>
      </button>
      <div className={classNames(aapen ? "velg-enhet maksimert" : "minimert")} ref={ref}>
        <div className={"enheter"}>
          {enheter.map((enhet) => {
            return (
              <div className={"enhet"} key={enhet.id}>
                <NavLink to={"#"} onClick={(e) => settEnhet(e, enhet.id)}>
                  {" "}
                  {enhet.id} {enhet.navn}
                </NavLink>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export const Header = ({ tittel, children, brukerinfo }: HeaderProps) => {
  return (
    <header className={"header__container"}>
      <div className={"header__rad"}>
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
