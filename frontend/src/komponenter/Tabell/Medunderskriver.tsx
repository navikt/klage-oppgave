import React from "react";
import { useSelector } from "react-redux";
import { velgOppgaver } from "../../tilstand/moduler/oppgave.velgere";
import { velgMeg } from "../../tilstand/moduler/meg.velgere";

function MedunderskriverStatus({ id, children }: { id: any; children: any }) {
  let rader = useSelector(velgOppgaver).rader;
  let meg = useSelector(velgMeg);
  if (!rader) return null;

  let oppgaven = Object.values(rader)
    .filter((o) => o.id === id)
    .map((t) => [t.id, t.erMedunderskriver, t.saksbehandler])
    .reduce(Object.assign, {});

  if (oppgaven[0][1]) {
    if (oppgaven[0][1] === meg.id) {
      return (
        <td data-testid={`${id}-text`}>
          <div className={"etikett etikett--medunderskriver"}>Medunderskriver</div>
        </td>
      );
    } else {
      return (
        <td data-testid={`${id}-text`}>
          <div className={"etikett etikett--medunderskriver"}>Sendt til medunderskriver</div>
        </td>
      );
    }
  } else return children;
}

export default MedunderskriverStatus;