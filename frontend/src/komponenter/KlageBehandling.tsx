import React, { useEffect, useReducer } from "react";
import Oppsett from "./Oppsett";
import "../stilark/klagebehandling.less";
//@ts-ignore
import ExtLink from "../komponenter/extlink.svg";
import { NavLink, useLocation } from "react-router-dom";
import klageReducer, { IKlageState } from "./klage-reducer";
import classNames from "classnames";
import qs from "qs";
import { useDispatch, useSelector } from "react-redux";
import { hentFeatureToggleHandling } from "../tilstand/moduler/unleash";
import { hentKlageHandling } from "../tilstand/moduler/klagebehandling";
import { velgKlage } from "../tilstand/moduler/klagebehandlinger.velgere";
import { velgEnheter } from "../tilstand/moduler/meg.velgere";

const KlageMeny = ({ klage_state, id }: { klage_state: IKlageState; id: string }) => {
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
};

const Dokumenter = () => {
  return (
    <div className={"dokumenter"}>
      <div className={"wrapper"}>
        <h1>Dokumenter</h1>
        <button className={"lenke_knapp"}>Legg til/ta bort</button>
        <button className={"lenke_knapp"}>Åpne alle</button>
      </div>
      <div className={"opplysninger"}>Ingen dokumenter knyttet til klagen enda</div>
    </div>
  );
};

const Klagen = () => {
  const klage = useSelector(velgKlage);

  return (
    <div className={"klage_og_detaljer"}>
      <div className={"klagen"}>
        <h1>Behandlingsopplysninger</h1>
        <div className={"opplysninger"}>
          <div>Klage Innsendt:</div>
          <div className={"data"}>{klage.klageInnsendtdato || "N/A"}</div>
        </div>
        <div className={"opplysninger"}>
          <div>Fra NAV-enhet</div>
          <div className={"data"}>{klage.fraNAVEnhet}</div>
        </div>
        <div className={"opplysninger"}>
          <div>Mottatt første instans</div>
          <div className={"data"}>{klage.mottattFoersteinstans || "N/A"}</div>
        </div>

        <div className={"opplysninger"}>
          <div>Oversendt til KA</div>
          <div className={"data"}>N/A</div>
        </div>

        <div className={"opplysninger"}>
          <div>Klage basert på sak</div>
          <div className={"data"}>
            <a
              target="_blank"
              aria-label={"Ekstern lenke til Gosys for denne personen"}
              href={`/gosys/personoversikt/fnr=`}
            >
              SAKSNR (N/A)
            </a>
            <a
              target="_blank"
              aria-label={"Ekstern lenke til Gosys for denne personen"}
              href={`/gosys/personoversikt/fnr=`}
              className="pl"
            >
              <img alt="Ekstern lenke" src={ExtLink} />
            </a>
          </div>
        </div>

        <Dokumenter />
      </div>

      <div className={"oversendingsdetaljer"}>
        <h3>Oversendingsdetaljer</h3>
        <div className={"detaljer"}>
          <div>Tema:</div>
          <div>Type:</div>
          <div>
            Hjemmel:
            <ul className={"detaljliste"}>
              {klage.hjemler.map((hjemmel: any, idx: number) => (
                <li key={`hjemmel${idx}`}>{hjemmel.original}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

const Klagebehandling = (): JSX.Element => {
  const { klage_state, klage_dispatch } = klageReducer();
  const id = "309873006";
  const location = useLocation();
  const dispatch = useDispatch();
  const klage = useSelector(velgKlage);

  useEffect(() => {
    klage_dispatch({ type: "sett_oppgave_id", payload: id });
    dispatch(hentKlageHandling(id));
  }, [id]);

  useEffect(() => {
    const params = qs.parse(location.pathname);
    if (params.side) klage_dispatch({ type: "sett_aktiv_side", payload: params.side });
  }, [location]);

  return (
    <Oppsett visMeny={false}>
      <>
        <div className="klagebehandling__informasjon">
          <div className="rad">FORNAVN ETTERNAVN {klage.foedselsnummer} </div>
        </div>

        <KlageMeny klage_state={klage_state} id={id} />

        <Klagen />
      </>
    </Oppsett>
  );
};

export default Klagebehandling;
