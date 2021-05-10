import React, { useCallback, useMemo, useRef, useState } from "react";
import styled from "styled-components";
import {
  BaseSelection,
  Transforms,
  Node,
  Text,
  Editor,
  Range,
  BaseText,
  BaseRange,
  Path,
} from "slate";
import { ReactEditor } from "slate-react";
import {
  createAlignPlugin,
  createBlockquotePlugin,
  createBoldPlugin,
  createEditorPlugins,
  createExitBreakPlugin,
  createHeadingPlugin,
  createItalicPlugin,
  createListPlugin,
  createParagraphPlugin,
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
import { CommentableField, CommentNode, ELEMENT_COMMENTS } from "./types";
import "./Editor.less";
import { isComment } from "./comment/isComment";

interface KlageEditorProps extends CommentableField {
  initialData: TDescendant[];
  id: string;
  placeholder?: string;
}

const KlageEditor = ({
  id,
  initialData = [],
  placeholder,
  onFocus,
  onAddCommentThread,
  onCommentFocus,
}: KlageEditorProps) => {
  const [isFocused, setIsFocused] = useState<boolean>(false);

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
      // createReactPlugin(),
      // createHistoryPlugin(),
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

  const editor = useMemo(
    () =>
      createEditorPlugins({
        components,
        plugins,
        options,
      }),
    [components, plugins, options]
  );

  const onBlur = useCallback(() => {
    savedSelection.current = editor.selection;
    setIsFocused(false);
  }, [editor]);

  const savedSelection = useRef(editor.selection);

  const [value, setValue] = useState<TDescendant[]>(initialData);

  const showComments = useCallback(
    (editor: ReactEditor, selection: BaseSelection) => {
      if (selection === null) {
        return;
      }
      const focusedNode = Node.get(editor, Path.parent(selection.focus.path));
      if (isComment(focusedNode)) {
        const { commentThreadId } = focusedNode;
        onCommentFocus(commentThreadId);
        return;
      }
      onCommentFocus(null);
    },
    [editor, editor.selection]
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
          onFocus: () => {
            setIsFocused(true);
            onFocus();
          },
          style: {
            cursor: "text",
          },
        }}
        onChange={(content) => {
          savedSelection.current = editor.selection;
          setValue(content);
          showComments(editor, editor.selection);
        }}
        editor={editor}
      >
        <HeadingToolbar
          styles={{
            root: {
              paddingBottom: 0,
              backgroundColor: isFocused ? "white" : "#eee",
              zIndex: 1,
              position: "sticky",
              top: 0,
              marginBottom: 0,
              margin: 0,
              padding: 0,
              visibility: isFocused ? "visible" : "hidden",
              opacity: isFocused ? 1 : 0,
              transition: "opacity ease 200ms",
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
        <BallonToolbar
          onAddComment={() => addCommentThread(editor, savedSelection.current, onAddCommentThread)}
        />
      </SlatePlugins>
    </EditorContainer>
  );
};

const addCommentThread = async (
  editor: ReactEditor,
  selection: BaseSelection,
  onAddCommentThread: () => Promise<string>
) => {
  if (selection === null) {
    return;
  }
  const commentThreadId = await onAddCommentThread();

  const element: CommentNode = {
    type: ELEMENT_COMMENTS,
    commentThreadId,
    children: [],
  };

  Transforms.wrapNodes(editor, element, {
    at: pruneSelection(editor, selection),
    split: true,
    match: Text.isText,
  });
};

interface EditorContainerProps {
  focused: boolean;
}

const EditorContainer = styled.div<EditorContainerProps>`
  position: relative;
  z-index: 0;
  display: block;
  width: 100%;
  padding: 1em;
  background-color: ${({ focused }) => (focused ? "#fff" : "#eee")};
  border-radius: 0.25em;
  border: 1px solid #eee;
`;

const pruneSelection = (editor: ReactEditor, selection: BaseRange): BaseRange => {
  selection = Editor.unhangRange(editor, selection);

  const nodeGenerator = Editor.nodes<BaseText>(editor, {
    at: selection,
    match: Text.isText,
  });
  const nodes = Array.from(nodeGenerator);

  if (nodes.length > 1) {
    let [focus, anchor] = Range.edges(selection);
    const [firstNode] = nodes[0];

    if (firstNode.text.length === focus.offset) {
      const [_, secondPath] = nodes[1];
      focus = {
        offset: 0,
        path: secondPath,
      };
    }

    if (anchor.offset === 0) {
      const [secondLastNode, secondLastPath] = nodes[nodes.length - 2];
      anchor = {
        offset: secondLastNode.text.length,
        path: secondLastPath,
      };
    }

    return { focus, anchor };
  }

  return selection;
};

export default KlageEditor;
