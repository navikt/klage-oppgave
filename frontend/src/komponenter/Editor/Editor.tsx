import React, { useCallback, useMemo, useRef, useState } from "react";
import styled from "styled-components";
import { BaseEditor, BaseSelection, createEditor, Transforms, Node, Path, Element } from "slate";
import {
  createAlignPlugin,
  createBlockquotePlugin,
  createBoldPlugin,
  createExitBreakPlugin,
  createHeadingPlugin,
  createHistoryPlugin,
  createItalicPlugin,
  createListPlugin,
  createParagraphPlugin,
  createReactPlugin,
  createResetNodePlugin,
  createStrikethroughPlugin,
  createSubscriptPlugin,
  createSuperscriptPlugin,
  createTablePlugin,
  createUnderlinePlugin,
  HeadingToolbar,
  SlatePlugins,
  TDescendant,
} from "@udecode/slate-plugins";
import { BallonToolbar } from "./toolbar/Balloon";
import { options, optionsExitBreakPlugin, optionsResetBlockTypePlugin } from "./pluginOptions";
import ToolbarSeparator from "./toolbar/Separator";
import { components } from "./components";
import { ToolbarButtonsHeadings } from "./toolbar/Headings";
import { ToolbarButtonStandardText } from "./toolbar/StandardText";
import { ToolbarButtonsMarks } from "./toolbar/Marks";
import { ToolbarButtonsAlign } from "./toolbar/TextAlign";
import { ToolbarButtonsList } from "./toolbar/List";
import { ToolbarButtonsTable } from "./toolbar/Table";
import { useStandardTextPlugin } from "./standardText/useStandardTextPlugin";
import { StandardTextSelect } from "./StandardTextSelect";
import { createCommentPlugin } from "./comment/createCommentPlugin";
import { CommentsComponent } from "./Comments";
import { CommentNode, ELEMENT_COMMENTS } from "./types";
import "./Editor.less";

interface KlageEditorProps {
  initialData: TDescendant[];
  id: string;
  placeholder?: string;
}

const KlageEditor = ({ id, initialData = [], placeholder }: KlageEditorProps) => {
  const editor = useMemo(() => createEditor(), []);

  const [isFocused, setFocused] = useState(false);
  const [commentThreadId, setCommentThreadId] = useState<string | null>(null);

  const onBlur = useCallback(() => {
    savedSelection.current = editor.selection;
    setFocused(false);
  }, [editor]);

  const onFocus = useCallback(() => {
    setFocused(true);
  }, [editor]);

  const savedSelection = useRef(editor.selection);

  const {
    getStandardTextSelectProps,
    plugin: standardTextPlugin,
    toggleStandardTextUi,
  } = useStandardTextPlugin({
    standardTexts: [
      {
        standardText: "Standard text 1",
        standardTextId: "123",
      },
      {
        standardText: "Standard text 2",
        standardTextId: "321",
      },
    ],
  });

  const plugins = useMemo(
    () => [
      createReactPlugin(),
      createHistoryPlugin(),
      createCommentPlugin(),
      createParagraphPlugin(),
      createHeadingPlugin(),
      createBoldPlugin(),
      createItalicPlugin(),
      createUnderlinePlugin(),
      createStrikethroughPlugin(),
      createSubscriptPlugin(),
      createSuperscriptPlugin(),
      createAlignPlugin(),
      createBlockquotePlugin(),
      createListPlugin(),
      createTablePlugin(),
      createExitBreakPlugin(optionsExitBreakPlugin),
      createResetNodePlugin(optionsResetBlockTypePlugin),
      standardTextPlugin,
    ],
    [standardTextPlugin, optionsExitBreakPlugin, optionsResetBlockTypePlugin]
  );

  const [value, setValue] = useState<TDescendant[]>(initialData);

  const showComments = useCallback(
    (editor: BaseEditor) => {
      const { selection } = editor;
      if (selection === null) {
        return;
      }
      const parent = Node.ancestor(editor, Path.parent(selection.focus.path));
      if (
        Element.isElement(parent) &&
        parent.type === ELEMENT_COMMENTS &&
        typeof parent.commentThreadId === "string" &&
        parent.commentThreadId.length > 0
      ) {
        setCommentThreadId(parent.commentThreadId);
        return;
      }
      setCommentThreadId(null);
    },
    [editor]
  );

  return (
    <EditorContainer focused={isFocused}>
      <SlatePlugins
        id={id}
        initialValue={value}
        plugins={plugins}
        components={components}
        options={options}
        editableProps={{
          placeholder,
          spellCheck: true,
          autoFocus: false,
          onBlur,
          onFocus,
        }}
        onChange={(content) => {
          savedSelection.current = editor.selection;
          setValue(content);
          showComments(editor);
        }}
        editor={editor}
      >
        <HeadingToolbar
          styles={{
            root: {
              paddingBottom: 0,
              backgroundColor: "transparent",
              zIndex: 1,
            },
          }}
        >
          <ToolbarButtonsHeadings />
          <ToolbarSeparator />
          <ToolbarButtonStandardText onClick={toggleStandardTextUi} />
          <ToolbarSeparator />
          <ToolbarButtonsMarks />
          <ToolbarSeparator />
          <ToolbarButtonsAlign />
          <ToolbarSeparator />
          <ToolbarButtonsList />
          <ToolbarSeparator />
          <ToolbarButtonsTable />
          <ToolbarSeparator />
        </HeadingToolbar>
        <StandardTextSelect {...getStandardTextSelectProps()} selection={savedSelection.current} />
        <BallonToolbar onAddComment={() => addCommentThread(editor, savedSelection.current)} />
      </SlatePlugins>
      <CommentsComponent commentThreadId={commentThreadId} show={isFocused} />
    </EditorContainer>
  );
};

const addCommentThread = (editor: BaseEditor, selection: BaseSelection) => {
  if (selection === null) {
    return;
  }
  // TODO: POST to create a new comment thread. API responds with an ID.
  const element: CommentNode = {
    type: ELEMENT_COMMENTS,
    commentThreadId: Math.random().toString(),
  };
  Transforms.wrapNodes(editor, element, {
    at: selection,
    split: true,
    mode: "highest",
  });
};

const EditorContainer = styled.div<{ focused: boolean }>`
  z-index: 0;
  display: block;
  width: 100%;
  padding: 1em;
  background-color: ${({ focused }) => (focused ? "#fff" : "#eee")};
  border-radius: 0.25em;
  border: 1px solid #eee;
`;

export default KlageEditor;
