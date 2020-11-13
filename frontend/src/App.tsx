import React, { useEffect } from "react";
import Oppsett from "./komponenter/Oppsett";
import { Hovedknapp, Knapp } from "nav-frontend-knapper";
import "./stilark/App.less";
import "./stilark/Lists.less";
import "nav-frontend-tabell-style";

import { useDispatch, useSelector } from "react-redux";

import { hentMegHandling } from "./tilstand/moduler/meg";

import { velgOppgaver } from "./tilstand/moduler/oppgave.velgere";
import OppgaveTabell from "./komponenter/Tabell/Tabell";

const App = (): JSX.Element => {
  const oppgaver = useSelector(velgOppgaver);
  const dispatch = useDispatch();

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

  return (
    <Oppsett isFetching={false}>
      <OppgaveTabell {...oppgaver} />
    </Oppsett>
  );
};

export default App;
