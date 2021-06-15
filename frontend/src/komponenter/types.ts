import React, { ReactNode } from "react";
import { Filter } from "../tilstand/moduler/oppgave";

export interface FiltrerbarHeaderProps {
  children: ReactNode | ReactNode[];
  onFilter: (filter: Filter | Filter[], override?: boolean) => void;
  filtre: Filter[];
  dispatchFunc: Function;
  aktiveFiltere: Filter[];
  kolonner?: number;
}

export interface UseOnInteractOutsideParameters {
  ref: React.RefObject<HTMLElement>;
  onInteractOutside: () => void;
  active: boolean;
}
export interface FilterMenuItemProps {
  children: ReactNode | ReactNode[];
  onFilter: () => void;
  aktiv: boolean;
}

export type valgtOppgaveType = {
  id: string;
  klagebehandlingVersjon: number;
};

export interface TabellHeader {
  /**
   * Det som skal rendres i `th`-elementet.
   */
  render: ReactNode;
  /**
   * Funksjon som kalles når bruker klikker på headeren.
   */
  onClick?: (val: any) => void;
  /**
   * Angir antall kolonner headeren strekker seg over
   */
  kolonner?: number;
}

export interface FiltrerbarTabellHeader extends TabellHeader {
  filtere: Filter[];
  onClick: (filter: Filter) => void;
}
