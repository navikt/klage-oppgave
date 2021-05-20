import React, { useEffect, useRef, useState } from "react";
import classNames from "classnames";
import {
  FilterMenuItemProps,
  SelectListHeaderProps,
  UseOnInteractOutsideParameters,
} from "../../types";
import { Filter } from "../../../tilstand/moduler/oppgave";
import styled from "styled-components";

const MultipleChoice = styled.div`
  button {
    font-family: "Source Sans Pro", Arial, sans-serif;
    font-size: 1rem;
    font-weight: 400;
    appearance: none;
    padding: 0.5rem;
    background-color: #fff;
    border-radius: 4px;
    border: 1px solid #6a6a6a;
    box-sizing: border-box;
    line-height: 1.375rem;
    height: fit-content;
    min-width: 300px;
    text-align: left;
  }
`;

const MultipleChoiceList = styled.ul`
  position: relative;
  list-style: none;
  margin: 0;
  padding: 0.5rem 1rem 0.5rem 0.75rem;
  border-radius: 0.25rem;
  background: #fff;
  border: 1px solid #c6c2bf;
  box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.3);

  li {
    padding: 0;
    margin: 0.5rem 0;
  }
`;

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

export const MultipleChoiceRad = ({ children, onFilter, aktiv }: FilterMenuItemProps) => (
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

export const MultipleChoiceHeader = ({
  children,
  valgmuligheter,
  onSelect,
  aktiveValgmuligheter,
  dispatchFunc,
}: SelectListHeaderProps) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
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
    <MultipleChoice ref={ref}>
      <button className={classNames("filterHeader", open && "open")} onClick={onClick} tabIndex={0}>
        {children}
      </button>
      {open && (
        <MultipleChoiceList>
          {valgmuligheter.map((valg, i) => (
            <MultipleChoiceRad
              key={valg.label as string}
              onFilter={() => onSelect([valg])}
              aktiv={
                aktiveValgmuligheter.find(
                  (aktivValgmulighet) => aktivValgmulighet.label === valg.label
                ) !== undefined
              }
            >
              {valg.label}
            </MultipleChoiceRad>
          ))}
        </MultipleChoiceList>
      )}
    </MultipleChoice>
  );
};
export default MultipleChoiceHeader;
