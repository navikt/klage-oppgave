import { Editor, Transforms, Node, Element as SlateElement, Path, Descendant } from "slate";
import { ReactEditor } from "slate-react";
import {
  BlockTypes,
  FormattedText,
  Heading,
  HeadingLevel,
  LeafType,
  ListBlockTypes,
  LIST_BLOCK_TYPES,
  NestedBlockTypes,
  StandardText,
  TopBlockTypes,
} from "./types";

export const isLeaf = (element: Descendant): element is LeafType =>
  typeof element["type"] === "undefined";

export const toggleBlockQuote = (editor: ReactEditor) => {
  const isBlockQuote = isBlockActive(editor, TopBlockTypes.BLOCK_QUOTE);
  Transforms.setNodes(editor, {
    type: isBlockQuote ? TopBlockTypes.PARAGRAPH : TopBlockTypes.BLOCK_QUOTE,
  });
};

// export const toggleBlock = (editor: ReactEditor, format: BlockTypes) => {
//   const isActive = isBlockActive(editor, format);
//   const isList = LIST_BLOCK_TYPES.includes(format);

//   Transforms.unwrapNodes(editor, {
//     match: (n) => {
//       if (!Editor.isEditor(n) && SlateElement.isElement(n)) {
//         return LIST_BLOCK_TYPES.includes(n.type);
//       }
//       return false;
//     },
//     split: true,
//   });
//   const newProperties: Partial<SlateElement> = {
//     type: isActive ? TopBlockTypes.PARAGRAPH : isList ? NestedBlockTypes.LIST_ITEM : format,
//   };
//   Transforms.setNodes(editor, newProperties);

//   if (!isActive && isList) {
//     const block = { type: format, children: [] };
//     Transforms.wrapNodes(editor, block);
//   }
// };

export const toggleHeading = (editor: ReactEditor, level: HeadingLevel) => {
  const isActive = isBlockActive(editor, TopBlockTypes.HEADING);
  if (isActive) {
    Transforms.setNodes(editor, { type: TopBlockTypes.PARAGRAPH });
  } else {
    Transforms.setNodes(editor, { type: TopBlockTypes.HEADING, level });
  }
};

export const isHeadingActive = (editor: ReactEditor, level: HeadingLevel) => {
  const [match] = Editor.nodes(editor, {
    match: (n) =>
      !Editor.isEditor(n) && SlateElement.isElement(n) && isHeading(n) && n.level === level,
  });

  return !!match;
};

export const isHeading = (element: SlateElement): element is Heading =>
  element.type === TopBlockTypes.HEADING;

export const isStandardText = (element: SlateElement): element is StandardText =>
  element.type === TopBlockTypes.STANDARD_TEXT;

export const toggleList = (editor: ReactEditor, listType: ListBlockTypes) => {
  const isActive = isBlockActive(editor, listType);
  Transforms.unwrapNodes(editor, {
    match: (n) => !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === listType,
    split: true,
  });

  const newProperties: Partial<SlateElement> = {
    type: isActive ? TopBlockTypes.PARAGRAPH : listType,
  };

  Transforms.setNodes(editor, newProperties);

  if (!isActive) {
    Transforms.wrapNodes(editor, { type: listType, children: [] });
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
      type: TopBlockTypes.TABLE,
      children: [
        {
          type: NestedBlockTypes.TABLE_ROW,
          children: [
            {
              type: NestedBlockTypes.TABLE_CELL,
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

export const isParagraph = (editor: ReactEditor) => {
  if (editor.selection === null) {
    return false;
  }
  const node = Node.get(editor, editor.selection.focus.path.slice(0, 1));
  if (Editor.isEditor(node)) {
    return false;
  }
  return node.type === TopBlockTypes.PARAGRAPH;
};

export const setParagraph = (editor: ReactEditor) =>
  Transforms.setNodes(editor, { type: TopBlockTypes.PARAGRAPH });

export const insertParagraph = (editor: ReactEditor, before: boolean = false) => {
  const path = getTopLevelNodePath(editor);
  if (path === null) {
    return;
  }

  const point = before ? path : [++path[0]];

  Transforms.insertNodes(
    editor,
    { type: TopBlockTypes.PARAGRAPH, children: [{ text: "" }] },
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
  return node.type === TopBlockTypes.TABLE;
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
  // Transforms.insertNodes(
  //   editor,
  //   {
  //     type: NestedBlockTypes.TABLE_ROW,
  //     children: [{ type: NestedBlockTypes.TABLE_CELL, children: [{ text: "" }] }],
  //   },
  //   { at: p.path }
  // );
};

export const convertToList = (
  editor: ReactEditor,
  textArray: FormattedText[],
  listType: ListBlockTypes
) => {
  const first = textArray[0];
  const rest = textArray.slice(1);
  const children = [
    {
      ...first,
      text: first.text.substring(1).trimLeft(),
    },
    ...rest,
  ];

  Transforms.removeNodes(editor, { at: editor.selection?.focus });
  Transforms.insertNodes(editor, {
    type: listType,
    children: [
      {
        type: NestedBlockTypes.LIST_ITEM,
        children,
      },
    ],
  });
};

export const isBlockActive = (editor: ReactEditor, format: BlockTypes) => {
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
