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

const TableRow = styled.tr``;

const TableCell = styled.td``;

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

function Kodeverk(kodeverk: any, data: string) {
  if (!data) return "mangler";
  return kodeverk
    ? kodeverk.filter((h: IKodeverkVerdi) => h.id == data)[0]?.beskrivelse ?? `ukjent (${data})`
    : "mangler";
}

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

  const KodeverkHjemmel = R.curry(Kodeverk)(kodeverk.hjemmel);
  const KodeverkType = R.curry(Kodeverk)(kodeverk.type);
  const KodeverkTema = R.curry(Kodeverk)(kodeverk.tema);

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
    <TableRow
      className={`${
        location.pathname.startsWith("/mineoppgaver") ? "tablerow__on_hover" : ""
      } table-filter`}
    >
      <td
        className={`${location.pathname.startsWith("/mineoppgaver") ? "cursor__pointer" : ""} `}
        data-testid={`linkbehandling${it}`}
        onClick={() => rerouteToKlage(location)}
      >
        <EtikettBase
          type="info"
          className={`etikett-${type}  ${
            location.pathname.startsWith("/mineoppgaver") ? "etikett__mine-oppgaver" : ""
          } `}
        >
          {KodeverkType(type)}
        </EtikettBase>
      </td>
      <td
        className={`${location.pathname.startsWith("/mineoppgaver") ? "cursor__pointer" : ""} `}
        onClick={() => rerouteToKlage(location)}
      >
        <EtikettBase
          type="info"
          className={`etikett-${tema} ${
            location.pathname.startsWith("/mineoppgaver") ? "etikett__mine-oppgaver" : ""
          }`}
        >
          {KodeverkTema(tema)}
        </EtikettBase>
      </td>

      <td
        className={`${location.pathname.startsWith("/mineoppgaver") ? "cursor__pointer" : ""} `}
        onClick={() => rerouteToKlage(location)}
      >
        <EtikettBase
          type="info"
          className={`etikett-${hjemmel} ${
            location.pathname.startsWith("/mineoppgaver") ? "etikett__mine-oppgaver" : ""
          }`}
        >
          {KodeverkHjemmel(hjemmel)}
        </EtikettBase>
      </td>

      {utvidetProjeksjon && (
        <td
          className={`${location.pathname.startsWith("/mineoppgaver") ? "cursor__pointer" : ""} `}
          onClick={() => rerouteToKlage(location)}
        >
          {person?.navn || "mangler"}
        </td>
      )}
      {utvidetProjeksjon && (
        <td
          className={`${location.pathname.startsWith("/mineoppgaver") ? "cursor__pointer" : ""} `}
        >
          <NavLink className={"fnr"} to={`/klagebehandling/${id}`}>
            {" "}
            {person?.fnr || "mangler"}
          </NavLink>
        </td>
      )}

      {avsluttetAvSaksbehandler && (
        <td
          className={`${location.pathname.startsWith("/mineoppgaver") ? "cursor__pointer" : ""} `}
          onClick={() => rerouteToKlage(location)}
        >
          {formattedDate(avsluttetAvSaksbehandler)}
        </td>
      )}
      {!avsluttetAvSaksbehandler && (
        <td
          className={`${location.pathname.startsWith("/mineoppgaver") ? "cursor__pointer" : ""} `}
          onClick={() => rerouteToKlage(location)}
        >
          {formattedDate(frist)}
        </td>
      )}

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
