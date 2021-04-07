import React, { useMemo } from "react";
import { BaseEditor, Path, Node, Element, Editor, BaseSelection, Range } from "slate";
import { FormatBold } from "@styled-icons/material/FormatBold";
import { FormatItalic } from "@styled-icons/material/FormatItalic";
import { FormatUnderlined } from "@styled-icons/material/FormatUnderlined";
import { AddComment } from "@styled-icons/material-outlined/AddComment";
import { TippyProps } from "@tippyjs/react";
import {
  BalloonToolbar,
  MARK_BOLD,
  MARK_ITALIC,
  MARK_UNDERLINE,
  ToolbarButton,
  ToolbarMark,
  useSlatePluginType,
} from "@udecode/slate-plugins";
import { Tooltip } from "./Tooltip";
import { useSlate } from "slate-react";
import { ELEMENT_COMMENTS } from "../types";

interface BallonToolbarProps {
  onAddComment: () => void;
}

const theme = "dark";
const direction = "top";
const hiddenDelay = 0;
const tooltip: TippyProps = {
  arrow: true,
  delay: 0,
  duration: [200, 0],
  hideOnClick: false,
  offset: [0, 17],
  placement: "top",
};

export const BallonToolbar = ({ onAddComment }: BallonToolbarProps) => {
  const editor = useSlate();
  const isComment = useMemo(() => getIsComment(editor, editor.selection), [
    editor,
    editor.selection,
  ]);

  return (
    <BalloonToolbar direction={direction} hiddenDelay={hiddenDelay} theme={theme} arrow={true}>
      <ToolbarMark
        type={useSlatePluginType(MARK_BOLD)}
        icon={<FormatBold />}
        tooltip={{ content: <Tooltip>Bold (Ctrl/⌘-B)</Tooltip>, ...tooltip }}
      />
      <ToolbarMark
        type={useSlatePluginType(MARK_ITALIC)}
        icon={<FormatItalic />}
        tooltip={{ content: <Tooltip>Italic (Ctrl/⌘-I)</Tooltip>, ...tooltip }}
      />
      <ToolbarMark
        type={useSlatePluginType(MARK_UNDERLINE)}
        icon={<FormatUnderlined />}
        tooltip={{ content: <Tooltip>Underline (Ctrl/⌘-U)</Tooltip>, ...tooltip }}
      />
      {isComment ? null : <ToolbarButton icon={<AddComment />} onMouseDown={onAddComment} />}
    </BalloonToolbar>
  );
};

const getIsComment = (editor: BaseEditor, selection: BaseSelection): boolean => {
  if (selection === null) {
    return false;
  }
  const comments = Node.elements(editor, {
    from: selection.focus.path,
    to: selection.anchor.path,
    reverse: !Range.isBackward(selection),
  });
  for (const [node, _] of comments) {
    if (Element.isElement(node) && node.type === ELEMENT_COMMENTS) {
      return true;
    }
  }
  return false;
};
