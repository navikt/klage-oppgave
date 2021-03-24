import React from "react";
import { useSlate } from "slate-react";
import cx from "classnames";
import { clearMarks, isMarkActive, Marks, toggleMark } from "./marks";
import {
  insertTable,
  insertTableRow,
  isBlockActive,
  isHeadingActive,
  isTable,
  setParagraph,
  toggleBlockQuote,
  toggleHeading,
  toggleList,
} from "./blocks";
import { UiButton } from "./UIButton";
import "./Toolbar.less";
import { BlockTypes, HeadingLevel, ListBlockTypes, TopBlockTypes } from "./types";

export interface ToolbarState {
  bold: boolean;
  italic: boolean;
  underline: boolean;
}

export const Toolbar = () => {
  const editor = useSlate();

  return (
    <section className="toolbar">
      <MarkButton mark={Marks.BOLD}>Bold</MarkButton>
      <MarkButton mark={Marks.ITALIC}>Italic</MarkButton>
      <MarkButton mark={Marks.UNDERLINE}>Underline</MarkButton>
      <ToolbarButton onClick={() => clearMarks(editor)}>Clear marks</ToolbarButton>
      <ToggleHeadingButton level={1} />
      <ToggleHeadingButton level={2} />
      <ToggleHeadingButton level={3} />
      <ToggleHeadingButton level={4} />
      <ToolbarButton
        onClick={() => setParagraph(editor)}
        active={isBlockActive(editor, TopBlockTypes.PARAGRAPH)}
        disabled={isBlockActive(editor, TopBlockTypes.PARAGRAPH)}
      >
        Paragraf
      </ToolbarButton>
      <ToolbarButton
        onClick={() => toggleBlockQuote(editor)}
        active={isBlockActive(editor, TopBlockTypes.BLOCK_QUOTE)}
      >
        Block quote
      </ToolbarButton>
      <ToolbarButton
        onClick={() => toggleList(editor, ListBlockTypes.BULLET_LIST)}
        active={isBlockActive(editor, ListBlockTypes.BULLET_LIST)}
      >
        Punktliste
      </ToolbarButton>
      <ToolbarButton
        onClick={() => toggleList(editor, ListBlockTypes.NUMBERED_LIST)}
        active={isBlockActive(editor, ListBlockTypes.NUMBERED_LIST)}
      >
        Nummerliste
      </ToolbarButton>
      <ToolbarButton
        onClick={() => insertTable(editor)}
        active={isTable(editor)}
        disabled={isTable(editor)}
      >
        Table
      </ToolbarButton>
      <ToolbarButton onClick={() => insertTableRow(editor)}>Table row</ToolbarButton>
    </section>
  );
};

interface BlockButtonProps {
  block: BlockTypes;
  children: string;
  onClick?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
}

interface MarkButtonProps {
  mark: Marks;
  children: string;
}

const MarkButton = ({ mark, children }: MarkButtonProps) => {
  const editor = useSlate();
  return (
    <ToolbarButton active={isMarkActive(editor, mark)} onClick={() => toggleMark(editor, mark)}>
      {children}
    </ToolbarButton>
  );
};

interface ToggleHeadingButtonProps {
  level: HeadingLevel;
}

const ToggleHeadingButton = ({ level }: ToggleHeadingButtonProps) => {
  const editor = useSlate();
  return (
    <ToolbarButton
      active={isHeadingActive(editor, level)}
      onClick={() => toggleHeading(editor, level)}
    >
      {`H${level}`}
    </ToolbarButton>
  );
};

interface ToolbarButtonProps {
  active?: boolean;
  disabled?: boolean;
  onClick: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  children: string;
}

const ToolbarButton = ({ active = false, onClick, children, disabled }: ToolbarButtonProps) => (
  <UiButton
    className={cx({ "toolbar-button": true, active })}
    onClick={onClick}
    disabled={disabled}
  >
    {children}
  </UiButton>
);
