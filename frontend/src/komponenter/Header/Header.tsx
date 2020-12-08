import React, { ReactNode, useState } from "react";
import IkonSystem from "./icons/IkonSystem";
import classNames from "classnames";
import "./Header.less";

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

  return (
    <button
      className={classNames(aapen ? "header__lukkeknapp" : "header__aapneknapp")}
      onClick={() => setAapen((a) => !a)}
    >
      <div className={classNames("header__brukerinfo", "header__rad", "header__gap")}>
        <p className={"header__tekstNormal"}>{navn}</p>
        <div className="header__knapp skjult">
          <div className={classNames(aapen ? "header__lukket" : "header__aapen")} />
        </div>
      </div>
    </button>
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
