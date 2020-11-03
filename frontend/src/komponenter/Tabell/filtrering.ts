import { ReactNode } from "react";

export interface Filter {
  /**
   * Navnet p� filteret. Rendres i en liste av alle filtere som kan velges for kolonnen. M� v�re unik for alle
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
