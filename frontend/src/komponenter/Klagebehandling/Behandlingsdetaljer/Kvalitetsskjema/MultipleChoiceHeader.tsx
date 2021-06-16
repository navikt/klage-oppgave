import React, { ReactNode, useCallback, useEffect, useRef, useState } from "react";
import styled from "styled-components";
import classNames from "classnames";
import { UseOnInteractOutsideParameters } from "../../../types";
import { Filter } from "../../../../tilstand/moduler/oppgave";

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

interface SelectListHeaderProps {
  label?: string;
  children: ReactNode | ReactNode[];
  onSelect: (filter: Filter[]) => void;
  valgmuligheter: Filter[];
  defaultValgte: Filter[];
  disabled?: boolean;
}

export const MultipleChoiceHeader = ({
  label,
  children,
  valgmuligheter,
  onSelect,
  defaultValgte,
  disabled = false,
}: SelectListHeaderProps) => {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(defaultValgte);
  const onClick = () => setOpen((o) => !o);

  const ref = useRef<HTMLDivElement>(null);
  useOnInteractOutside({ ref, onInteractOutside: () => setOpen(false), active: open });

  const onFilter = useCallback(
    (checked: boolean, valg: Filter) => {
      const newSelected = checked
        ? [...selected, valg]
        : selected.filter(({ value }) => value !== valg.value);
      setSelected(newSelected);
      onSelect(newSelected);
    },
    [selected, setSelected, onSelect]
  );

  return (
    <MultipleChoice ref={ref}>
      <div className={`skjemaelement__label`}>{label}</div>
      <button
        className={classNames("filterHeader", open && "open")}
        onClick={onClick}
        tabIndex={0}
        disabled={disabled}
      >
        {children}
      </button>
      {open && (
        <MultipleChoiceList>
          {valgmuligheter.map((valg) => (
            <MultipleChoiceRad
              key={valg.value}
              onFilter={(checked) => onFilter(checked, valg)}
              checked={selected.some(({ value }) => value === valg.value)}
            >
              {valg.label}
            </MultipleChoiceRad>
          ))}
        </MultipleChoiceList>
      )}
    </MultipleChoice>
  );
};

interface MultipleChoiceRadProps {
  children: ReactNode;
  onFilter: (checked: boolean) => void;
  checked: boolean;
}

export const MultipleChoiceRad = ({ children, onFilter, checked }: MultipleChoiceRadProps) => (
  <li>
    <label className={"filterLabel"}>
      <input type="checkbox" checked={checked} onChange={(e) => onFilter(e.target.checked)} />
      {children}
    </label>
  </li>
);

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
