import React from "react";
import { FormatListBulleted } from "@styled-icons/material/FormatListBulleted";
import { FormatListNumbered } from "@styled-icons/material/FormatListNumbered";
import { ELEMENT_OL, ELEMENT_UL, ToolbarList, useSlatePluginType } from "@udecode/slate-plugins";
import { getToolbarTooltip } from "./Tooltip";

export const ToolbarButtonsList = () => (
  <>
    <ToolbarList
      type={useSlatePluginType(ELEMENT_UL)}
      icon={<FormatListBulleted />}
      tooltip={getToolbarTooltip("Punktliste")}
    />
    <ToolbarList
      type={useSlatePluginType(ELEMENT_OL)}
      icon={<FormatListNumbered />}
      tooltip={getToolbarTooltip("Nummerliste")}
    />
  </>
);
