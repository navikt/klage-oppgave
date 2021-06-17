import React from "react";
import Oppsett from "../komponenter/Oppsett";
import "../stilark/App.less";
import "../stilark/Lists.less";
import "nav-frontend-tabell-style";
import { useDispatch, useSelector } from "react-redux";
import { startSok } from "../tilstand/moduler/sok";
import { velgMeg } from "../tilstand/moduler/meg.velgere";
import NavFrontendSpinner from "nav-frontend-spinner";
import { velgSok } from "../tilstand/moduler/sok.velgere";
import styled from "styled-components";
import { Input } from "nav-frontend-skjema";
import { IKodeverkVerdi } from "../tilstand/moduler/kodeverk";
import EtikettBase from "nav-frontend-etiketter";
import { velgKodeverk } from "../tilstand/moduler/kodeverk.velgere";
import { Knapp } from "nav-frontend-knapper";
import { tildelMegHandling } from "../tilstand/moduler/saksbehandler";
import { useAppDispatch } from "../tilstand/konfigurerTilstand";

const R = require("ramda");

let SokInput = styled.div`
  display: block;
  margin: 1em;
  max-width: 60em;
`;

let Result = styled.div`
  display: block;
  margin: 1em;
`;

let SokeTabell = styled.table`
  max-width: 60em;
  width: 60em;
`;

let Tr = styled.tr`
  background: #e5f3ff;
`;
let TrBunnramme = styled.tr``;

let Td = styled.td`
  text-align: left;
  padding: 0;
  margin: 0;
`;
let TdSenter = styled.td`
  text-align: center;
  border-bottom: 1px solid #c6c2bf;
`;
let TdResultat = styled.td`
  text-align: left;
  border-bottom: 1px solid #c6c2bf;
`;

let Th = styled.th`
  text-align: left;
  border-bottom: 1px solid #c6c2bf;
`;
let TableCell = styled.td`
  cursor: pointer !important;
`;

function Kodeverk(kodeverk: any, data: string) {
  if (!data) return "";
  return kodeverk
    ? kodeverk.filter((h: IKodeverkVerdi) => h.id == data)[0]?.beskrivelse ?? `ukjent (${data})`
    : "mangler";
}

function tildelOppgave(curriedDispatch: Function, id: string, klagebehandlingVersjon: number) {
  return (
    <Knapp className={"knapp"} onClick={(e) => curriedDispatch(id, klagebehandlingVersjon)}>
      Tildel meg
    </Knapp>
  );
}

function dispatchOppgave(
  dispatch: Function,
  navIdent: string,
  enhetId: string,
  oppgaveId: string,
  klagebehandlingVersjon: number
) {
  return dispatch(
    tildelMegHandling({
      oppgaveId: oppgaveId,
      ident: navIdent,
      klagebehandlingVersjon: klagebehandlingVersjon,
      enhetId: enhetId,
    })
  );
}

const Klagebehandlinger = (data: any): JSX.Element => {
  if (!data) return <></>;
  let kodeverk = useSelector(velgKodeverk);
  let meg = useSelector(velgMeg);
  let dispatch = useAppDispatch();
  const KodeverkHjemmel = R.curry(Kodeverk)(kodeverk.kodeverk.hjemmel);
  const KodeverkType = R.curry(Kodeverk)(kodeverk.kodeverk.type);
  const KodeverkTema = R.curry(Kodeverk)(kodeverk.kodeverk.tema);

  const curriedDispatchOppgave = R.curry(dispatchOppgave)(
    dispatch,
    meg.id,
    meg.enheter[meg.valgtEnhet].id
  );
  const curriedVelgOppgave = R.curry(tildelOppgave)(curriedDispatchOppgave);

  return (
    <>
      <thead>
        <Tr>
          <Th>
            {data.navn} {data.fnr}
          </Th>
        </Tr>
      </thead>
      <tbody>
        <tr>
          <Td>
            <SokeTabell cellSpacing={0} cellPadding={10}>
              <thead>
                <tr>
                  <Th>Aktive klager</Th>
                  <Th />
                  <Th />
                  <Th>Frist</Th>
                  <Th>Saksbehandler</Th>
                </tr>
              </thead>
              <tbody>
                {Object.values(data.klagebehandlinger).map((rad: any) => (
                  <TrBunnramme key={rad.id}>
                    <TdSenter>
                      {rad.type && (
                        <EtikettBase type="info" className={`etikett-type`}>
                          {KodeverkType(rad.type)}
                        </EtikettBase>
                      )}
                    </TdSenter>
                    <TdSenter>
                      {rad.tema && (
                        <EtikettBase type="info" className={`etikett-tema`}>
                          {KodeverkTema(rad.tema)}
                        </EtikettBase>
                      )}
                    </TdSenter>
                    <TdSenter>
                      {rad.hjemmel && (
                        <EtikettBase type="info" className={`etikett-hjemmel`}>
                          {KodeverkHjemmel(rad.hjemmel)}
                        </EtikettBase>
                      )}
                    </TdSenter>
                    <TdResultat>{rad.frist}</TdResultat>
                    <TdResultat>
                      {rad.erTildelt
                        ? "Saksbehandlernavn"
                        : curriedVelgOppgave(rad.id, rad.klagebehandlingVersjon)}
                    </TdResultat>
                  </TrBunnramme>
                ))}
              </tbody>
            </SokeTabell>
          </Td>
        </tr>
      </tbody>
    </>
  );
};

const SokeResultat = (data: any): JSX.Element => {
  if (data.antallTreffTotalt === 0 || !data?.personer) return <></>;
  return (
    <SokeTabell cellSpacing={0} cellPadding={10}>
      {data.personer?.map((rad: any, idx: number) => (
        <Klagebehandlinger key={`rad${idx}`} {...rad} />
      ))}
    </SokeTabell>
  );
};

const Sok = (): JSX.Element => {
  let dispatch = useDispatch();
  const person = useSelector(velgMeg);
  const sokResult = useSelector(velgSok);
  return (
    <Oppsett visMeny={true}>
      <div>
        <SokInput>
          <Input
            type={"text"}
            onChange={(e) =>
              dispatch(
                startSok({
                  antall: 10,
                  navIdent: person.id,
                  start: 0,
                  fnr: e.target.value.trim(),
                })
              )
            }
          />
        </SokInput>

        <Result>
          {sokResult.laster && <NavFrontendSpinner />}

          {!sokResult.laster && <SokeResultat {...sokResult?.response} />}
        </Result>
      </div>
    </Oppsett>
  );
};

export default Sok;
