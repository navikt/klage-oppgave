import { insertNodes, SPEditor } from "@udecode/slate-plugins";
import { BaseSelection, Transforms } from "slate";
import { ELEMENT_STANDARD_TEXT, StandardTextData, StandardTextNode } from "../types";

export const insertStandardText = (
  editor: SPEditor,
  data: StandardTextData,
  selection: BaseSelection
) => {
  const standardTextNode: StandardTextNode = {
    type: ELEMENT_STANDARD_TEXT,
    children: [{ text: data.standardText }],
    ...data,
  };

  insertNodes<StandardTextNode>(editor, standardTextNode, {
    at: selection?.focus,
  });
  Transforms.move(editor);
  //   if (insertSpaceAfterMention) {
  //     Transforms.insertText(editor, " ");
  //     Transforms.move(editor);
  //   }
};
