import { Blocks, VoidBlocks } from "./blocks";

export type EmptyText = {
  type?: undefined;
  text: "";
};

export type FormattedText = {
  type?: undefined;
  text: string;
  bold?: boolean;
  italic?: boolean;
  strikethrough?: boolean;
  underline?: boolean;
};

export type CustomElement = {
  type: Blocks;
  children: LeafType[] | EditableBlock[];
};

export type StandardTextElement = {
  type: VoidBlocks.STANDARD_TEXT;
  standardText: string;
  standardTextId: string;
  children: EmptyText[];
};

export type NonEditableBlock = StandardTextElement;
export type EditableBlock = CustomElement;
export type LeafType = FormattedText;

declare module "slate" {
  interface CustomTypes {
    Element: EditableBlock | NonEditableBlock;
    Text: LeafType;
  }
}
