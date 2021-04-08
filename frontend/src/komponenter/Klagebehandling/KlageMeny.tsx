import { IKlageState } from "../klage-reducer";
import { NavLink } from "react-router-dom";
import classNames from "classnames";
//@ts-ignore
import ExtLink from "../extlink.svg";
import React from "react";

export default function KlageMeny({ klage_state, id }: { klage_state: IKlageState; id: string }) {
  return (
    <div className={"meny__linker"}>
      <nav className="klage__nav" role="navigation" aria-label="Meny">
        <ul>
          <li>
            <NavLink
              className={classNames("link", { active: klage_state.aktivSide === "klagen" })}
              to={`/klagebehandling/${id}&side=klagen`}
            >
              Klagen
            </NavLink>
          </li>
          <li>
            <NavLink
              className={classNames("link", { active: klage_state.aktivSide === "dokumenter" })}
              to={`/klagebehandling/${id}&side=dokumenter`}
            >
              Dokumenter
            </NavLink>
          </li>
          <li className={"skjult"}>
            <NavLink
              className={classNames("link", {
                active: klage_state.aktivSide === "utarbeidevedtak",
              })}
              to={`/klagebehandling/${id}&side=utarbeidevedtak`}
            >
              Utarbeide vedtak
            </NavLink>
          </li>
          <li>
            <NavLink
              className={classNames("link", {
                active: klage_state.aktivSide === "kvalitetsvurdering",
              })}
              to={`/klagebehandling/${id}&side=kvalitetsvurdering`}
            >
              Kvalitetsvurdering
            </NavLink>
          </li>
          <li>
            <NavLink
              className={classNames("link", { active: klage_state.aktivSide === "oppgave" })}
              to={`/klagebehandling/${id}&side=oppgave`}
            >
              Oppgave
            </NavLink>
          </li>
          <li>
            <NavLink
              className={classNames("link", {
                active: klage_state.aktivSide === "utarbeidevedtak",
              })}
              to={`/klagebehandling/${id}&side=utarbeidevedtak`}
            >
              Utarbeide vedtak
            </NavLink>
          </li>
        </ul>
      </nav>

      <ul className="klage__lenker" aria-label="Eksterne lenker">
        <li>
          <a
            target="_blank"
            aria-label={"Ekstern lenke til Gosys for denne personen"}
            href={`/gosys/personoversikt/fnr=`}
            className=""
          >
            Vedtaksløsning og sak
          </a>
          <a
            target="_blank"
            aria-label={"Ekstern lenke til Gosys for denne personen"}
            href={`/gosys/personoversikt/fnr=`}
            className=""
          >
            <img alt="Ekstern lenke" src={ExtLink} />
          </a>
        </li>
        <li>
          <a
            target="_blank"
            aria-label={"Ekstern lenke til Gosys for denne personen"}
            href={`/gosys/personoversikt/fnr=`}
            className=""
          >
            A-inntekt
          </a>
          <a
            target="_blank"
            aria-label={"Ekstern lenke til Gosys for denne personen"}
            href={`/gosys/personoversikt/fnr=`}
            className=""
          >
            <img alt="Ekstern lenke" src={ExtLink} />
          </a>
        </li>
        <li>
          <a
            target="_blank"
            aria-label={"Ekstern lenke til Gosys for denne personen"}
            href={`/gosys/personoversikt/fnr=`}
            className=""
          >
            Modia
          </a>
          <a
            target="_blank"
            aria-label={"Ekstern lenke til Gosys for denne personen"}
            href={`/gosys/personoversikt/fnr=`}
            className=""
          >
            <img alt="Ekstern lenke" src={ExtLink} />
          </a>
        </li>
      </ul>
    </div>
  );
}
