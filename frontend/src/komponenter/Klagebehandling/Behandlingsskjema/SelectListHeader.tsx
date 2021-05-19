import React, { useEffect, useRef, useState } from "react";
import classNames from "classnames";
import {
  FilterMenuItemProps,
  SelectListHeaderProps,
  UseOnInteractOutsideParameters,
} from "../../types";
import { Filter } from "../../../tilstand/moduler/oppgave";

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

export function settHjemmel(
  updateFunc: Function,
  hjemmel: Filter | Filter[],
  valgteHjemler: Filter[]
): void {
  if (Array.isArray(hjemmel)) {
    let f = valgteHjemler.slice();
    let finnesIListe = false;
    f.forEach((r: Filter) => {
      if (r.label === hjemmel[0].label) finnesIListe = true;
    });
    if (finnesIListe) {
      f = f.filter((r: Filter) => r.label !== hjemmel[0].label);
    } else {
      f.push({ label: hjemmel[0].label, value: hjemmel[0].value });
    }
    updateFunc(f);
  }

  return;
}

export const SelectListHeader = ({
  children,
  valgmuligheter,
  onSelect,
  aktiveValgmuligheter,
  dispatchFunc,
  kolonner = 1,
}: SelectListHeaderProps) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLTableHeaderCellElement>(null);
  const isFirstRun = useRef(true);
  const onClick = () => setOpen((o) => !o);
  useOnInteractOutside({ ref, onInteractOutside: () => setOpen(false), active: open });

  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }

    if (!open) {
      dispatchFunc(aktiveValgmuligheter);
    }
  }, [open]);

  return (
    <th scope="col" ref={ref} colSpan={kolonner}>
      <button className={classNames("filterHeader", open && "open")} onClick={onClick} tabIndex={0}>
        {children}
      </button>
      {open && (
        <ul className={"filterList"}>
          <hr />
          {valgmuligheter.map((valg, i) => (
            <FilterRad
              key={valg.label as string}
              onFilter={() => onSelect([valg])}
              aktiv={
                aktiveValgmuligheter.find(
                  (aktivValgmulighet) => aktivValgmulighet.label === valg.label
                ) !== undefined
              }
            >
              {valg.label}
            </FilterRad>
          ))}
        </ul>
      )}
    </th>
  );
};
export default SelectListHeader;
