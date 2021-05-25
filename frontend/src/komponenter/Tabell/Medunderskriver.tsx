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
  console.debug({ oppgaven });

  if (oppgaven[0].erMedunderskriver) {
    if (oppgaven[0].saksbehandler === meg.id) {
      return <td>Medunderskriver</td>;
    } else {
      return <td>Sendt til medunderskriver</td>;
    }
  }
  return children;
}

export default MedunderskriverStatus;

/*
1. Ingen status = erMedunderskriver = null
2. Sendt til medunderskriver og saksbehandler ikke er medunderskriver = false
3. Send til medunderskriver og saksbehandler er medunderskriver = true
4. Medunderskriver har godkjent = null , og feltet finalized er satt til tidspunktet den ble godkjent. (Dette feltet er ikke med i KlagebehandlingListView (ennå), disse klagebehandlingene dukker ikke opp i den vanlige lista..)
 */
