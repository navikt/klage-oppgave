import { ReactNode } from "react";

export interface Filter {
  /**
   * Navnet paa filteret. Rendres i en liste av alle filtere som kan velges for kolonnen. Maa vaere unik for alle
   * filtere i samme kolonne.
   */
  label: ReactNode;
}

export interface Filtrering {
  /**
   * Aktive filtere som brukes til � filtrere rader i tabellen.
   */
  filtere: {
    filter: Filter;
    kolonne: number;
    active: boolean;
  }[];
}
