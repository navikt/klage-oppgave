import {
  IKodeverkVerdi,
  OppgaveRad,
  OppgaveRader,
  OppgaveRadMedFunksjoner,
} from "../../tilstand/moduler/oppgave";
import React, { useRef, useState } from "react";
import EtikettBase from "nav-frontend-etiketter";
import { Knapp } from "nav-frontend-knapper";
import classNames from "classnames";
import { useOnInteractOutside } from "./FiltrerbarHeader";
import { useDispatch, useSelector } from "react-redux";
import { fradelMegHandling } from "../../tilstand/moduler/saksbehandler";
import { velgMeg } from "../../tilstand/moduler/meg.velgere";
// @ts-ignore
import PilOppHoeyre from "../../komponenter/arrow.svg";
import { NavLink, useHistory, useLocation } from "react-router-dom";
import { formattedDate, isoDateToPretty } from "../../domene/datofunksjoner";
import { velgKodeverk } from "../../tilstand/moduler/oppgave.velgere";
import styled from "styled-components";
import MedunderskriverStatus from "./Medunderskriver";

const R = require("ramda");

const velgOppgave = R.curry(
  (settValgtOppgave: Function, id: string, klagebehandlingVersjon: number) =>
    tildelOppgave(settValgtOppgave, id, klagebehandlingVersjon)
);

const TableRow = styled.tr`
  &:hover {
    background: #e5f3ff !important;
  }
`;
const TableCell = styled.td`
  cursor: pointer !important;
`;
const EndreKnapp = styled.button`
  cursor: pointer !important;
`;

const visHandlinger = R.curry(
  (fradelOppgave: Function, id: string, klagebehandlingVersjon: number) => {
    const [viserHandlinger, settVisHandlinger] = useState(false);
    let [it] = useState(0);
    const ref = useRef<HTMLDivElement>(null);
    const meg = useSelector(velgMeg);
    useOnInteractOutside({
      ref,
      onInteractOutside: () => settVisHandlinger(false),
      active: viserHandlinger,
    });

    return (
      <MedunderskriverStatus id={id}>
        <td className="knapp-med-handlingsoverlegg">
          <EndreKnapp
            data-testid={`endreknapp${it++}`}
            onClick={() => settVisHandlinger(!viserHandlinger)}
            className={classNames({ skjult: viserHandlinger })}
          >
            Endre
          </EndreKnapp>
          <div className={classNames({ handlinger: true, skjult: !viserHandlinger })} ref={ref}>
            <div>
              <Knapp
                data-testid="leggtilbake"
                className={"knapp"}
                onClick={(e) => fradelOppgave(id, klagebehandlingVersjon)}
              >
                Legg tilbake
              </Knapp>
            </div>
          </div>
        </td>
      </MedunderskriverStatus>
    );
  }
);

const leggTilbakeOppgave = R.curry(
  (
    dispatch: Function,
    ident: string,
    enhetId: string,
    oppgaveId: string,
    klagebehandlingVersjon: number
  ) =>
    dispatch(
      fradelMegHandling({
        oppgaveId: oppgaveId,
        ident: ident,
        klagebehandlingVersjon: klagebehandlingVersjon,
        enhetId: enhetId,
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
  klagebehandlingVersjon,
  person,
  utvidetProjeksjon,
  settValgtOppgave,
  avsluttet,
  utfall,
}: OppgaveRadMedFunksjoner) => {
  const dispatch = useDispatch();
  const meg = useSelector(velgMeg);
  const fradelOppgave = leggTilbakeOppgave(dispatch)(meg.id)(meg.enheter[meg.valgtEnhet].id);

  const curriedVisHandlinger = visHandlinger(fradelOppgave)(id);
  const curriedVelgOppgave = velgOppgave(settValgtOppgave)(id);
  const kodeverk = useSelector(velgKodeverk);

  const location = useLocation();
  const history = useHistory();

  const rerouteToKlage = (location: any) => {
    if (location.pathname.startsWith("/mineoppgaver")) history.push(`/klagebehandling/${id}`);
  };

  return (
    <TableRow className="table-filter">
      <TableCell onClick={() => rerouteToKlage(location)}>
        <EtikettBase type="info" className={`etikett-${type}`}>
          {kodeverk?.type
            ? kodeverk?.type?.filter((h: IKodeverkVerdi) => h.id == type)[0]?.beskrivelse ??
              `ukjent type ${type}`
            : "mangler"}
        </EtikettBase>
      </TableCell>
      <TableCell onClick={() => rerouteToKlage(location)}>
        <EtikettBase type="info" className={`etikett-${tema}`}>
          {kodeverk?.tema
            ? kodeverk?.tema?.filter((h: IKodeverkVerdi) => h.id == tema)[0]?.beskrivelse ??
              `ukjent tema ${tema}`
            : "mangler"}
        </EtikettBase>
      </TableCell>

      <TableCell onClick={() => rerouteToKlage(location)}>
        <EtikettBase type="info" className={`etikett-${hjemmel}`}>
          {hjemmel
            ? kodeverk?.hjemmel
              ? kodeverk?.hjemmel?.filter((h: IKodeverkVerdi) => h.id == hjemmel)[0]?.beskrivelse ??
                `ukjent hjemmel ${hjemmel}`
              : "mangler"
            : "mangler"}
        </EtikettBase>
      </TableCell>

      {utvidetProjeksjon && (
        <TableCell onClick={() => rerouteToKlage(location)}>{person?.navn || "mangler"}</TableCell>
      )}
      {utvidetProjeksjon && (
        <TableCell>
          <div className="fnr-lenke-wrap">
            <NavLink to={`/klagebehandling/${id}&side=klagen`}> {person?.fnr || "mangler"}</NavLink>
          </div>
        </TableCell>
      )}

      {avsluttet && <TableCell>{formattedDate(avsluttet)}</TableCell>}
      {!avsluttet && <TableCell>{formattedDate(frist)}</TableCell>}

      {utfall ? <TableCell>{utfall}</TableCell> : null}
      {!utfall &&
        location.pathname.startsWith("/oppgaver") &&
        curriedVelgOppgave(klagebehandlingVersjon)}
      {!utfall &&
        location.pathname.startsWith("/mineoppgaver") &&
        curriedVisHandlinger(klagebehandlingVersjon)}
    </TableRow>
  );
};

function tildelOppgave(settValgtOppgave: Function, id: string, klagebehandlingVersjon: number) {
  let [it] = useState(0);
  return (
    <TableCell>
      <Knapp
        data-testid={`tildelknapp${it++}`}
        className={"knapp"}
        onClick={(e) => settValgtOppgave({ id, klagebehandlingVersjon })}
      >
        Tildel meg
      </Knapp>
    </TableCell>
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
