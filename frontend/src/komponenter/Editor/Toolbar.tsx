import React from "react";
import { useSlate } from "slate-react";
import cx from "classnames";
import { clearMarks, isMarkActive, Marks, toggleMark } from "./marks";
import { Blocks, insertTable, insertTableRow, isBlockActive, toggleBlock } from "./blocks";
import { UiButton } from "./UIButton";
import "./Toolbar.less";

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
      <BlockTogglekButton block={Blocks.H1}>H1</BlockTogglekButton>
      <BlockTogglekButton block={Blocks.H2}>H2</BlockTogglekButton>
      <BlockTogglekButton block={Blocks.H3}>H3</BlockTogglekButton>
      <BlockTogglekButton block={Blocks.H4}>H4</BlockTogglekButton>
      <BlockTogglekButton block={Blocks.PARAGRAPH}>Paragraf</BlockTogglekButton>
      <BlockTogglekButton block={Blocks.BULLET_LIST}>Punktliste</BlockTogglekButton>
      <BlockTogglekButton block={Blocks.NUMBERED_LIST}>Nummerliste</BlockTogglekButton>
      <BlockInsertkButton block={Blocks.TABLE} onClick={() => insertTable(editor)}>
        Table
      </BlockInsertkButton>
      <ToolbarButton onClick={() => insertTableRow(editor)}>Table row</ToolbarButton>
    </section>
  );
};

interface BlockButtonProps {
  block: Blocks;
  children: string;
  onClick?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
}

const BlockTogglekButton = ({ block, onClick, children }: BlockButtonProps) => {
  const editor = useSlate();
  const isActive = isBlockActive(editor, block);
  return (
    <ToolbarButton active={isActive} onClick={onClick ?? (() => toggleBlock(editor, block))}>
      {children}
    </ToolbarButton>
  );
};

const BlockInsertkButton = ({ block, onClick, children }: BlockButtonProps) => {
  const editor = useSlate();
  const isActive = isBlockActive(editor, block);
  return (
    <ToolbarButton
      active={isActive}
      disabled={isActive}
      onClick={onClick ?? (() => toggleBlock(editor, block))}
    >
      {children}
    </ToolbarButton>
  );
};

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
