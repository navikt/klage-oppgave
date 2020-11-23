import { OppgaveRad, OppgaveRader, OppgaveRadMedFunksjoner } from "../../tilstand/moduler/oppgave";
import React, { useEffect, useRef, useState } from "react";
import EtikettBase from "nav-frontend-etiketter";
import { typeOversettelse, ytelseOversettelse } from "../../domene/forkortelser";
import { Knapp } from "nav-frontend-knapper";
import classNames from "classnames";
import { useOnInteractOutside } from "./FiltrerbarHeader";
import { useDispatch, useSelector } from "react-redux";
import { fradelMegHandling } from "../../tilstand/moduler/saksbehandler";
import { velgMeg } from "../../tilstand/moduler/meg.velgere";

const R = require("ramda");

const velgOppgave = R.curry((settValgtOppgave: Function, id: string, versjon: number) =>
  tildelOppgave(settValgtOppgave, id, versjon)
);

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
  ytelse,
  hjemmel,
  frist,
  versjon,
  person,
  utvidetProjeksjon,
  settValgtOppgave,
}: OppgaveRadMedFunksjoner) => {
  const dispatch = useDispatch();
  const meg = useSelector(velgMeg);
  const fradelOppgave = leggTilbakeOppgave(dispatch)(meg.id);

  return (
    <tr className="table-filter">
      <td>
        <EtikettBase type="info" className={`etikett-${type}`}>
          {typeOversettelse(type)}
        </EtikettBase>
      </td>
      <td>
        <EtikettBase type="info" className={`etikett-${ytelse}`}>
          {ytelseOversettelse(ytelse)}
        </EtikettBase>
      </td>
      <td>
        <EtikettBase type="info" className={`etikett-${hjemmel}`}>
          {hjemmel}
        </EtikettBase>
      </td>

      {utvidetProjeksjon && <td>{person?.navn}</td>}
      {utvidetProjeksjon && <td>{person?.fnr}</td>}
      <td>{frist}</td>
      {!utvidetProjeksjon && velgOppgave(settValgtOppgave, id, versjon)}
      {utvidetProjeksjon && visHandlinger(fradelOppgave, id, versjon)}
    </tr>
  );
};

function tildelOppgave(settValgtOppgave: Function, id: string, versjon: number) {
  return (
    <td>
      <Knapp className={"knapp"} onClick={(e) => settValgtOppgave({ id, versjon })}>
        Tildel meg
      </Knapp>
    </td>
  );
}

function visHandlinger(fradelOppgave: Function, id: string, versjon: number) {
  const [viserHandlinger, settVisHandlinger] = useState(false);
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
        onClick={() => settVisHandlinger(!viserHandlinger)}
        className={classNames({ skjult: viserHandlinger })}
      >
        Endre
      </a>
      <div className={classNames({ handlinger: true, skjult: !viserHandlinger })} ref={ref}>
        <div>
          <Knapp className={"knapp"} onClick={(e) => fradelOppgave(id, versjon)}>
            Legg tilbake
          </Knapp>
        </div>
      </div>
    </td>
  );
}

export const genererTabellRader = (
  settValgOppgaveId: Function,
  oppgaver: OppgaveRader,
  utvidetProjeksjon: "UTVIDET" | undefined
): JSX.Element[] =>
  oppgaver.rader.map((rad: OppgaveRad) => (
    <OppgaveTabellRad
      key={rad.id}
      {...rad}
      utvidetProjeksjon={utvidetProjeksjon}
      settValgtOppgave={settValgOppgaveId}
    />
  ));
