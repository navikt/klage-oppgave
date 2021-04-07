import React from "react";
import { Looks3 } from "@styled-icons/material/Looks3";
import { Looks4 } from "@styled-icons/material/Looks4";
import { Looks5 } from "@styled-icons/material/Looks5";
import { Looks6 } from "@styled-icons/material/Looks6";
import { LooksOne } from "@styled-icons/material/LooksOne";
import { LooksTwo } from "@styled-icons/material/LooksTwo";
import {
  ELEMENT_H1,
  ELEMENT_H2,
  ELEMENT_H3,
  ELEMENT_H4,
  ELEMENT_H5,
  ELEMENT_H6,
  ToolbarElement,
  useSlatePluginType,
} from "@udecode/slate-plugins";
import { getToolbarTooltip } from "./Tooltip";

export const ToolbarButtonsHeadings = () => (
  <>
    <ToolbarElement
      type={useSlatePluginType(ELEMENT_H1)}
      icon={<LooksOne />}
      tooltip={getToolbarTooltip("Tittel nivå 1")}
    />
    <ToolbarElement
      type={useSlatePluginType(ELEMENT_H2)}
      icon={<LooksTwo />}
      tooltip={getToolbarTooltip("Tittel nivå 2")}
    />
    <ToolbarElement
      type={useSlatePluginType(ELEMENT_H3)}
      icon={<Looks3 />}
      tooltip={getToolbarTooltip("Tittel nivå 3")}
    />
    <ToolbarElement
      type={useSlatePluginType(ELEMENT_H4)}
      icon={<Looks4 />}
      tooltip={getToolbarTooltip("Tittel nivå 4")}
    />
    <ToolbarElement
      type={useSlatePluginType(ELEMENT_H5)}
      icon={<Looks5 />}
      tooltip={getToolbarTooltip("Tittel nivå 5")}
    />
    <ToolbarElement
      type={useSlatePluginType(ELEMENT_H6)}
      icon={<Looks6 />}
      tooltip={getToolbarTooltip("Tittel nivå 6")}
    />
  </>
);
