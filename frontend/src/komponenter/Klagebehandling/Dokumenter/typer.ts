import { IDokument } from "../../../tilstand/moduler/dokumenter/stateTypes";
import { IKlagebehandling } from "../../../tilstand/moduler/klagebehandling/stateTypes";
import { IFaner } from "../KlageBehandling";

export interface Item {
  id: string;
  journalpostId: string;
  dokumentInfoId: string;
}

export interface DokumenterProps {
  skjult: boolean;
  settFullvisning: (fullvisning: boolean) => void;
  fullvisning: boolean;
}

export interface DokumentTabellProps extends DokumenterProps {
  klagebehandling: IKlagebehandling;
  dokumenter: ITilknyttetDokument[];
}

export interface ITilknyttetDokument extends IDokument {
  tilknyttet: boolean;
}
