// Import React dependencies.
import React, { useCallback, useMemo, useState } from "react";
// Import the Slate editor factory.
import { createEditor, Descendant, Transforms, Node, Range, Editor } from "slate";
// Import the Slate components and React plugin.
import { Slate, Editable, RenderElementProps, RenderLeafProps, withReact } from "slate-react";
import { Blocks, HEADING_TYPES, isBlockElement, isLeaf, isVoidElement, VoidBlocks } from "./blocks";
import "./Editor.less";
import { Element } from "./Element";
import { Leaf } from "./Leaf";
import { Marks, toggleMark } from "./marks";
import { Toolbar } from "./Toolbar";
import { withTables } from "./withTables";

const KlageEditor = () => {
  const editor = useMemo(() => withTables(withReact(createEditor())), []);
  editor.isVoid = (element): boolean => element.type === VoidBlocks.STANDARD_TEXT;
  const renderElement = useCallback((props: RenderElementProps) => <Element {...props} />, []);
  const renderLeaf = useCallback((props: RenderLeafProps) => <Leaf {...props} />, []);
  // Add the initial value when setting up our state.
  const [value, setValue] = useState<Descendant[]>([
    {
      type: Blocks.H1,
      children: [{ text: "Tittel for vedtaket" }],
    },
    {
      type: Blocks.PARAGRAPH,
      children: [
        { text: "En paragraf med " },
        { text: "bold", bold: true },
        { text: ", " },
        { text: "kursiv", italic: true },
        { text: " og " },
        { text: "understreking", underline: true },
        { text: "." },
      ],
    },
    {
      type: VoidBlocks.STANDARD_TEXT,
      standardText: "Denne teksten er ikke redigerbar.",
      standardTextId: "id123",
      children: [{ text: "" }],
    },
    {
      type: Blocks.TABLE,
      children: [
        {
          type: Blocks.TABLE_ROW,
          children: [
            {
              type: Blocks.TABLE_CELL,
              children: [{ text: "test" }],
            },
            {
              type: Blocks.TABLE_CELL,
              children: [{ text: "test" }],
            },
            {
              type: Blocks.TABLE_CELL,
              children: [{ text: "test" }],
            },
          ],
        },
        {
          type: Blocks.TABLE_ROW,
          children: [
            {
              type: Blocks.TABLE_CELL,
              children: [{ text: "test" }],
            },
            {
              type: Blocks.TABLE_CELL,
              children: [{ text: "test" }],
            },
            {
              type: Blocks.TABLE_CELL,
              children: [{ text: "test" }],
            },
          ],
        },
      ],
    },
  ]);

  return (
    <Slate
      editor={editor}
      value={value}
      onChange={(newValue) => {
        setValue(newValue);
        console.log(
          JSON.stringify(
            newValue.map(({ type }) => type),
            null,
            2
          )
        );
        // console.log(JSON.stringify(newValue, null, 2));
        // console.log(newValue);
      }}
    >
      <div className="editor-container">
        <Toolbar />
        <article>
          <Editable
            className="editor"
            spellCheck
            renderElement={renderElement}
            renderLeaf={renderLeaf}
            onKeyDown={(event) => {
              if (editor.selection === null) {
                return;
              }

              const selectedElement = Node.descendant(
                editor,
                editor.selection.anchor.path.slice(0, -1)
              );
              const selectedLeaf = Node.descendant(editor, editor.selection.anchor.path);

              // Enter trigger.
              if (event.key === "Enter") {
                if (
                  isBlockElement(selectedElement) &&
                  HEADING_TYPES.includes(selectedElement.type)
                ) {
                  event.preventDefault();

                  if (
                    isLeaf(selectedLeaf) &&
                    selectedLeaf.text.length === editor.selection.anchor.offset
                  ) {
                    Transforms.insertNodes(editor, {
                      type: Blocks.PARAGRAPH,
                      children: [{ text: "" }],
                    });
                  } else {
                    Transforms.splitNodes(editor);
                    Transforms.setNodes(editor, { type: Blocks.PARAGRAPH });
                  }
                  return;
                }
              }

              // Space trigger
              if (event.key === " ") {
                if (
                  !Editor.isBlock(editor, selectedLeaf) &&
                  selectedLeaf.text.startsWith("-") === true
                ) {
                  Transforms.setNodes(
                    editor,
                    { type: Blocks.BULLET_LIST },
                    {
                      match: (n) => Editor.isBlock(editor, n) && n.type === Blocks.PARAGRAPH,
                    }
                  );
                  Transforms.insertNodes(editor, {
                    type: Blocks.BULLET_LIST,
                    children: [
                      {
                        type: Blocks.LIST_ITEM,
                        children: [{ text: selectedLeaf.text.substring(1).trimStart() }],
                      },
                    ],
                  });
                }
              }

              // Tab
              if (event.key === "Tab") {
                event.preventDefault();
                Transforms.insertText(editor, "\t", { at: Range.start(editor.selection) });
                return;
              }

              // Shortcuts
              if (!event.ctrlKey && !event.metaKey) {
                return;
              }

              switch (event.key) {
                case "b": {
                  event.preventDefault();
                  toggleMark(editor, Marks.BOLD);
                  break;
                }
                case "i": {
                  event.preventDefault();
                  toggleMark(editor, Marks.ITALIC);
                  break;
                }
                case "u": {
                  event.preventDefault();
                  toggleMark(editor, Marks.UNDERLINE);
                  break;
                }
              }
            }}
          />
        </article>
      </div>
    </Slate>
  );
};

export default KlageEditor;
