export enum Rekkefolge {
  stigende = "STIGENDE",
  synkende = "SYNKENDE",
}

export enum Sortering {
  frist = "FRIST",
}

export enum Projeksjon {
  utvidet = "UTVIDET",
}

export interface IPersonSokPayload {
  navIdent: string;
  soekString: string;
  rekkefoelge?: Rekkefolge;
  sortering?: Sortering;
  start: number;
  antall: number;
  projeksjon?: Projeksjon;
}
