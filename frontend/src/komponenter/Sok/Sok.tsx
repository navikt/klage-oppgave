import React, { useEffect, useState } from "react";
import Oppsett from "../Oppsett";
import "../../stilark/App.less";
import "../../stilark/Lists.less";
import "nav-frontend-tabell-style";
import { useDispatch, useSelector } from "react-redux";
import { velgMeg } from "../../tilstand/moduler/meg.velgere";
import NavFrontendSpinner from "nav-frontend-spinner";
import { velgSok } from "../../tilstand/moduler/sok.velgere";
import { IKodeverkVerdi } from "../../tilstand/moduler/kodeverk";
import EtikettBase from "nav-frontend-etiketter";
import { velgKodeverk } from "../../tilstand/moduler/kodeverk.velgere";
import { Knapp } from "nav-frontend-knapper";
import { tildelMegHandling } from "../../tilstand/moduler/saksbehandler";
import { useAppDispatch } from "../../tilstand/konfigurerTilstand";
import { withErrorBoundary } from "../../utility/ErrorBoundary";
import { ErrorMessage } from "../ErrorMessage";

const ErrorMessageWithErrorBoundary = withErrorBoundary(ErrorMessage);

import { useHistory } from "react-router";
import { useDebounce } from "../../utility/usedebounce";
// @ts-ignore
import SokSvg from "./sok.svg";
import { velgSaksbehandlerHandling } from "../../tilstand/moduler/sakbehandler.velgere";
import {
  Tr,
  Th,
  Td,
  SokeTabell,
  TrBunnramme,
  TdSenter,
  TdResultat,
  SokeTabellAvsluttede,
  SokInput,
  SokeForklaring,
  SokBeholder,
  SokIkon,
  SokeTekst,
  Result,
} from "./styled-components/sok";
import { IPersonResultat, ISokResultat, Klagebehandling } from "../../tilstand/moduler/sok/types";
import { startSok, settSokLaster, tomSok } from "../../tilstand/moduler/sok/actions";
import { fnrFormat } from "../../domene/foedselsnummer";

const R = require("ramda");

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

function AapneKlagebehandlinger(person: IPersonResultat): JSX.Element {
  if (!person) return <></>;
  const kodeverk = useSelector(velgKodeverk);
  const meg = useSelector(velgMeg);
  const dispatch = useAppDispatch();
  const KodeverkHjemmel = R.curry(Kodeverk)(kodeverk.kodeverk.hjemmel);
  const KodeverkType = R.curry(Kodeverk)(kodeverk.kodeverk.type);
  const KodeverkTema = R.curry(Kodeverk)(kodeverk.kodeverk.tema);

  const curriedDispatchOppgave = R.curry(dispatchOppgave)(
    dispatch,
    meg.graphData.id,
    meg.valgtEnhet.id
  );
  const curriedVelgOppgave = R.curry(tildelOppgave)(curriedDispatchOppgave);

  const visResultat = () => {
    if (person.aapneKlagebehandlinger.length === 0) {
      return <p>Ingen aktive klager</p>;
    }
    return (
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
                {Object.values(person.aapneKlagebehandlinger).map((rad: any) => (
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
    );
  };

  return (
    <>
      <thead>
        <Tr>
          <Th>
            {person.navn} {fnrFormat(person.fnr)}
          </Th>
        </Tr>
      </thead>
      {visResultat()}
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

const SokeResultat = (sokResultat: ISokResultat): JSX.Element | null => {
  if (!sokResultat?.personer) {
    return <p>Finner ingen personer i systemet</p>;
  }
  if (sokResultat.antallTreffTotalt === 0) {
    return <p>Ingen resultater fra søk</p>;
  }

  return (
    <>
      <SokeTabell cellSpacing={0} cellPadding={10}>
        {sokResultat.personer?.map((rad: any, idx: number) => (
          <AapneKlagebehandlinger key={`rad${idx}`} {...rad} />
        ))}
      </SokeTabell>
      <SokeTabellAvsluttede cellSpacing={0} cellPadding={10}>
        {sokResultat.personer?.map((rad: any, idx: number) => (
          <FullforteKlagebehandlinger key={`rad${idx}`} {...rad} />
        ))}
      </SokeTabellAvsluttede>
    </>
  );
};

function sok({
  dispatch,
  navIdent,
  soekString,
}: {
  dispatch: Function;
  navIdent: string;
  soekString: string;
}) {
  return dispatch(
    startSok({
      antall: 200,
      navIdent,
      start: 0,
      soekString,
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
        sok({ dispatch, navIdent: person.graphData.id, soekString: searchQuery });
      }
    }, 500);
    return () => clearTimeout(timeout); // Clear existing timer every time it runs.
  }, [window.location.search, dispatch, person.graphData.id]);

  useEffect(() => {
    if (fnr && !tildelerMeg) sok({ dispatch, navIdent: person.graphData.id, soekString: fnr });
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
          {sokResult.laster ? <NavFrontendSpinner /> : <SokeResultat {...sokResult?.response} />}
        </Result>
      </ErrorMessageWithErrorBoundary>
    </Oppsett>
  );
};

export default Sok;
