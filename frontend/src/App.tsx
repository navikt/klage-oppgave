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

import {
  OppgaveRad,
  OppgaveRader,
  oppgaveRequest,
  oppgaveTransformerRader,
} from "./tilstand/moduler/oppgave";
import {
  selectOppgaver,
  selectIsFetching,
} from "./tilstand/moduler/oppgave.velgere";

const OppgaveTabell = (oppgaver: OppgaveRader) => {
  const dispatch = useDispatch();
  const [sortToggle, setSortToggle] = useState(0); // dette er bare for test, skal fjernes
  const [hjemmelFilter, settHjemmelFilter] = useState<string | undefined>(
    undefined
  );
  const [ytelseFilter, settYtelseFilter] = useState<string | undefined>(
    undefined
  );
  const [typeFilter, settTypeFilter] = useState<"KLAGE" | "ANKE" | undefined>(
    undefined
  );
  const [sorteringFilter, settSorteringFilter] = useState<
    "ASC" | "DESC" | undefined
  >("ASC");

  useEffect(() => {
    dispatchTransformering();
  }, [hjemmelFilter, ytelseFilter, typeFilter, sorteringFilter]);

  const dispatchTransformering = () =>
    dispatch(
      oppgaveTransformerRader({
        sortering: {
          frist: sorteringFilter,
        },
        filtrering: {
          hjemmel: hjemmelFilter,
          type: typeFilter,
          ytelse: ytelseFilter,
        },
      })
    );

  const byttSortering = (
    event: React.MouseEvent<HTMLElement | HTMLButtonElement>
  ) => {
    event.preventDefault();
    if (sortToggle === 0) {
      settSorteringFilter("DESC");
      setSortToggle(1);
    } else {
      settSorteringFilter("ASC");
      setSortToggle(0);
    }
  };

  const filtrerHjemmel = (event: React.ChangeEvent<HTMLSelectElement>) => {
    event.preventDefault();
    if (event.target.value === hjemmelFilter) return;
    let hjemmel = undefined;
    if (event.target.value !== "Alle") {
      hjemmel = event.target.value;
      settHjemmelFilter(hjemmel || undefined);
    } else {
      settHjemmelFilter(undefined);
    }
  };

  const filtrerYtelse = (event: React.ChangeEvent<HTMLSelectElement>) => {
    event.preventDefault();
    if (event.target.value === ytelseFilter) return;
    let ytelse = undefined;
    if (event.target.value !== "Alle") {
      ytelse = event.target.value;
      settYtelseFilter(ytelse || undefined);
    } else {
      settYtelseFilter(undefined);
    }
  };

  const filtrerType = (event: React.ChangeEvent<HTMLSelectElement>) => {
    event.preventDefault();
    if (event.target.value === typeFilter) return;
    let type = undefined;
    if (event.target.value !== "Alle") {
      type = event.target.value as "KLAGE" | "ANKE";
      settTypeFilter(type || undefined);
    } else {
      settTypeFilter(undefined);
    }
  };

  return (
    <table className="tabell tabell--stripet" cellSpacing={0} cellPadding={10}>
      <thead>
        <tr>
          <th>
            <Select label="&#8203;" className="fw120" onChange={filtrerType}>
              <option value="">Type</option>
              <option value="klage">Klage</option>
              <option value="anke">Anke</option>
            </Select>
          </th>
          <th>
            <Select label="&#8203;" className="fw120" onChange={filtrerYtelse}>
              <option value="">Ytelse</option>
              <option value="SYK">Sykepenger</option>
              <option value="DAG">Dagpenger</option>
              <option value="FOR">Foreldrepenger</option>
            </Select>
          </th>
          <th>
            <Select label="&#8203;" className="fw120" onChange={filtrerHjemmel}>
              <option value="">Hjemmel</option>
              <option value={undefined}>Alle</option>
              <option value="8-1">8-1</option>
              <option value="8-1">8-4</option>
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
          <th />
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
    case "DAG":
      return "Dagpenger";
    case "FOR":
      return "Foreledrepenger";
    default:
      return ytelse;
  }
};
const typeOversettelse = (type: string): string => {
  switch (type) {
    case "klage":
      return "Klage";
    case "anke":
      return "Anke";
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
