import {
  OppgaveRad,
  OppgaveRader,
  oppgaveTransformerRader,
  settSide,
} from "../tilstand/moduler/oppgave";
import EtikettBase from "nav-frontend-etiketter";
import { Knapp } from "nav-frontend-knapper";
import { useDispatch, useSelector } from "react-redux";
import { velgOppgaver } from "../tilstand/moduler/oppgave.velgere";
import React, { useEffect, useState } from "react";
import { velgMeg } from "../tilstand/moduler/meg.velgere";
import { tildelMegHandling } from "../tilstand/moduler/saksbehandler";
import { Select } from "nav-frontend-skjema";
import { hjemler } from "../domene/hjemler.json";

type valgtOppgaveType = {
  id: string;
  versjon: number;
};

const OppgaveTabell: any = (oppgaver: OppgaveRader) => {
  const dispatch = useDispatch();
  const person = useSelector(velgMeg);

  const [sortToggle, setSortToggle] = useState(0); // dette er bare for test, skal fjernes
  const [hjemmelFilter, settHjemmelFilter] = useState<string | undefined>(undefined);
  const [ytelseFilter, settYtelseFilter] = useState<string | undefined>(undefined);
  const [typeFilter, settTypeFilter] = useState<string | undefined>(undefined);
  const [sorteringFilter, settSorteringFilter] = useState<"ASC" | "DESC" | undefined>("ASC");
  const [valgtOppgave, settValgOppgave] = useState<valgtOppgaveType>({ id: "", versjon: 0 });

  useEffect(() => {
    if (valgtOppgave.id) {
      dispatch(
        tildelMegHandling({
          oppgaveId: valgtOppgave.id,
          ident: person.id,
          versjon: valgtOppgave.versjon,
        })
      );
    }
  }, [valgtOppgave.id]);

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
    let value = event.target.options[event.target.selectedIndex].value;
    if (value === "reset" || value === "Hjemmel") {
      if (hjemmelFilter !== undefined) settHjemmelFilter(undefined);
    } else {
      if (hjemmelFilter !== value) settHjemmelFilter(value);
    }
  };

  const filtrerYtelse = (event: React.ChangeEvent<HTMLSelectElement>) => {
    event.preventDefault();
    let value = event.target.options[event.target.selectedIndex].value;
    if (value === "reset" || value === "Ytelse") {
      if (ytelseFilter !== undefined) settYtelseFilter(undefined);
    } else {
      if (ytelseFilter !== value) settYtelseFilter(value);
    }
  };

  const filtrerType = (event: React.ChangeEvent<HTMLSelectElement>) => {
    event.preventDefault();
    let value = event.target.options[event.target.selectedIndex].value;
    if (value === "reset" || value === "Type") {
      if (typeFilter !== undefined) settTypeFilter(undefined);
    } else {
      if (typeFilter !== value) settTypeFilter(value);
    }
  };

  return (
    <table className="tabell tabell--stripet" cellSpacing={0} cellPadding={10}>
      <thead>
        <tr>
          <th>
            <Select label="&#8203;" className="fw120" onChange={filtrerType}>
              <option value="reset">Type</option>
              <option value="klage">Klage</option>
              <option value="anke">Anke</option>
            </Select>
          </th>
          <th>
            <Select label="&#8203;" className="fw120" onChange={filtrerYtelse}>
              <option value="reset">Ytelse</option>
              <option value="SYK">Sykepenger</option>
              <option value="DAG">Dagpenger</option>
              <option value="FOR">Foreldrepenger</option>
            </Select>
          </th>
          <th>
            <Select label="&#8203;" className="fw120" onChange={filtrerHjemmel}>
              <option value="reset">Hjemmel</option>
              {hjemler.map((rad) => (
                <option key={rad} value={rad}>
                  {rad}
                </option>
              ))}
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
      <tbody>{genererTabellRader(settValgOppgave, oppgaver)}</tbody>
    </table>
  );
};

const ytelseOversettelse = (ytelse: string): string => {
  if (!ytelse) debugger;
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

const OppgaveTabellRad = ({
  id,
  type,
  ytelse,
  hjemmel,
  frist,
  versjon,
  settValgOppgave,
}: OppgaveRad) => {
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
        <Knapp className={"knapp"} onClick={(e) => settValgOppgave({ id, versjon })}>
          Tildel meg
        </Knapp>
      </td>
    </tr>
  );
};

const genererTabellRader = (settValgOppgaveId: Function, oppgaver: OppgaveRader): JSX.Element[] => {
  return oppgaver.utsnitt
    .slice(
      (oppgaver.meta.side - 1) * oppgaver.meta.treffPerSide,
      oppgaver.meta.treffPerSide + (oppgaver.meta.side - 1) * oppgaver.meta.treffPerSide
    )
    .map((rad: any) => (
      <OppgaveTabellRad key={rad.id} {...rad} settValgOppgave={settValgOppgaveId} />
    ));
};

export default OppgaveTabell;
