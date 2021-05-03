export enum Utfall {
  MEDHOLD = "Medhold",
  TRUKKET = "Trukket",
  RETUR = "Retur",
  OPPHEVET = "Opphevet",
  DELVIS_MEDHOLD = "Delvis medhold",
  OPPRETTHOLD = "Oppretthold",
  UGUNST = "Ugunst (Ugyldig)",
  AVVIST = "Avvist",
}

export enum OmgjoeringsgrunnValg {
  MANGELFULL_UTREDNING = "1a Mangelfull utredning",
  ANDRE_SAKSBEHANDLINGSFEIL = "1b Andre saksbehandlingsfeil",
  ENDRET_FAKTUM = "2b Endret faktum",
  FEIL_I_BEVISVURDERINGEN = "2b Feil i bevisvurderingen",
  FEIL_I_DEN_GENERELLE_LOVTOLKNINGEN = "3a Feil i den generelle lovtolkningen",
  FEIL_I_DEN_KONKRETE_RETTSANVENDELSEN = "3b Feil i den konkrete rettsanvendelsen",
}

export const utfallSomKreverOmgjoeringsgrunn: Utfall[] = [
  Utfall.OPPHEVET,
  Utfall.MEDHOLD,
  Utfall.DELVIS_MEDHOLD,
];
