import React from "react";
import { RenderElementProps } from "slate-react";
import { isHeading, isStandardText } from "./blocks";
import { StandardTextElement } from "./StandardText";
import { Table } from "./Table";
import { ListBlockTypes, NestedBlockTypes, TopBlockTypes } from "./types";

export const Element = (props: RenderElementProps) => {
  const { attributes, children, element } = props;

  if (isHeading(element)) {
    switch (element.level) {
      case 1:
        return <h1 {...attributes}>{children}</h1>;
      case 2:
        return <h2 {...attributes}>{children}</h2>;
      case 3:
        return <h3 {...attributes}>{children}</h3>;
      case 4:
        return <h4 {...attributes}>{children}</h4>;
      default:
        return <h1 {...attributes}>{children}</h1>;
    }
  }

  if (isStandardText(element)) {
    return <StandardTextElement element={element} attributes={attributes} children={children} />;
  }

  switch (element.type) {
    case ListBlockTypes.BULLET_LIST:
      return <ul {...attributes}>{children}</ul>;
    case ListBlockTypes.NUMBERED_LIST:
      return <ol {...attributes}>{children}</ol>;
    case NestedBlockTypes.LIST_ITEM:
      return <li {...attributes}>{children}</li>;
    case TopBlockTypes.BLOCK_QUOTE:
      return <blockquote {...attributes}>{children}</blockquote>;
    case TopBlockTypes.TABLE:
      return <Table {...props} />;
    case NestedBlockTypes.TABLE_ROW:
      return <tr {...attributes}>{children}</tr>;
    case NestedBlockTypes.TABLE_CELL:
      return <td {...attributes}>{children}</td>;
    default:
      return <p {...attributes}>{children}</p>;
  }
};
