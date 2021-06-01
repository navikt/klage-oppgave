export interface IMedunderskrivereState {
  medunderskrivere: IMedunderskriver[];
  loading: boolean;
}

export interface IMedunderskriver {
  navn: string;
  ident: string;
}
