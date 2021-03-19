import React from "react";
import { RenderLeafProps } from "slate-react";

export const Leaf = ({ attributes, children, leaf }: RenderLeafProps) => {
  if (leaf.bold === true) {
    children = <strong>{children}</strong>;
  }

  if (leaf.italic === true) {
    children = <em>{children}</em>;
  }

  if (leaf.underline === true) {
    children = <u>{children}</u>;
  }

  if (leaf.strikethrough === true) {
    children = <del>{children}</del>;
  }

  return <span {...attributes}>{children}</span>;
};
