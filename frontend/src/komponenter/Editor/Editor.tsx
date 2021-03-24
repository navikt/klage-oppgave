// Import React dependencies.
import React, { useCallback, useMemo, useState } from "react";
// Import the Slate editor factory.
import { createEditor, Descendant, Transforms, Node, Range, Editor } from "slate";
// Import the Slate components and React plugin.
import { Slate, Editable, RenderElementProps, RenderLeafProps, withReact } from "slate-react";
import { convertToList, isLeaf } from "./blocks";
import { Element } from "./Element";
import { Leaf } from "./Leaf";
import { Marks, toggleMark } from "./marks";
import { Toolbar } from "./Toolbar";
import { ListBlockTypes, NestedBlockTypes, TopBlockTypes } from "./types";
import { withTables } from "./withTables";
import "./Editor.less";

const KlageEditor = () => {
  const editor = useMemo(() => withTables(withReact(createEditor())), []);
  const renderElement = useCallback((props: RenderElementProps) => <Element {...props} />, []);
  const renderLeaf = useCallback((props: RenderLeafProps) => <Leaf {...props} />, []);
  // Add the initial value when setting up our state.
  const [value, setValue] = useState<Descendant[]>([
    {
      type: TopBlockTypes.HEADING,
      level: 1,
      children: [{ text: "Tittel for vedtaket" }],
    },
    {
      type: TopBlockTypes.PARAGRAPH,
      children: [
        { text: "En paragraf med " },
        { text: "bold", bold: true },
        { text: " (ctrl/cmd + b), " },
        { text: "kursiv", italic: true },
        { text: " (ctrl/cmd + i) og " },
        { text: "understreking", underline: true },
        { text: " (ctrl/cmd + u)." },
      ],
    },
    {
      type: TopBlockTypes.STANDARD_TEXT,
      standardText:
        "Dette er en standardtekst. Den kan redigeres og settes tilbake til originalversjonen.",
      standardTextId: "id123",
      children: [
        {
          text:
            "Dette er en standardtekst. Den kan redigeres og settes tilbake til originalversjonen.",
        },
      ],
    },
    {
      type: TopBlockTypes.STANDARD_TEXT,
      standardText:
        "Dette er en standardtekst. Den kan redigeres og settes tilbake til originalversjonen.",
      standardTextId: "id123",
      children: [
        {
          text:
            "Dette er en standardtekst. Den kan redigeres og settes tilbake til originalversjonen.",
        },
      ],
    },
    {
      type: TopBlockTypes.TABLE,
      children: [
        {
          type: NestedBlockTypes.TABLE_ROW,
          children: [
            {
              type: NestedBlockTypes.TABLE_CELL,
              children: [{ text: "test" }],
            },
            {
              type: NestedBlockTypes.TABLE_CELL,
              children: [{ text: "test" }],
            },
            {
              type: NestedBlockTypes.TABLE_CELL,
              children: [{ text: "test" }],
            },
          ],
        },
        {
          type: NestedBlockTypes.TABLE_ROW,
          children: [
            {
              type: NestedBlockTypes.TABLE_CELL,
              children: [{ text: "test" }],
            },
            {
              type: NestedBlockTypes.TABLE_CELL,
              children: [{ text: "test" }],
            },
            {
              type: NestedBlockTypes.TABLE_CELL,
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
                if (selectedElement.type === TopBlockTypes.HEADING) {
                  event.preventDefault();

                  if (
                    isLeaf(selectedLeaf) &&
                    selectedLeaf.text.length === editor.selection.anchor.offset
                  ) {
                    Transforms.insertNodes(editor, {
                      type: TopBlockTypes.PARAGRAPH,
                      children: [{ text: "" }],
                    });
                  } else {
                    Transforms.splitNodes(editor);
                    Transforms.setNodes(editor, { type: TopBlockTypes.PARAGRAPH });
                  }
                  return;
                }
              }

              // Paragraph triggers
              if (
                selectedElement.type === TopBlockTypes.PARAGRAPH &&
                !Editor.isBlock(editor, selectedLeaf)
              ) {
                if (selectedLeaf.text.startsWith("-") === true && event.key === " ") {
                  event.preventDefault();
                  convertToList(editor, selectedElement.children, ListBlockTypes.BULLET_LIST);
                } else if (
                  selectedLeaf.text.startsWith("1") &&
                  (event.key === "." || event.key === ")")
                ) {
                  event.preventDefault();
                  convertToList(editor, selectedElement.children, ListBlockTypes.NUMBERED_LIST);
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
