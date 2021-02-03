import React, { useEffect, useReducer, useState } from "react";
import Oppsett from "./Oppsett";
import "../stilark/klagebehandling.less";
//@ts-ignore
import ExtLink from "../komponenter/extlink.svg";
import { NavLink, useLocation, useParams } from "react-router-dom";
import klageReducer, { IKlageState } from "./klage-reducer";
import classNames from "classnames";
import qs from "qs";
import { useDispatch, useSelector } from "react-redux";
import {
  hentDokumenterHandling,
  hentKlageHandling,
  IKlage,
} from "../tilstand/moduler/klagebehandling";
import { velgKlage } from "../tilstand/moduler/klagebehandlinger.velgere";
import { formattedDate } from "../domene/datofunksjoner";
import Debug from "./Tabell/Debug";

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

const KlageDokumenter = () => {
  return (
    <div className={"dokumenter"}>
      <div className={"wrapper"}>
        <h1>Dokumenter</h1>
        <button className={"knapp__lenke"}>Legg til/ta bort</button>
        <button className={"knapp__lenke"}>Åpne alle</button>
      </div>
      <div className={"opplysninger"}>Ingen dokumenter knyttet til klagen enda</div>
    </div>
  );
};

const Klagen = () => {
  const klage: IKlage = useSelector(velgKlage);

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

        <KlageDokumenter />
      </div>

      <div className={"oversendingsdetaljer"}>
        <h3>Oversendingsdetaljer</h3>
        <div className={"detaljer"}>
          <div>
            Tema:
            <ul className={"detaljliste"}>
              <li>
                <div className={"etikett etikett-Sykepenger etikett--info"}>{klage.tema}</div>
              </li>
            </ul>
          </div>

          <div>
            Type:
            <ul className={"detaljliste"}>
              <li>
                <div className={"etikett etikett-Sykepenger etikett--type"}>{klage.sakstype}</div>
              </li>
            </ul>
          </div>
          <div>
            Hjemmel:
            <ul className={"detaljliste"}>
              {klage.hjemler.map((hjemmel: any, idx: number) => (
                <li key={`hjemmel${idx}`}>
                  <div className={"etikett etikett-Sykepenger etikett--hjemmel"}>
                    {hjemmel.original}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

function Dokumenter() {
  const klage: IKlage = useSelector(velgKlage);
  const [aktivtDokument, settaktivtDokument] = useState(0);
  const dispatch = useDispatch();

  function hentNeste() {
    dispatch(hentDokumenterHandling({ id: klage.id, handling: "neste", antall: 10 }));
  }

  function hentForrige() {
    dispatch(hentDokumenterHandling({ id: klage.id, handling: "forrige", antall: 10 }));
  }

  if (!klage.dokumenter) {
    return <></>;
  }
  return (
    <div className={"dokument-wrapper"}>
      <table className={"dokument-tabell"} cellPadding={0} cellSpacing={0}>
        <thead>
          <tr>
            <th />
            <th>Dokumentbeskrivelse</th>
            <th>Tema</th>
            <th>Registrert</th>
          </tr>
        </thead>
        <tbody>
          {klage.dokumenter.map((dokument: any, idx: number) => (
            <tr
              key={dokument.dokumentInfoId}
              onClick={() => settaktivtDokument(dokument.dokumentInfoId)}
            >
              <td>
                <input type={"checkbox"} />
              </td>
              <td>
                <button
                  onClick={() => settaktivtDokument(dokument.dokumentInfoId)}
                  className={"knapp__lenke"}
                >
                  {dokument.tittel}
                </button>
              </td>
              <td>
                <div
                  className={`etikett etikett--mw etikett--info etikett--${dokument.tema
                    .split(" ")[0]
                    .toLowerCase()}`}
                >
                  {dokument.tema}
                </div>
              </td>
              <td className={"liten"}>{formattedDate(dokument.registrert)}</td>
            </tr>
          ))}
          <tr>
            <td colSpan={4}>
              <button onClick={hentForrige} disabled={klage.prevPageReference === undefined}>
                Forrige
              </button>
              <button onClick={hentNeste} disabled={klage.pageReference === null}>
                Neste
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <div className={"preview"}>Forhåndsvisning {aktivtDokument > 0 && aktivtDokument}</div>
    </div>
  );
}

function UtarbeideVedtak() {
  return <>Utarbeide Vedtak</>;
}

function KvalitetsVurdering() {
  return <>Kvalitetsvurdering</>;
}

function Oppgave() {
  return <>Oppgave</>;
}

const Klagebehandling = (): JSX.Element => {
  const { klage_state, klage_dispatch } = klageReducer();
  const location = useLocation();
  const dispatch = useDispatch();
  const klage: IKlage = useSelector(velgKlage);

  const [showDebug, setDebug] = useState(false);
  useEffect(() => {
    document.addEventListener("keydown", (e) => {
      if (e.ctrlKey && e.key === "D") {
        setDebug(!showDebug);
      }
    });
  });

  useEffect(() => {
    if (parseInt(klage_state.oppgaveId, 10) > 0) {
      dispatch(hentKlageHandling(klage_state.oppgaveId));
    }
  }, [klage_state.oppgaveId]);
  useEffect(() => {
    if (klage.id) {
      dispatch(hentDokumenterHandling({ id: klage.id, handling: "init", antall: 10 }));
    }
  }, [klage.id]);

  useEffect(() => {
    const params = qs.parse(location.pathname);
    let loc = location.pathname.split("/");
    let id = loc[2].split("&")[0];
    if (id) klage_dispatch({ type: "sett_oppgave_id", payload: id });
    if (params.side) klage_dispatch({ type: "sett_aktiv_side", payload: params.side });
  }, [location]);

  if (!klage_state.oppgaveId) {
    return <>Spinner</>;
  }

  return (
    <Oppsett visMeny={false}>
      <>
        <div className="klagebehandling__informasjon">
          <div className="rad">FORNAVN ETTERNAVN {klage.foedselsnummer} </div>
        </div>

        {showDebug && <Debug state={klage} />}

        <KlageMeny klage_state={klage_state} id={klage_state.oppgaveId} />

        {klage_state.aktivSide === "klagen" && <Klagen />}
        {klage_state.aktivSide === "dokumenter" && <Dokumenter />}
        {klage_state.aktivSide === "utarbeidevedtak" && <UtarbeideVedtak />}
        {klage_state.aktivSide === "kvalitetsvurdering" && <KvalitetsVurdering />}
        {klage_state.aktivSide === "oppgave" && <Oppgave />}
      </>
    </Oppsett>
  );
};

export default Klagebehandling;
