export interface Klagebehandling {
  id: string;
  person: any;
  type: number;
  tema: number;
  hjemmel: string;
  mottatt: string;
  klagebehandlingVersjon: number;
  erMedunderskriver: boolean;
  harMedunderskriver: boolean;
  medunderskriverident?: string;
  utfall?: string;
  avsluttetAvSaksbehandler?: boolean;
  erTildelt?: boolean;
  tildeltSaksbehandlerident: string;
}

export interface IPersonResultat {
  fnr: string;
  navn: string;
  klagebehandlinger: Klagebehandling[];
  aapneKlagebehandlinger: Klagebehandling[];
  avsluttedeKlagebehandlinger: Klagebehandling[];
}

export interface ISokResultat {
  antallTreffTotalt: number;
  personer: IPersonResultat[];
}
