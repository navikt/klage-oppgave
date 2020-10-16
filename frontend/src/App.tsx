import React, { useEffect, useState } from "react";
import Oppsett from "./komponenter/Oppsett";
import { Knapp, Hovedknapp } from "nav-frontend-knapper";
import EtikettBase from "nav-frontend-etiketter";
import "./stilark/App.less";
import "./stilark/Lists.less";
import "./stilark/Tabell.less";
import "nav-frontend-tabell-style";

import { Checkbox, Select } from "nav-frontend-skjema";
import { useDispatch, useSelector } from "react-redux";
import { useEventCallback, useObservable } from "rxjs-hooks";
import { interval, Observable } from "rxjs";
import { map, mapTo } from "rxjs/operators";

import {
  oppgaveFiltrerHjemmel,
  OppgaveRad,
  OppgaveRader,
  oppgaveRequest,
  oppgaveSorterFristStigende,
  oppgaveSorterFristSynkende,
} from "./tilstand/moduler/oppgave";
import {
  selectOppgaver,
  selectIsFetching,
} from "./tilstand/moduler/oppgave.velgere";

const OppgaveTabell = (oppgaver: OppgaveRader) => {
  const dispatch = useDispatch();
  const [sortToggle, setSortToggle] = useState(0); // dette er bare for test, skal fjernes

  const byttSortering = (
    event: React.MouseEvent<HTMLElement | HTMLButtonElement>
  ) => {
    event.preventDefault();
    if (sortToggle === 0) {
      dispatch(oppgaveSorterFristStigende());
      setSortToggle(1);
    } else {
      dispatch(oppgaveSorterFristSynkende());
      setSortToggle(0);
    }
  };

  const filtrerHjemmel = (event: React.ChangeEvent<HTMLSelectElement>) => {
    event.preventDefault();
    let hjemmel = undefined;
    if (event.target.value !== "Alle") {
      hjemmel = event.target.value;
    }
    dispatch(oppgaveFiltrerHjemmel(hjemmel));
  };

  return (
    <table className="tabell tabell--stripet" cellSpacing={0} cellPadding={10}>
      <thead>
        <tr>
          <th>
            <Select label="&#8203;" className="fw120">
              <option value="">Type</option>
              <option value="klage">Klage</option>
              <option value="anke">Anke</option>
            </Select>
          </th>
          <th>
            <Select label="&#8203;" className="fw120">
              <option value="">Ytelse</option>
              <option value="sykepenger">Sykepenger</option>
              <option value="dagpenger">Dagpenger</option>
              <option value="foreldrepenger">Foreldrepenger</option>
            </Select>
          </th>
          <th>
            <Select label="&#8203;" className="fw120" onChange={filtrerHjemmel}>
              <option value="">Hjemmel</option>
              <option value={undefined}>Alle</option>
              <option value="8-1">8-1</option>
              <option value="mangler">mangler</option>
            </Select>
          </th>
          <th>
            <div className="frist" onClick={byttSortering}>
              <div>Frist</div>
              <div className="piler">
                {sortToggle === 0 && (
                  <>
                    <div className="pil-opp border-bottom-gray" />
                    <div className="pil-ned" />
                  </>
                )}
                {sortToggle === 1 && (
                  <>
                    <div className="pil-opp" />
                    <div className="pil-ned border-top-gray" />
                  </>
                )}
              </div>
            </div>
          </th>
          <th colSpan={2} />
        </tr>
      </thead>
      <tbody>{genererTabellRader(oppgaver.utsnitt)}</tbody>
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
  return rader
    .slice(0, 10)
    .map((rad) => <OppgaveTabellRad key={rad.id} {...rad} />);
};

const App = (): JSX.Element => {
  const oppgaver = useSelector(selectOppgaver);
  const isFetching = useSelector(selectIsFetching);
  const dispatch = useDispatch();
  //const value = useObservable(() => interval(500).pipe(map((val) => val * 3)));

  useEffect(() => {
    dispatch(oppgaveRequest());
  }, []);

  return (
    <Oppsett isFetching={isFetching}>
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

        <div className="table-lbl">
          Viser inntil 10 av {oppgaver.utsnitt.length} rader i utvalget
        </div>
        <OppgaveTabell utsnitt={oppgaver.utsnitt} />
      </>
    </Oppsett>
  );
};

export default App;
