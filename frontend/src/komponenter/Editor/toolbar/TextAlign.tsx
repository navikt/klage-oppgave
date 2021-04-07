import React from "react";
import { FormatAlignCenter } from "@styled-icons/material/FormatAlignCenter";
import { FormatAlignJustify } from "@styled-icons/material/FormatAlignJustify";
import { FormatAlignLeft } from "@styled-icons/material/FormatAlignLeft";
import { FormatAlignRight } from "@styled-icons/material/FormatAlignRight";
import {
  ELEMENT_ALIGN_CENTER,
  ELEMENT_ALIGN_JUSTIFY,
  ELEMENT_ALIGN_RIGHT,
  ToolbarAlign,
  useSlatePluginType,
} from "@udecode/slate-plugins";
import { getToolbarTooltip } from "./Tooltip";

export const ToolbarButtonsAlign = () => (
  <>
    <ToolbarAlign icon={<FormatAlignLeft />} tooltip={getToolbarTooltip("Venstrestill")} />
    <ToolbarAlign
      type={useSlatePluginType(ELEMENT_ALIGN_CENTER)}
      icon={<FormatAlignCenter />}
      tooltip={getToolbarTooltip("Midtstill")}
    />
    <ToolbarAlign
      type={useSlatePluginType(ELEMENT_ALIGN_RIGHT)}
      icon={<FormatAlignRight />}
      tooltip={getToolbarTooltip("Høyrestill")}
    />
    <ToolbarAlign
      type={useSlatePluginType(ELEMENT_ALIGN_JUSTIFY)}
      icon={<FormatAlignJustify />}
      tooltip={getToolbarTooltip("Justify")}
    />
  </>
);
