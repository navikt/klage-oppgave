import React, { useEffect, useState } from "react";
import Oppsett from "../komponenter/Oppsett";
import "../stilark/App.less";
import "../stilark/Lists.less";
import "nav-frontend-tabell-style";
import { useDispatch, useSelector } from "react-redux";
import { settSokLaster, startSok, tomSok } from "../tilstand/moduler/sok";
import { velgMeg } from "../tilstand/moduler/meg.velgere";
import NavFrontendSpinner from "nav-frontend-spinner";
import { velgSok } from "../tilstand/moduler/sok.velgere";
import styled from "styled-components";
import { IKodeverkVerdi } from "../tilstand/moduler/kodeverk";
import EtikettBase from "nav-frontend-etiketter";
import { velgKodeverk } from "../tilstand/moduler/kodeverk.velgere";
import { Knapp } from "nav-frontend-knapper";
import { tildelMegHandling } from "../tilstand/moduler/saksbehandler";
import { useAppDispatch } from "../tilstand/konfigurerTilstand";
import { withErrorBoundary } from "../utility/ErrorBoundary";
import { ErrorMessage } from "./ErrorMessage";

const ErrorMessageWithErrorBoundary = withErrorBoundary(ErrorMessage);

import { useHistory } from "react-router";
import { useDebounce } from "../utility/usedebounce";
// @ts-ignore
import SokSvg from "./sok.svg";
import { velgSaksbehandlerHandling } from "../tilstand/moduler/sakbehandler.velgere";

const R = require("ramda");

let SokInput = styled.div`
  display: block;
  margin: 1em;
  max-width: 60em;
`;

let Result = styled.div`
  display: block;
  margin: 4.5em 1em 0 1em;
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

let SokeForklaring = styled.div`
  margin: 0 0 0.5em 0;
`;
let SokBeholder = styled.div`
  position: relative;
  width: 40em;
`;
let SokIkon = styled.img`
  position: absolute;
  right: 0;
  top: 0;
  z-index: 1;
  height: 2.5em;
`;
let SokeTekst = styled.input`
    width: 40em;
    position; absolute;
    font-family: "Source Sans Pro", Arial, sans-serif;
    font-size: 1rem;
    font-weight: 400;
    appearance: none;
    padding: 0.5rem;
    background-color: #fff;
    border-radius: 4px;
    border: 1px solid #6a6a6a;
    box-sizing: border-box;
    line-height: 1.375rem;
    &:hover{
    border-color: #0067c5;
    }
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
    meg.graphData.id,
    meg.valgtEnhet
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
  const tildelerMeg = useSelector(velgSaksbehandlerHandling);
  const history = useHistory();
  let [fnr, setFnr] = useState("");
  const [debouncedState, setDebouncedState] = useDebounce(fnr);

  const handleChange = (event: any) => {
    setFnr(event.target.value.trim());
    setDebouncedState(event.target.value);
  };

  useEffect(() => {
    let searchQuery = new URLSearchParams(window.location.search).get("s");
    if (searchQuery) {
      dispatch(settSokLaster(true));
      setFnr(searchQuery);
    }
    const timeout = setTimeout(() => {
      if (searchQuery) {
        sok({ dispatch, navIdent: person.graphData.id, fnr: searchQuery });
      }
    }, 500);
    return () => clearTimeout(timeout); // Clear existing timer every time it runs.
  }, [window.location.search, dispatch, person.graphData.id]);

  useEffect(() => {
    if (fnr && !tildelerMeg) sok({ dispatch, navIdent: person.graphData.id, fnr });
  }, [sok, dispatch, person.graphData.id, tildelerMeg]);

  useEffect(() => {
    return () => {
      dispatch(tomSok());
    };
  }, [dispatch]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (fnr) {
        const params = new URLSearchParams();
        params.append("s", fnr);
        history.push({ search: params.toString() });
      }
    }, 500);
    return () => clearTimeout(timeout); // Clear existing timer every time it runs.
  }, [fnr]);

  return (
    <Oppsett visMeny={true}>
      <ErrorMessageWithErrorBoundary>
        <SokInput>
          <SokeForklaring>Søk med fullt personnummer:</SokeForklaring>
          <SokBeholder>
            <SokIkon src={SokSvg} />
            <SokeTekst
              style={{ position: "absolute", left: 0, top: 0 }}
              type={"text"}
              value={fnr}
              onChange={handleChange}
            />
          </SokBeholder>
        </SokInput>

        <Result>
          {(() => {
            if (sokResult.laster) {
              return <NavFrontendSpinner />;
            } else return <SokeResultat {...sokResult?.response} />;
          })()}
        </Result>
      </ErrorMessageWithErrorBoundary>
    </Oppsett>
  );
};

export default Sok;
