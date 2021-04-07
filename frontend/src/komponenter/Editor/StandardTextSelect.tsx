import React, { KeyboardEventHandler, useCallback, useEffect, useRef, useState } from "react";
import { getPreventDefaultHandler } from "@udecode/slate-plugins-common";
import { useTSlate } from "@udecode/slate-plugins-core";
import { PortalBody } from "@udecode/slate-plugins-ui-fluent";
import styled from "styled-components";
import { GetStandardTextSelectProps } from "./standardText/useStandardTextPlugin";
import { BaseSelection } from "slate";

interface StandardTextSelectProps extends GetStandardTextSelectProps {
  selection: BaseSelection;
}

export const StandardTextSelect = ({
  options,
  isOpen,
  query,
  onSelect,
  onQueryChange,
  close,
  selection,
  ...props
}: StandardTextSelectProps) => {
  const editor = useTSlate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [valueIndex, setValueIndex] = useState(0);

  const onKeyDown: KeyboardEventHandler<HTMLElement> = useCallback(
    (e) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        return setValueIndex(getNextIndex(valueIndex, options.length - 1));
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        return setValueIndex(getPreviousIndex(valueIndex, options.length - 1));
      }
      if (e.key === "Escape") {
        e.preventDefault();
        return close();
      }

      if (e.key === "Enter") {
        e.preventDefault();
        onSelect(editor, options[valueIndex], selection);
        close();
        return false;
      }
    },
    [valueIndex, options, onSelect]
  );

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  return (
    <PortalBody>
      <Background {...props} onClick={close}>
        <Container onClick={(event) => event.stopPropagation()} onKeyDown={onKeyDown}>
          <QueryInput
            value={query}
            onChange={({ target }) => onQueryChange(target.value)}
            ref={inputRef}
          />
          <List>
            {options.map((option, i) => (
              <Option key={option.standardTextId}>
                <OptionButton
                  onMouseDown={(event) => {
                    event.preventDefault();
                    onSelect(editor, option, selection);
                    close();
                  }}
                  active={i === valueIndex}
                >
                  {option.standardText}
                </OptionButton>
              </Option>
            ))}
          </List>
        </Container>
      </Background>
    </PortalBody>
  );
};

const Background = styled.section`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(104, 104, 104, 0.5);
  z-index: 5;
`;

const Container = styled.section`
  display: block;
  width: 100%;
  max-width: 25em;
  margin: 0 auto;
  background-color: white;
  border-radius: 1em;
  padding: 2em;
  box-shadow: black 0px 0px 20px;
`;

const List = styled.ul`
  display: block;
  position: relative;
  width: 100%;
  padding: 0;
  list-style: none;
`;

const Option = styled.li`
  display: block;
  width: 100%;
`;

const OptionButton = styled.button<{ active: boolean }>`
  display: block;
  width: 100%;
  background-color: ${({ active }) => (active ? "lightblue" : "white")};
  border: none;
  cursor: pointer;
`;

const QueryInput = styled.input`
  display: block;
  width: 100%;
  background-color: #eee;
  border: 1px solid black;
  padding: 0.5em;
  border-radius: 0.25em;
  font-size: 1em;
`;

const getNextIndex = (i: number, max: number) => (i >= max ? 0 : i + 1);
const getPreviousIndex = (i: number, max: number) => (i <= 0 ? max : i - 1);
