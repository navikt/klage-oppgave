import React from "react";
import { Node, Transforms } from "slate";
import { RenderElementProps, useSlate } from "slate-react";
import { StandardText, TopBlockTypes } from "./types";
import "./StandardText.less";
import { isBlockActive } from "./blocks";

interface StandardTextElementProps extends RenderElementProps {
  element: StandardText;
}

export const StandardTextElement = ({
  attributes,
  children,
  element,
}: StandardTextElementProps) => (
  <section {...attributes} className="standard-text-container">
    <p className="standard-text" data-id={element.standardTextId}>
      {children}
    </p>
    <ResetButton element={element} />
  </section>
);

interface ResetButtonProps {
  element: StandardText;
}

const ResetButton = ({ element }: ResetButtonProps) => {
  const editor = useSlate();
  const focused = isBlockActive(editor, TopBlockTypes.STANDARD_TEXT);
  if (!focused) {
    return null;
  }

  const reset = () => {
    Transforms.removeNodes(editor, { at: editor.selection?.focus });
    Transforms.insertNodes(editor, {
      type: TopBlockTypes.STANDARD_TEXT,
      children: [{ text: element.standardText }],
      standardText: element.standardText,
      standardTextId: element.standardTextId,
    });
  };
  return (
    <button className="reset-standard-text" onClick={reset} contentEditable={false}>
      Reset
    </button>
  );
};
