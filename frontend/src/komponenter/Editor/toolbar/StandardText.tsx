import React from "react";
import { TextSnippet } from "@styled-icons/material-outlined/TextSnippet";
import { ToolbarElement } from "@udecode/slate-plugins";
import { ELEMENT_STANDARD_TEXT } from "../types";
import { getToolbarTooltip } from "./Tooltip";

export const ToolbarButtonStandardText = ({ onClick }: { onClick: () => boolean }) => (
  <ToolbarElement
    type={ELEMENT_STANDARD_TEXT}
    onMouseDown={onClick}
    icon={<TextSnippet />}
    tooltip={getToolbarTooltip("Standardtekst")}
  />
);
