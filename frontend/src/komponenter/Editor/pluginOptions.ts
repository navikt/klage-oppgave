import {
  createSlatePluginsOptions,
  ELEMENT_BLOCKQUOTE,
  ELEMENT_PARAGRAPH,
  ELEMENT_TODO_LI,
  ExitBreakPluginOptions,
  isBlockAboveEmpty,
  isSelectionAtBlockStart,
  KEYS_HEADING,
  ResetBlockTypePluginOptions,
} from "@udecode/slate-plugins";
import { ELEMENT_STANDARD_TEXT } from "./types";

export const options = createSlatePluginsOptions({
  [ELEMENT_STANDARD_TEXT]: {},
});

export const optionsExitBreakPlugin: ExitBreakPluginOptions = {
  rules: [
    {
      hotkey: "mod+enter",
    },
    {
      hotkey: "mod+shift+enter",
      before: true,
    },
    {
      hotkey: "enter",
      query: {
        start: true,
        end: true,
        allow: [...KEYS_HEADING, ELEMENT_STANDARD_TEXT],
      },
    },
  ],
};

const resetBlockTypesCommonRule = {
  types: [options[ELEMENT_BLOCKQUOTE].type, options[ELEMENT_TODO_LI].type],
  defaultType: options[ELEMENT_PARAGRAPH].type,
};

export const optionsResetBlockTypePlugin: ResetBlockTypePluginOptions = {
  rules: [
    {
      ...resetBlockTypesCommonRule,
      hotkey: "Enter",
      predicate: isBlockAboveEmpty,
    },
    {
      ...resetBlockTypesCommonRule,
      hotkey: "Backspace",
      predicate: isSelectionAtBlockStart,
    },
  ],
};
