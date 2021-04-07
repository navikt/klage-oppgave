import React from "react";
import { TippyProps } from "@tippyjs/react";
import styled from "styled-components";

const toolbarTooltipBase: TippyProps = {
  arrow: true,
  delay: 0,
  duration: [200, 0],
  hideOnClick: false,
  offset: [0, 5],
  placement: "bottom",
};

export const Tooltip = styled.span`
  background-color: rgb(36, 42, 49);
  padding: 0.5em;
  color: #fff;
  border-radius: 4px;
  font-size: 0.75em;
`;

export const getToolbarTooltip = (text: string) => ({
  content: <Tooltip>{text}</Tooltip>,
  ...toolbarTooltipBase,
});
