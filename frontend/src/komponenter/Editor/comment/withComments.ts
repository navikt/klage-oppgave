import { Transforms, Element, Node } from "slate";
import { ReactEditor } from "slate-react";

const withParagraphs = <T extends ReactEditor>(editor: T): T => {
  const { normalizeNode } = editor;

  editor.normalizeNode = (entry) => {
    const [node, path] = entry;

    if (Element.isElement(node)) {
      for (const [child, childPath] of Node.children(editor, path)) {
        if (Element.isElement(child) && editor.isInline(child)) {
          Transforms.unwrapNodes(editor, { at: childPath });
          return;
        }
      }
    }

    // Fall back to the original `normalizeNode` to enforce other constraints.
    normalizeNode(entry);
  };

  return editor;
};
