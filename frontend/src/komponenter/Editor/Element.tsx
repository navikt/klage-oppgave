import React from "react";
import { RenderElementProps } from "slate-react";
import { Blocks, VoidBlocks } from "./blocks";
import { StandardText } from "./StandardText";
import { Table } from "./Table";

export const Element = (props: RenderElementProps) => {
  const { attributes, children, element } = props;

  switch (element.type) {
    case Blocks.H1:
      return <h1 {...attributes}>{children}</h1>;
    case Blocks.H2:
      return <h2 {...attributes}>{children}</h2>;
    case Blocks.H3:
      return <h3 {...attributes}>{children}</h3>;
    case Blocks.H4:
      return <h4 {...attributes}>{children}</h4>;
    case Blocks.BULLET_LIST:
      return <ul {...attributes}>{children}</ul>;
    case Blocks.NUMBERED_LIST:
      return <ol {...attributes}>{children}</ol>;
    case Blocks.LIST_ITEM:
      return <li {...attributes}>{children}</li>;
    case Blocks.BLOCK_QUOTE:
      return <blockquote {...attributes}>{children}</blockquote>;
    case Blocks.TABLE:
      return <Table {...props} />;
    case Blocks.TABLE_ROW:
      return <tr {...attributes}>{children}</tr>;
    case Blocks.TABLE_CELL:
      return <td {...attributes}>{children}</td>;
    case VoidBlocks.STANDARD_TEXT:
      return <StandardText element={element} attributes={attributes} children={children} />;
    default:
      return <p {...attributes}>{children}</p>;
  }
};
