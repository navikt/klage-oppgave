import { ISettMedunderskriverResponse } from "../medunderskrivere/types";
import { IVedlegg, Vedtak } from "./stateTypes";

export interface IKlagebehandlingOppdatering {
  klagebehandlingId: string;
  klagebehandlingVersjon: number;
  internVurdering: string;
  vedtak: Vedtak[];
  tilknyttedeDokumenter: TilknyttetDokument[];
}

export interface TilknyttetDokument {
  journalpostId: string;
  dokumentInfoId: string;
}

export interface IKlagebehandlingOppdateringResponse {
  klagebehandlingVersjon: number;
  modified: string;
}

export interface IVedleggResponse {
  modified: string;
  klagebehandlingVersjon: number;
  file: IVedlegg | null;
}

export interface IVedtakFullfoertResponse {
  klagebehandlingVersjon: number;
  modified: string; // LocalDateTime;
  ferdigstilt: string; // LocalDateTime;
  avsluttetAvSaksbehandler: string; // LocalDate;
}

export interface IMedunderskriverSatt extends ISettMedunderskriverResponse {
  medunderskriverident: string;
}
