import { OppgaveRad, OppgaveRader, OppgaveRadMedFunksjoner } from "../../tilstand/moduler/oppgave";
import React, { useEffect, useRef, useState } from "react";
import EtikettBase from "nav-frontend-etiketter";
import { typeOversettelse, temaOversettelse } from "../../domene/forkortelser";
import { Knapp } from "nav-frontend-knapper";
import classNames from "classnames";
import { useOnInteractOutside } from "./FiltrerbarHeader";
import { useDispatch, useSelector } from "react-redux";
import { fradelMegHandling } from "../../tilstand/moduler/saksbehandler";
import { velgMeg } from "../../tilstand/moduler/meg.velgere";
// @ts-ignore
import PilOppHoeyre from "../../komponenter/arrow.svg";
import { NavLink, useHistory, useLocation } from "react-router-dom";
import { formattedDate } from "../../domene/datofunksjoner";

const R = require("ramda");

const velgOppgave = R.curry((settValgtOppgave: Function, id: string, versjon: number) =>
  tildelOppgave(settValgtOppgave, id, versjon)
);

const gosysEnvironment = (hostname: string) => {
  if (hostname === "localhost") {
    //muligens sette opp en local mock?
    return "http://localhost:3000";
  } else if (hostname.indexOf("dev.nav.no") !== -1) {
    return "https://gosys.nais.preprod.local";
  }
  return "https://gosys-nais.nais.adeo.no";
};

const visHandlinger = R.curry((fradelOppgave: Function, id: string, versjon: number) => {
  const [viserHandlinger, settVisHandlinger] = useState(false);
  let [it] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  useOnInteractOutside({
    ref,
    onInteractOutside: () => settVisHandlinger(false),
    active: viserHandlinger,
  });

  return (
    <td className="knapp-med-handlingsoverlegg">
      <a
        href="#"
        data-testid={`endreknapp${it++}`}
        onClick={() => settVisHandlinger(!viserHandlinger)}
        className={classNames({ skjult: viserHandlinger })}
      >
        Endre
      </a>
      <div className={classNames({ handlinger: true, skjult: !viserHandlinger })} ref={ref}>
        <div>
          <Knapp
            data-testid="leggtilbake"
            className={"knapp"}
            onClick={(e) => fradelOppgave(id, versjon)}
          >
            Legg tilbake
          </Knapp>
        </div>
      </div>
    </td>
  );
});

const leggTilbakeOppgave = R.curry(
  (dispatch: Function, ident: string, oppgaveId: string, versjon: number) =>
    dispatch(
      fradelMegHandling({
        oppgaveId: oppgaveId,
        ident: ident,
        versjon: versjon,
      })
    )
);

const OppgaveTabellRad = ({
  id,
  type,
  tema,
  hjemmel,
  frist,
  mottatt,
  versjon,
  person,
  utvidetProjeksjon,
  settValgtOppgave,
}: OppgaveRadMedFunksjoner) => {
  const dispatch = useDispatch();
  const meg = useSelector(velgMeg);
  const fradelOppgave = leggTilbakeOppgave(dispatch)(meg.id);
  const curriedVisHandlinger = visHandlinger(fradelOppgave)(id)(versjon);
  const curriedVelgOppgave = velgOppgave(settValgtOppgave)(id)(versjon);
  const location = useLocation();
  const history = useHistory();

  const rerouteToKlage = (location: any) => {
    //if (location.pathname.startsWith("/mineoppgaver")) history.push(`/klagebehandling/${id}`);
  };

  return (
    <tr className="table-filter">
      <td onClick={() => rerouteToKlage(location)}>
        <EtikettBase type="info" className={`etikett-${type}`}>
          {typeOversettelse(type)}
        </EtikettBase>
      </td>
      <td onClick={() => rerouteToKlage(location)}>
        <EtikettBase type="info" className={`etikett-${tema}`}>
          {temaOversettelse(tema)}
        </EtikettBase>
      </td>
      <td onClick={() => rerouteToKlage(location)}>
        <EtikettBase type="info" className={`etikett-${hjemmel}`}>
          {hjemmel || "mangler"}
        </EtikettBase>
      </td>

      {utvidetProjeksjon && (
        <td onClick={() => rerouteToKlage(location)}>{person?.navn || "<mangler>"}</td>
      )}
      {utvidetProjeksjon && (
        <td>
          <div className="fnr-lenke-wrap">
            <NavLink to={`/klagebehandling/${id}&side=klagen`}>
              {" "}
              {person?.fnr || "<mangler>"}
            </NavLink>
          </div>
        </td>
      )}
      <td>{formattedDate(frist as number)}</td>
      {location.pathname.startsWith("/oppgaver") && curriedVelgOppgave}
      {location.pathname.startsWith("/mineoppgaver") && curriedVisHandlinger}
    </tr>
  );
};

function tildelOppgave(settValgtOppgave: Function, id: string, versjon: number) {
  let [it] = useState(0);
  return (
    <td>
      <Knapp
        data-testid={`tildelknapp${it++}`}
        className={"knapp"}
        onClick={(e) => settValgtOppgave({ id, versjon })}
      >
        Tildel meg
      </Knapp>
    </td>
  );
}

export const genererTabellRader = (
  settValgOppgaveId: Function,
  klagebehandlinger: OppgaveRader,
  utvidetProjeksjon: "UTVIDET" | boolean | undefined
): JSX.Element[] =>
  klagebehandlinger.rader.map((rad: OppgaveRad) => (
    <OppgaveTabellRad
      key={rad.id}
      {...rad}
      utvidetProjeksjon={utvidetProjeksjon}
      settValgtOppgave={settValgOppgaveId}
    />
  ));
