import React, { useEffect, useState } from "react";
import Layout from "./komponenter/Layout";
import { Knapp, Hovedknapp } from "nav-frontend-knapper";
import "./App.less";
import "./Lists.less";
import "./Tabell.less";
import { Checkbox } from "nav-frontend-skjema";
import { useDispatch, useSelector } from "react-redux";
import {
  OppgaveRad,
  OppgaveRader,
  oppgaveRequest,
} from "./tilstand/moduler/oppgave";
import {
  selectOppgaver,
  selectFetching,
} from "./tilstand/moduler/oppgave.selectors";

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
  const fetching = useSelector(selectFetching);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(oppgaveRequest());
  }, []);
  return (
    <Layout loading={fetching}>
      <>
        <div className="knapperad">
          <div className="left">
            <Hovedknapp>Tildel meg neste sak</Hovedknapp>
          </div>
          <div className="right">
            <Knapp>Tildel flere</Knapp>
          </div>
        </div>

        <OppgaveTabell rader={oppgaver.rader} />
      </>
    </Layout>
  );
};

export default App;
