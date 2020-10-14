import React, { useEffect, useState } from "react";
import Layout from "./komponenter/Layout";
import { Knapp, Hovedknapp } from "nav-frontend-knapper";
import EtikettBase from "nav-frontend-etiketter";
import "./App.less";
import "./Lists.less";
import "./Tabell.less";
import { Checkbox, Select } from "nav-frontend-skjema";
import { useDispatch, useSelector } from "react-redux";
import {
  OppgaveRad,
  OppgaveRader,
  oppgaveRequest,
} from "./tilstand/moduler/oppgave";
import {
  selectOppgaver,
  selectIsFetching,
} from "./tilstand/moduler/oppgave.selectors";

const OppgaveTabell = (oppgaver: OppgaveRader) => {
  return (
    <table className="oppgave" cellSpacing={0} cellPadding={10}>
      <thead>
        <tr>
          <td>
            <Select label="&#8203;" className="fixed-width-100px">
              <option value="">Type</option>
              <option value="klage">Klage</option>
              <option value="anke">Anke</option>
            </Select>
          </td>
          <td>
            <Select label="&#8203;" className="fixed-width-100px">
              <option value="">Ytelse</option>
              <option value="sykepenger">Sykepenger</option>
              <option value="dagpenger">Dagpenger</option>
              <option value="foreldrepenger">Foreldrepenger</option>
            </Select>
          </td>
          <td>
            <Select label="&#8203;" className="fixed-width-100px">
              <option value="">Hjemmel</option>
              <option value="8-4">8-4</option>
              <option value="4-3">4-3</option>
            </Select>
          </td>
          <td>
            <div className="frist">
              <div>Frist</div>
              <div className="piler">
                <div className="pil-opp border-bottom-gray" />
                <div className="pil-ned" />
              </div>
            </div>
          </td>
        </tr>
      </thead>
      <tbody>{genererTabellRader(oppgaver.rader)}</tbody>
    </table>
  );
};

const ytelseOversettelse = (ytelse: string): string => {
  switch (ytelse) {
    case "SYK":
      return "Sykepenger";
    default:
      return ytelse;
  }
};
const typeOversettelse = (type: string): string => {
  switch (type) {
    case "klage":
      return "Klage";
    default:
      return type;
  }
};

const OppgaveTabellRad = ({ id, type, ytelse, hjemmel, frist }: OppgaveRad) => {
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
      <td>{frist}</td>
      <td>
        <Knapp>Tildel meg</Knapp>
      </td>
      <td>
        <Checkbox className={"oppgave-checkbox"} label="&#8203;" />
      </td>
    </tr>
  );
};

const genererTabellRader = (rader: Array<OppgaveRad>): JSX.Element[] => {
  return rader.map((rad) => <OppgaveTabellRad key={rad.id} {...rad} />);
};

const App = (): JSX.Element => {
  const oppgaver = useSelector(selectOppgaver);
  const isFetching = useSelector(selectIsFetching);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(oppgaveRequest());
  }, []);
  return (
    <Layout loading={isFetching}>
      <>
        <div className="knapperad">
          <div className="left">
            <Hovedknapp>Tildel meg neste sak</Hovedknapp>
          </div>
          <div className="right">
            <Knapp>Tildel flere</Knapp>
            <Checkbox label="&#8203;" />
          </div>
        </div>

        <OppgaveTabell rader={oppgaver.rader} />
      </>
    </Layout>
  );
};

export default App;
