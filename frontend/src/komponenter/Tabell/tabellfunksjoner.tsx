import { OppgaveRad, OppgaveRader, OppgaveRadMedFunksjoner } from "../../tilstand/moduler/oppgave";
import React from "react";
import EtikettBase from "nav-frontend-etiketter";
import { typeOversettelse, ytelseOversettelse } from "../../domene/forkortelser";
import { Knapp } from "nav-frontend-knapper";

const OppgaveTabellRad = ({
  id,
  type,
  ytelse,
  hjemmel,
  frist,
  versjon,
  person,
  utvidetProjeksjon,
  settValgOppgave,
}: OppgaveRadMedFunksjoner) => {
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

      {utvidetProjeksjon && <td>{person?.navn}</td>}
      {utvidetProjeksjon && <td>{person?.fnr}</td>}
      <td>{frist}</td>
      <td>
        <Knapp className={"knapp"} onClick={(e) => settValgOppgave({ id, versjon })}>
          Tildel meg
        </Knapp>
      </td>
    </tr>
  );
};

export const genererTabellRader = (
  settValgOppgaveId: Function,
  oppgaver: OppgaveRader,
  utvidetProjeksjon: "UTVIDET" | undefined
): JSX.Element[] =>
  oppgaver.rader.map((rad: any) => (
    <OppgaveTabellRad
      key={rad.id}
      {...rad}
      utvidetProjeksjon={utvidetProjeksjon}
      settValgOppgave={settValgOppgaveId}
    />
  ));
