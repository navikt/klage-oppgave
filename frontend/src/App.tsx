import React, { useEffect } from "react";
import Oppsett from "./komponenter/Oppsett";
import { Hovedknapp, Knapp } from "nav-frontend-knapper";
import "./stilark/App.less";
import "./stilark/Lists.less";
import "nav-frontend-tabell-style";

import { Checkbox } from "nav-frontend-skjema";
import { useDispatch, useSelector } from "react-redux";

import { oppgaveRequest } from "./tilstand/moduler/oppgave";

import { hentMegHandling } from "./tilstand/moduler/meg";

import { velgOppgaver, velgSideLaster } from "./tilstand/moduler/oppgave.velgere";
import { useParams } from "react-router-dom";
import Paginering from "./komponenter/Paginering/Paginering";
import OppgaveTabell from "./komponenter/Tabell/Tabell";
import { velgMeg } from "./tilstand/moduler/meg.velgere";

const App = (): JSX.Element => {
  const oppgaver = useSelector(velgOppgaver);
  const meg = useSelector(velgMeg);
  const sideLaster = useSelector(velgSideLaster);
  const dispatch = useDispatch();

  interface ParamTypes {
    side: string | undefined;
  }

  let { side } = useParams<ParamTypes>();
  let tolketSide = parseInt(side as string, 10) || 1;
  let antall = 15;

  useEffect(() => {
    dispatch(hentMegHandling());
  }, []);

  useEffect(() => {
    if (meg.id) {
      dispatch(
        oppgaveRequest({
          ident: meg.id,
          antall: antall,
          start: tolketSide === 1 ? 0 : (tolketSide - 1) * antall,
          transformasjoner: {
            filtrering: {
              type: ["Anke"],
              hjemmel: ["8-65", "8-66"],
            },
            sortering: {
              frist: "stigende",
            },
          },
        })
      );
    }
  }, [meg.id, tolketSide]);

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
      <OppgaveTabell {...oppgaver} />
    </Oppsett>
  );
};

export default App;
