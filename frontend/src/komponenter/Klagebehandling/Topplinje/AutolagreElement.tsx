import React, { useState } from "react";
import { Element } from "nav-frontend-typografi";
import Popover, { PopoverOrientering } from "nav-frontend-popover";
import { Ellipsis } from "../../../styled-components/ellipsis";
import Success from "../../SuccessIcon";
import styled from "styled-components";

interface Props {
  autosaveStatus: boolean;
}

const AutoLagreBeholder = styled.div`
  display: flex;
  justify-content: flex-end;
  color: #78706a;
  text-align: right;
  margin-top: 4px;
  @media (max-width: 570px) {
    position: absolute;
    right: 1em;
    top: 6.6em;
    background: white;
    border-radius: 0.5em;
    z-index: 10;
  }
`;

const AutosaveContent = styled.div`
  cursor: pointer;
  > svg {
    margin-right: 5px;
  }
  display: flex;
  flex-flow: row wrap;
  align-items: center;
`;

const LagringsIndikator = (props: Props) => {
  const [anker, setAnker] = useState<(EventTarget & HTMLDivElement) | undefined>(undefined);

  const togglePopover = (ankerEl: EventTarget & HTMLDivElement): void =>
    setAnker(anker ? undefined : ankerEl);

  return (
    <>
      <Popover
        ankerEl={anker}
        onRequestClose={() => setAnker(undefined)}
        orientering={PopoverOrientering.UnderHoyre}
      >
        <p style={{ padding: "16px", position: "absolute" }}>Endringene lagres automatisk.</p>
      </Popover>

      <AutoLagreBeholder>
        <AutosaveContent onClick={(e) => togglePopover(e.currentTarget)}>
          {visStatus(props.autosaveStatus)}
        </AutosaveContent>
      </AutoLagreBeholder>
    </>
  );
};

const visStatus = (status: boolean) => {
  if (status) {
    return (
      <Element>
        <Ellipsis>Lagrer</Ellipsis>
      </Element>
    );
  }
  if (!status) {
    return (
      <>
        <Success />
        <Element>Lagret</Element>
      </>
    );
  }
  return null;
};

export default LagringsIndikator;
