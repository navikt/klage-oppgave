import React, { useEffect, useRef, useState } from "react";
import classNames from "classnames";
import {
  FilterMenuItemProps,
  FiltrerbarHeaderProps,
  UseOnInteractOutsideParameters,
} from "../types";
import { Filter } from "../../tilstand/moduler/oppgave";

export const useOnInteractOutside = ({
  ref,
  onInteractOutside,
  active,
}: UseOnInteractOutsideParameters) => {
  useEffect(() => {
    const onInteractWrapper = (event: FocusEvent | MouseEvent) => {
      if (active && !ref.current?.contains(event.target as HTMLElement)) onInteractOutside();
    };
    document.addEventListener("focusin", onInteractWrapper);
    document.addEventListener("click", onInteractWrapper);
    return () => {
      document.removeEventListener("focusin", onInteractWrapper);
      document.removeEventListener("click", onInteractWrapper);
    };
  }, [ref.current, active]);
};

export const FilterRad = ({ children, onFilter, aktiv }: FilterMenuItemProps) => (
  <li>
    <label className={"filterLabel"}>
      <input type="checkbox" checked={aktiv} onChange={onFilter} />
      {children}
    </label>
  </li>
);

export function settFilter(
  updateFunc: Function,
  filter: Filter | Filter[],
  aktiveFiltre: Filter[],
  velgAlleEllerIngen?: boolean | undefined
): void {
  if (velgAlleEllerIngen === true) {
    if (Array.isArray(filter)) updateFunc(filter);
  } else if (velgAlleEllerIngen === false) {
    updateFunc([]);
  } else {
    if (Array.isArray(filter)) {
      let f = aktiveFiltre.slice();
      let finnesIListe = false;
      f.forEach((r: Filter) => {
        if (r.label === filter[0].label) finnesIListe = true;
      });
      if (finnesIListe) {
        f = f.filter((r: Filter) => r.label !== filter[0].label);
      } else {
        f.push({ label: filter[0].label, value: filter[0].value });
      }
      updateFunc(f);
    }
  }
  return;
}

export const FiltrerbarHeader = ({
  children,
  filtre,
  onFilter,
  aktiveFiltere,
  dispatchFunc,
  kolonner = 1,
}: FiltrerbarHeaderProps) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLTableHeaderCellElement>(null);
  const isFirstRun = useRef(true);
  const onClick = () => setOpen((o) => !o);
  useOnInteractOutside({ ref, onInteractOutside: () => setOpen(false), active: open });
  const alleFiltreErAktive = filtre.every((filter) =>
    aktiveFiltere.find((aktivtFilter) => aktivtFilter.label === filter.label)
  );
  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }

    if (!open) {
      dispatchFunc(aktiveFiltere);
    }
  }, [open]);

  return (
    <th scope="col" ref={ref} colSpan={kolonner}>
      <button className={classNames("filterHeader", open && "open")} onClick={onClick} tabIndex={0}>
        {children}
      </button>
      {open && (
        <ul className={"filterList"}>
          <FilterRad
            onFilter={() => onFilter(filtre, !alleFiltreErAktive)}
            aktiv={alleFiltreErAktive}
          >
            {alleFiltreErAktive ? "Opphev alle" : "Velg alle"}
          </FilterRad>
          <hr />
          {filtre.map((filter, i) => (
            <FilterRad
              key={filter.label as string}
              onFilter={() => onFilter([filter])}
              aktiv={
                aktiveFiltere.find((aktivtFilter) => aktivtFilter.label === filter.label) !==
                undefined
              }
            >
              {filter.label}
            </FilterRad>
          ))}
        </ul>
      )}
    </th>
  );
};
export default FiltrerbarHeader;
