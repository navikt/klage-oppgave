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
  settSide,
} from "./tilstand/moduler/oppgave";
import { selectOppgaver, selectIsFetching } from "./tilstand/moduler/oppgave.velgere";
import { NavLink, useParams } from "react-router-dom";
import { number } from "prop-types";

const OppgaveTabell: React.FunctionComponent = () => {
  const dispatch = useDispatch();
  const oppgaver = useSelector(selectOppgaver);

  const [sortToggle, setSortToggle] = useState(0); // dette er bare for test, skal fjernes
  const [hjemmelFilter, settHjemmelFilter] = useState<string | undefined>(undefined);
  const [ytelseFilter, settYtelseFilter] = useState<string | undefined>(undefined);
  const [typeFilter, settTypeFilter] = useState<"KLAGE" | "ANKE" | undefined>(undefined);
  const [sorteringFilter, settSorteringFilter] = useState<"ASC" | "DESC" | undefined>("ASC");

  useEffect(() => {
    dispatchTransformering();
    dispatch(settSide(1));
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

  const byttSortering = (event: React.MouseEvent<HTMLElement | HTMLButtonElement>) => {
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
    if (
      event.target.value.toLocaleLowerCase() !== "alle" ||
      event.target.value.toLocaleLowerCase() !== "hjemmel"
    ) {
      hjemmel = event.target.value;
      settHjemmelFilter(hjemmel);
    } else {
      settHjemmelFilter(undefined);
    }
  };

  const filtrerYtelse = (event: React.ChangeEvent<HTMLSelectElement>) => {
    event.preventDefault();
    if (event.target.value === ytelseFilter) return;
    let ytelse = undefined;
    if (
      event.target.value.toLocaleLowerCase() !== "alle" ||
      event.target.value.toLocaleLowerCase() !== "ytelse"
    ) {
      ytelse = event.target.value;
      settYtelseFilter(ytelse);
    } else {
      settYtelseFilter(undefined);
    }
  };

  const filtrerType = (event: React.ChangeEvent<HTMLSelectElement>) => {
    event.preventDefault();
    if (event.target.value === typeFilter) return;
    let type = undefined;
    if (
      event.target.value.toLocaleLowerCase() !== "alle" ||
      event.target.value.toLocaleLowerCase() !== "ytelse"
    ) {
      type = event.target.value as "KLAGE" | "ANKE";
      settTypeFilter(type);
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
              <option value={undefined}>Type</option>
              <option value="klage">Klage</option>
              <option value="anke">Anke</option>
            </Select>
          </th>
          <th>
            <Select label="&#8203;" className="fw120" onChange={filtrerYtelse}>
              <option value={undefined}>Ytelse</option>
              <option value="SYK">Sykepenger</option>
              <option value="DAG">Dagpenger</option>
              <option value="FOR">Foreldrepenger</option>
            </Select>
          </th>
          <th>
            <Select label="&#8203;" className="fw120" onChange={filtrerHjemmel}>
              <option value={undefined}>Hjemmel</option>
              <option value={undefined}>Alle</option>
              <option value="8-1">8-1</option>
              <option value="8-9">8-9</option>
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
      <tbody>{genererTabellRader()}</tbody>
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
        <Knapp className={"knapp"}>Tildel meg</Knapp>
      </td>
    </tr>
  );
};

const genererTabellRader = (): JSX.Element[] => {
  const oppgaver = useSelector(selectOppgaver);

  return oppgaver.utsnitt
    .slice(
      (oppgaver.meta.side - 1) * oppgaver.meta.treffPerSide,
      oppgaver.meta.treffPerSide + (oppgaver.meta.side - 1) * oppgaver.meta.treffPerSide
    )
    .map((rad) => <OppgaveTabellRad key={rad.id} {...rad} />);
};

type SideProps = {
  startSide: number;
  antallSider: number;
};
const Sider = ({ startSide, antallSider }: SideProps) => {
  let n = startSide;
  let out = [];
  let temp = [];
  let j = 0;
  let it = 2;
  temp.push(
    <span className={"pagpad"} key={`n${n}`}>
      {n}
    </span>
  );
  while (n-- > 1 && j++ < it) {
    temp.push(
      <NavLink className={"pagpad"} key={`n${n}`} to={`/saker/${n}`}>
        {n}
      </NavLink>
    );
  }
  if (startSide > it + 1) {
    temp.push(
      <span key={"dotdot1"} className={"pagpad dots"}>
        ...
      </span>
    );
    temp.push(
      <NavLink className={"pagpad"} key={`side${1}`} to={`/saker/${1}`}>
        {1}
      </NavLink>
    );
  }
  out.push(temp.reverse());
  j = 0;
  n = startSide;
  while (n++ < antallSider && j++ < it) {
    out.push(
      <NavLink className={"pagpad"} key={`side${n}`} to={`/saker/${n}`}>
        {n}
      </NavLink>
    );
  }
  if (n < antallSider) {
    out.push(
      <span key={"dotdot2"} className={"pagpad dots"}>
        ...
      </span>
    );
    out.push(
      <NavLink className={"pagpad"} key={`side${antallSider}`} to={`/saker/${antallSider}`}>
        {antallSider}
      </NavLink>
    );
  }
  return <>{out.map((element) => element)}</>;
};

const App = (): JSX.Element => {
  const oppgaver = useSelector(selectOppgaver);
  const isFetching = useSelector(selectIsFetching);
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

        <OppgaveTabell />
        <div className="table-lbl">
          <div className={"debug"}>
            Viser{" "}
            {oppgaver.utsnitt.length < oppgaver.meta.treffPerSide
              ? oppgaver.utsnitt.length
              : oppgaver.meta.treffPerSide}
            {oppgaver.utsnitt.length === 1 ? " rad " : " rader "}i utvalget av{" "}
            {oppgaver.meta.antall}
            <div>
              Side {oppgaver.meta.side} av
              {" " + oppgaver.meta.sider}
            </div>
          </div>
          <div className={"paginering"}>
            <Sider startSide={oppgaver.meta.side} antallSider={oppgaver.meta.sider} />
          </div>
        </div>
      </>
    </Oppsett>
  );
};

/*
                        <NavLink className={"pagineringslenke"} to={`/saker/${oppgaver.meta.side - 1}`}>Forrige side</NavLink>
                        <NavLink className={"pagineringslenke"} to={`/saker/${oppgaver.meta.side + 1}`}>Neste side</NavLink>

 */

export default App;
