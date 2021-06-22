import React, { useEffect, useState } from "react";
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
import { velgSaksbehandlerHandling } from "../tilstand/moduler/sakbehandler.velgere";

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

let SokeTabellAvsluttede = styled.table`
  max-width: 60em;
  width: 60em;
  margin: 2em 0 0 0;
  padding: 0 0 8em 0;
`;
let Tr = styled.tr`
  background: #e5f3ff;
`;
let TrBunnramme = styled.tr``;

let Td = styled.td`
  text-align: left;
  padding: 0;
  margin: 0;
  width: 16em;
`;
let TdSenter = styled.td`
  text-align: center;
  border-bottom: 1px solid #c6c2bf;
  width: 16em;
`;
let TdResultat = styled.td`
  width: 16em;
  text-align: left;
  border-bottom: 1px solid #c6c2bf;
`;

let Th = styled.th`
  text-align: left;
  border-bottom: 1px solid #c6c2bf;
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
  dispatch(
    tildelMegHandling({
      oppgaveId: oppgaveId,
      ident: navIdent,
      kjorOppgavesokVedSuksess: false,
      klagebehandlingVersjon: klagebehandlingVersjon,
      enhetId: enhetId,
    })
  );
}

function AapneKlagebehandlinger(data: any): JSX.Element {
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
                  <Th colSpan={2}>Aktive klager</Th>
                  <Th />
                  <Th>Frist</Th>
                  <Th>Saksbehandler</Th>
                </tr>
              </thead>
              <tbody>
                {Object.values(data.aapneKlagebehandlinger).map((rad: any) => (
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
                        ? rad.tildeltSaksbehandlerNavn
                        : rad.saksbehandlerHarTilgang
                        ? curriedVelgOppgave(rad.id, rad.klagebehandlingVersjon)
                        : "Ikke tildelt"}
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
}

function FullforteKlagebehandlinger(data: any): JSX.Element {
  if (!data) return <></>;
  let kodeverk = useSelector(velgKodeverk);
  const KodeverkUtfall = R.curry(Kodeverk)(kodeverk.kodeverk.utfall);
  const KodeverkHjemmel = R.curry(Kodeverk)(kodeverk.kodeverk.hjemmel);
  const KodeverkType = R.curry(Kodeverk)(kodeverk.kodeverk.type);
  const KodeverkTema = R.curry(Kodeverk)(kodeverk.kodeverk.tema);

  return (
    <>
      <tbody>
        <tr>
          <Td>
            <SokeTabell cellSpacing={0} cellPadding={10}>
              <thead>
                <tr>
                  <Th colSpan={2}>Fullførte klager siste 12 måneder</Th>
                  <Th />
                  <Th>Fullført</Th>
                  <Th>Utfall</Th>
                </tr>
              </thead>
              <tbody>
                {Object.values(data.avsluttedeKlagebehandlinger).map((rad: any) => (
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
                    <TdResultat>{rad.avsluttetAvSaksbehandler}</TdResultat>
                    <TdResultat>{KodeverkUtfall(rad.utfall)}</TdResultat>
                  </TrBunnramme>
                ))}
              </tbody>
            </SokeTabell>
          </Td>
        </tr>
      </tbody>
    </>
  );
}

const SokeResultat = (data: any): JSX.Element => {
  if (data.antallTreffTotalt === 0 || !data?.personer) return <></>;
  return (
    <>
      <SokeTabell cellSpacing={0} cellPadding={10}>
        {data.personer?.map((rad: any, idx: number) => (
          <AapneKlagebehandlinger key={`rad${idx}`} {...rad} />
        ))}
      </SokeTabell>
      <SokeTabellAvsluttede cellSpacing={0} cellPadding={10}>
        {data.personer?.map((rad: any, idx: number) => (
          <FullforteKlagebehandlinger key={`rad${idx}`} {...rad} />
        ))}
      </SokeTabellAvsluttede>
    </>
  );
};

function sok({ dispatch, navIdent, fnr }: { dispatch: Function; navIdent: string; fnr: string }) {
  return dispatch(
    startSok({
      antall: 200,
      navIdent,
      start: 0,
      fnr,
    })
  );
}

const Sok = (): JSX.Element => {
  let dispatch = useDispatch();
  const person = useSelector(velgMeg);
  const sokResult = useSelector(velgSok);
  const tildelerSak = useSelector(velgSaksbehandlerHandling);
  let [fnr, setFnr] = useState("");

  useEffect(() => {
    sok({ dispatch, navIdent: person.id, fnr });
  }, [dispatch, person.id, fnr, tildelerSak]);

  return (
    <Oppsett visMeny={true}>
      <div>
        <SokInput>
          <Input type={"text"} onChange={(e) => setFnr(e.target.value.trim())} />
        </SokInput>

        <Result>
          {(() => {
            if (sokResult.laster) {
              return <NavFrontendSpinner />;
            } else return <SokeResultat {...sokResult?.response} />;
          })()}
        </Result>
      </div>
    </Oppsett>
  );
};

export default Sok;
