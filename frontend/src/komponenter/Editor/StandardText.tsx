import React from "react";
import { RenderElementProps } from "slate-react";
import { StandardTextElement } from "./types";

interface StandardTextProps extends RenderElementProps {
  element: StandardTextElement;
}

export const StandardText = ({ attributes, children, element }: StandardTextProps) => (
  <div {...attributes} contentEditable={false} style={{ userSelect: "none" }}>
    <p data-id={element.standardTextId}>{element.standardText}</p>
    {children}
  </div>
);
