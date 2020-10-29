import React, { useEffect } from "react";
import Oppsett from "./Oppsett";
import { Hovedknapp, Knapp } from "nav-frontend-knapper";
import "../stilark/App.less";
import "../stilark/Lists.less";
import "../stilark/Tabell.less";
import "nav-frontend-tabell-style";

import { Checkbox } from "nav-frontend-skjema";
import { useDispatch, useSelector } from "react-redux";

import { useParams } from "react-router-dom";
import Paginering from "./Paginering";
import OppgaveTabell from "./Oppgaver";
import { velgMineSaker, velgSideLaster } from "../tilstand/moduler/mine_saker.velgere";
import { hentMineSakerHandling, settSide } from "../tilstand/moduler/mine_saker";
import { hentMegHandling } from "../tilstand/moduler/meg";
import { velgMeg } from "../tilstand/moduler/meg.velgere";

const App = (): JSX.Element => {
  const oppgaver = useSelector(velgMineSaker);
  const sideLaster = useSelector(velgSideLaster);
  const saksbehandler = useSelector(velgMeg);
  const dispatch = useDispatch();

  interface ParamTypes {
    side: string | undefined;
  }

  const { side } = useParams<ParamTypes>();

  useEffect(() => {
    if (Number(side) > 0) dispatch(settSide(Number(side)));
  }, [side]);

  useEffect(() => {
    if (saksbehandler.id) {
      dispatch(hentMineSakerHandling(saksbehandler.id));
    }
  }, [saksbehandler]);

  useEffect(() => {
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

  console.log(oppgaver);

  return (
    <Oppsett isFetching={sideLaster}>
      <>
        <OppgaveTabell {...oppgaver} />
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
