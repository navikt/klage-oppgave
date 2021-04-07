import React from "react";
import { Subscript } from "@styled-icons/foundation/Subscript";
import { Superscript } from "@styled-icons/foundation/Superscript";
import { FormatBold } from "@styled-icons/material/FormatBold";
import { FormatItalic } from "@styled-icons/material/FormatItalic";
import { FormatQuote } from "@styled-icons/material/FormatQuote";
import { FormatStrikethrough } from "@styled-icons/material/FormatStrikethrough";
import { FormatUnderlined } from "@styled-icons/material/FormatUnderlined";
import {
  ELEMENT_BLOCKQUOTE,
  MARK_BOLD,
  MARK_ITALIC,
  MARK_STRIKETHROUGH,
  MARK_SUBSCRIPT,
  MARK_SUPERSCRIPT,
  MARK_UNDERLINE,
  ToolbarElement,
  ToolbarMark,
  useSlatePluginType,
} from "@udecode/slate-plugins";
import { getToolbarTooltip } from "./Tooltip";

export const ToolbarButtonsMarks = () => {
  return (
    <>
      <ToolbarElement
        type={useSlatePluginType(ELEMENT_BLOCKQUOTE)}
        icon={<FormatQuote />}
        tooltip={getToolbarTooltip("Block quote")}
      />
      <ToolbarMark
        type={useSlatePluginType(MARK_BOLD)}
        icon={<FormatBold />}
        tooltip={getToolbarTooltip("Uthevet")}
      />
      <ToolbarMark
        type={useSlatePluginType(MARK_ITALIC)}
        icon={<FormatItalic />}
        tooltip={getToolbarTooltip("Kursiv")}
      />
      <ToolbarMark
        type={useSlatePluginType(MARK_UNDERLINE)}
        icon={<FormatUnderlined />}
        tooltip={getToolbarTooltip("Understreket")}
      />
      <ToolbarMark
        type={useSlatePluginType(MARK_STRIKETHROUGH)}
        icon={<FormatStrikethrough />}
        tooltip={getToolbarTooltip("Gjennomstreket")}
      />
      <ToolbarMark
        type={useSlatePluginType(MARK_SUPERSCRIPT)}
        clear={useSlatePluginType(MARK_SUBSCRIPT)}
        icon={<Superscript />}
        tooltip={getToolbarTooltip("Superscript")}
      />
      <ToolbarMark
        type={useSlatePluginType(MARK_SUBSCRIPT)}
        clear={useSlatePluginType(MARK_SUPERSCRIPT)}
        icon={<Subscript />}
        tooltip={getToolbarTooltip("Subscript")}
      />
    </>
  );
};
