import { OppgaveRad, OppgaveRader, OppgaveRadMedFunksjoner } from "../../tilstand/moduler/oppgave";
import { IKodeverkVerdi } from "../../tilstand/moduler/kodeverk";
import React, { useMemo, useRef, useState } from "react";
import EtikettBase from "nav-frontend-etiketter";
import { Knapp } from "nav-frontend-knapper";
import classNames from "classnames";
import { useOnInteractOutside } from "./FiltrerbarHeader";
import { useDispatch, useSelector } from "react-redux";
import { fradelMegHandling } from "../../tilstand/moduler/saksbehandler";
import { velgMeg } from "../../tilstand/moduler/meg.velgere";
// @ts-ignore
import { NavLink, useHistory, useLocation } from "react-router-dom";
import { formattedDate } from "../../domene/datofunksjoner";
import styled from "styled-components";
import MedunderskriverStatus from "./Medunderskriver";
import { useAppSelector } from "../../tilstand/konfigurerTilstand";
import { velgKodeverk } from "../../tilstand/moduler/kodeverk.velgere";

const R = require("ramda");

const velgOppgave = R.curry(
  (settValgtOppgave: Function, id: string, klagebehandlingVersjon: number, it: number) =>
    tildelOppgave(settValgtOppgave, id, klagebehandlingVersjon, it)
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
  klagebehandlingVersjon,
  person,
  utvidetProjeksjon,
  settValgtOppgave,
  avsluttetAvSaksbehandler,
  utfall,
  it,
}: OppgaveRadMedFunksjoner) => {
  const dispatch = useDispatch();
  const meg = useSelector(velgMeg);
  const fradelOppgave = leggTilbakeOppgave(dispatch)(meg.id)(meg.enheter[meg.valgtEnhet].id);

  const curriedVisHandlinger = visHandlinger(fradelOppgave)(id);
  const curriedVelgOppgave = velgOppgave(settValgtOppgave)(id);
  const { kodeverk, lasterKodeverk } = useAppSelector(velgKodeverk);

  const location = useLocation();
  const history = useHistory();

  const utfallObjekt = useMemo<IKodeverkVerdi | null>(
    () => (lasterKodeverk ? null : kodeverk.utfall.find(({ id }) => id === utfall) ?? null),
    [utfall, kodeverk.utfall, lasterKodeverk, kodeverk.utfall.length]
  );

  const rerouteToKlage = (location: any) => {
    if (location.pathname.startsWith("/mineoppgaver")) history.push(`/klagebehandling/${id}`);
  };

  return (
    <TableRow className="table-filter">
      <TableCell data-testid={`linkbehandling${it}`} onClick={() => rerouteToKlage(location)}>
        <EtikettBase type="info" className={`etikett-${type}`}>
          {kodeverk?.kodeverk.type
            ? kodeverk?.kodeverk.type?.filter((h: IKodeverkVerdi) => h.id == type)[0]
                ?.beskrivelse ?? `ukjent type ${type}`
            : "mangler"}
        </EtikettBase>
      </TableCell>
      <TableCell onClick={() => rerouteToKlage(location)}>
        <EtikettBase type="info" className={`etikett-${tema}`}>
          {kodeverk?.kodeverk.tema
            ? kodeverk?.kodeverk.tema?.filter((h: IKodeverkVerdi) => h.id == tema)[0]
                ?.beskrivelse ?? `ukjent tema ${tema}`
            : "mangler"}
        </EtikettBase>
      </TableCell>

      <TableCell onClick={() => rerouteToKlage(location)}>
        <EtikettBase type="info" className={`etikett-${hjemmel}`}>
          {hjemmel
            ? kodeverk?.kodeverk.hjemmel
              ? kodeverk?.kodeverk.hjemmel?.filter((h: IKodeverkVerdi) => h.id == hjemmel)[0]
                  ?.beskrivelse ?? `ukjent hjemmel ${hjemmel}`
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
            <NavLink to={`/klagebehandling/${id}`}> {person?.fnr || "mangler"}</NavLink>
          </div>
        </TableCell>
      )}

      {avsluttetAvSaksbehandler && <TableCell>{formattedDate(avsluttetAvSaksbehandler)}</TableCell>}
      {!avsluttetAvSaksbehandler && <TableCell>{formattedDate(frist)}</TableCell>}

      {utfallObjekt ? <TableCell>{utfallObjekt.navn}</TableCell> : null}
      {!utfallObjekt &&
        location.pathname.startsWith("/oppgaver") &&
        curriedVelgOppgave(klagebehandlingVersjon)(it)}
      {!utfallObjekt &&
        location.pathname.startsWith("/mineoppgaver") &&
        curriedVisHandlinger(klagebehandlingVersjon)}
    </TableRow>
  );
};

function tildelOppgave(
  settValgtOppgave: Function,
  id: string,
  klagebehandlingVersjon: number,
  it: number
) {
  return (
    <TableCell>
      <Knapp
        data-testid={`tildelknapp${it}`}
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
  klagebehandlinger.rader.map((rad: OppgaveRad, it) => (
    <OppgaveTabellRad
      key={rad.id}
      {...rad}
      it={it}
      utvidetProjeksjon={utvidetProjeksjon}
      settValgtOppgave={settValgOppgaveId}
    />
  ));
