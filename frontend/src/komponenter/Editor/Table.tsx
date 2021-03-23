import React from "react";
import { RenderElementProps, useSlate } from "slate-react";
import { insertParagraph, isTable } from "./blocks";
import { UiButton } from "./UIButton";
import "./Table.less";

export const Table = ({ attributes, element, children }: RenderElementProps) => {
  const editor = useSlate();
  return (
    <section className="table-container">
      <div className="table-ui-container">
        <table>
          <tbody {...attributes}>{children}</tbody>
        </table>
        <TableContextButton className="over" onClick={() => insertParagraph(editor, true)}>
          Over
        </TableContextButton>
        <TableContextButton className="under" onClick={() => insertParagraph(editor, false)}>
          Under
        </TableContextButton>
      </div>
    </section>
  );
};

interface TableContextButtonProps {
  onClick: () => void;
  children: string;
  className?: string;
  visible?: boolean;
}

const TableContextButton = ({ onClick, children, className }: TableContextButtonProps) => {
  const editor = useSlate();

  if (isTable(editor)) {
    return (
      <UiButton className={className} onClick={onClick}>
        {children}
      </UiButton>
    );
  }

  return null;
};
