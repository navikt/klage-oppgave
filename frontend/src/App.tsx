import React, { useEffect } from "react";
import Oppsett from "./komponenter/Oppsett";
import { Hovedknapp, Knapp } from "nav-frontend-knapper";
import "./stilark/App.less";
import "./stilark/Lists.less";
import "./stilark/Tabell.less";
import "nav-frontend-tabell-style";

import { Checkbox } from "nav-frontend-skjema";
import { useDispatch, useSelector } from "react-redux";

import { oppgaveRequest, settSide } from "./tilstand/moduler/oppgave";

import { hentMegHandling } from "./tilstand/moduler/meg";

import { velgOppgaver, velgSideLaster } from "./tilstand/moduler/oppgave.velgere";
import { useParams } from "react-router-dom";
import Paginering from "./komponenter/Paginering";
import OppgaveTabell from "./komponenter/Oppgaver";

const App = (): JSX.Element => {
  const oppgaver = useSelector(velgOppgaver);
  const sideLaster = useSelector(velgSideLaster);
  const dispatch = useDispatch();

  interface ParamTypes {
    side: string | undefined;
  }

  const { side } = useParams<ParamTypes>();

  useEffect(() => {
    if (Number(side) > 0) dispatch(settSide(Number(side)));
  }, [side]);

  useEffect(() => {
    dispatch(oppgaveRequest());
    dispatch(hentMegHandling());
  }, []);

  if (oppgaver.meta.feilmelding) {
    return (
      <Oppsett isFetching={false}>
        <div className={"feil"}>
          <h1>{oppgaver.meta.feilmelding}</h1>
          <div>Vennligst forsøk igjen litt senere...</div>
        </div>
      </Oppsett>
    );
  }

  return (
    <Oppsett isFetching={sideLaster}>
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

        <OppgaveTabell />
        <div className="table-lbl">
          <div className={"paginering"}>
            <Paginering startSide={oppgaver.meta.side} antallSider={oppgaver.meta.sider} />
          </div>
        </div>
      </>
    </Oppsett>
  );
};

export default App;
