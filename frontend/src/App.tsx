import React, { useEffect, useState } from "react";
import Layout from "./components/Layout";
import { Knapp } from "nav-frontend-knapper";
import "./App.less";
import "./Lists.less";
import "./Tabell.less";
import { useDispatch, useSelector } from "react-redux";
import {
  OppgaveRad,
  OppgaveRader,
  oppgaveRequest,
} from "./state/modules/oppgave";
import {
  selectOppgaver,
  selectFetching,
} from "./state/modules/oppgave.selectors";

const OppgaveTabell = (oppgaver: OppgaveRader) => {
  return (
    <table className="oppgave">
      <tbody>{genererTabellRader(oppgaver.rader)}</tbody>
    </table>
  );
};

const OppgaveTabellRad = ({ id, type, ytelse, hjemmel, frist }: OppgaveRad) => {
  return (
    <tr>
      <td>{type}</td>
      <td>{id}</td>
      <td>{ytelse}</td>
      <td>{hjemmel}</td>
      <td>{frist}</td>
      <td>
        <button>Tildel meg</button>
      </td>
      <td>
        <input type="checkbox" />
      </td>
    </tr>
  );
};

const genererTabellRader = (rader: Array<OppgaveRad>): JSX.Element[] => {
  return rader.map((rad) => <OppgaveTabellRad key={rad.id} {...rad} />);
};

const App = (): JSX.Element => {
  const oppgaver = useSelector(selectOppgaver);
  const fetching = useSelector(selectFetching);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(oppgaveRequest());
  }, []);
  return (
    <Layout loading={fetching}>
      <>
        <Knapp>Tildel meg neste sak</Knapp>

        <OppgaveTabell rader={oppgaver.rader} />
      </>
    </Layout>
  );
};

export default App;
