import { Editor, Transforms, Element as SlateElement } from "slate";
import { ReactEditor } from "slate-react";

export enum Marks {
  BOLD = "bold",
  ITALIC = "italic",
  UNDERLINE = "underline",
}

const allMarks = Object.keys(Marks);

export const clearMarks = (editor: ReactEditor) =>
  allMarks.forEach((mark) => Editor.removeMark(editor, mark));

export const toggleMark = (editor: ReactEditor, mark: Marks) => {
  const isActive = isMarkActive(editor, mark);

  if (isActive) {
    Editor.removeMark(editor, mark);
  } else {
    Editor.addMark(editor, mark, true);
  }
};

export const isMarkActive = (editor: ReactEditor, mark: Marks) => {
  const marks = Editor.marks(editor);
  return marks ? marks[mark] === true : false;
};
