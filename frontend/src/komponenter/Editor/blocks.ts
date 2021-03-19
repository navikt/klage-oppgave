import { Editor, Transforms, Node, Element as SlateElement, Path, Descendant } from "slate";
import { ReactEditor } from "slate-react";
import { EditableBlock, CustomElement, LeafType, NonEditableBlock } from "./types";

export enum Blocks {
  PARAGRAPH = "paragraph",
  H1 = "heading-one",
  H2 = "heading-two",
  H3 = "heading-three",
  H4 = "heading-four",
  BULLET_LIST = "bulleted-list",
  NUMBERED_LIST = "numbered-list",
  LIST_ITEM = "list-item",
  BLOCK_QUOTE = "block-quote",
  TABLE = "table",
  TABLE_ROW = "table-row",
  TABLE_CELL = "table-cell",
}

export enum VoidBlocks {
  STANDARD_TEXT = "standard-text",
}

export const VOID_BLOCK_TYPES = Object.keys(VoidBlocks);
export const BLOCK_TYPES = Object.keys(Blocks);

export const LIST_TYPES = [Blocks.NUMBERED_LIST, Blocks.BULLET_LIST];
export const HEADING_TYPES = [Blocks.H1, Blocks.H2, Blocks.H3, Blocks.H4];

export const isBlockElement = (element: Descendant): element is EditableBlock =>
  typeof element.type === "string" && BLOCK_TYPES.includes(element.type);

export const isVoidElement = (element: Descendant): element is NonEditableBlock =>
  typeof element.type === "string" && VOID_BLOCK_TYPES.includes(element.type);

export const isLeaf = (element: Descendant): element is LeafType =>
  typeof element.type === "undefined";

export const toggleBlock = (editor: ReactEditor, format: Blocks) => {
  const isActive = isBlockActive(editor, format);
  const isList = LIST_TYPES.includes(format);

  Transforms.unwrapNodes(editor, {
    match: (n) => {
      if (!Editor.isEditor(n) && SlateElement.isElement(n)) {
        return LIST_TYPES.includes(n.type as Blocks);
      }
      return false;
    },
    split: true,
  });
  const newProperties: Partial<SlateElement> = {
    type: isActive ? Blocks.PARAGRAPH : isList ? Blocks.LIST_ITEM : format,
  };
  Transforms.setNodes(editor, newProperties);

  if (!isActive && isList) {
    const block = { type: format, children: [] };
    Transforms.wrapNodes(editor, block);
  }
};

export const insertTable = (editor: ReactEditor) => {
  if (editor.selection === null) {
    return;
  }
  // Transforms.splitNodes(editor, {
  //   at: editor.selection.focus,
  //   always: true,
  // });
  Transforms.insertNodes(
    editor,
    {
      type: Blocks.TABLE,
      children: [
        {
          type: Blocks.TABLE_ROW,
          children: [
            {
              type: Blocks.TABLE_CELL,
              children: [
                {
                  text: "",
                },
              ],
            },
          ],
        },
      ],
    },
    {
      // match: (n) => n.type === Blocks.PARAGRAPH,
      mode: "lowest",
    }
  );
  // Transforms.insertNodes(editor, [
  //   {
  //     type: Blocks.TABLE,
  //     children: [
  //       {
  //         type: Blocks.TABLE_ROW,
  //         children: [
  //           {
  //             type: Blocks.TABLE_CELL,
  //             children: [
  //               {
  //                 text: "",
  //               },
  //             ],
  //           },
  //         ],
  //       },
  //     ],
  //   },
  //   {
  //     type: Blocks.PARAGRAPH,
  //     children: [
  //       {
  //         text: "",
  //       },
  //     ],
  //   },
  // ]);
};

export const insertParagraph = (editor: ReactEditor, before: boolean = false) => {
  const path = getTopLevelNodePath(editor);
  if (path === null) {
    return;
  }

  const point = before ? path : [++path[0]];

  Transforms.insertNodes(
    editor,
    { type: Blocks.PARAGRAPH, children: [{ text: "" }] },
    {
      at: point,
      select: true,
    }
  );
};

export const isTable = (editor: ReactEditor): boolean => {
  if (editor.selection === null) {
    return false;
  }
  const node = Node.get(editor, editor.selection.focus.path.slice(0, 1));
  if (Editor.isEditor(node)) {
    return false;
  }
  return node.type === Blocks.TABLE;
};

export const insertTableRow = (editor: ReactEditor) => {
  if (editor.selection === null) {
    return false;
  }
  const [row, path] = Editor.parent(editor, editor.selection.focus, { depth: 1 });
  console.log("ROW", row);
  console.log("ROW PATH", path);
  const p = Editor.after(editor, path);
  if (typeof p === "undefined") {
    return;
  }
  console.log("TARGET", p);
  Transforms.insertNodes(
    editor,
    {
      type: Blocks.TABLE_ROW,
      children: [{ type: Blocks.TABLE_CELL, children: [{ text: "" }] }],
    },
    { at: p.path }
  );
};

export const isBlockActive = (editor: ReactEditor, format: Blocks) => {
  const [match] = Editor.nodes(editor, {
    match: (n) => !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === format,
  });

  return !!match;
};

export const getTopLevelNodePath = (editor: ReactEditor): Path | null => {
  if (editor.selection === null) {
    return null;
  }
  const path = editor.selection.focus.path.slice(0, 1);
  const node = Node.get(editor, path);
  if (Editor.isEditor(node)) {
    return null;
  }
  return path;
};
