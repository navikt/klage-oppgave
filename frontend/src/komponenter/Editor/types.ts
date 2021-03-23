export enum ListBlockTypes {
  BULLET_LIST = "bullet-list",
  NUMBERED_LIST = "numbered-list",
}

export const LIST_BLOCK_TYPES = Object.values(ListBlockTypes);

export enum TopBlockTypes {
  PARAGRAPH = "paragraph",
  HEADING = "heading",
  BLOCK_QUOTE = "block-quote",
  TABLE = "table",
  STANDARD_TEXT = "standard-text",
}

export const TOP_BLOCK_TYPES = Object.values(TopBlockTypes);

export enum NestedBlockTypes {
  LIST_ITEM = "list-item",
  TABLE_CELL = "table-cell",
  TABLE_ROW = "table-row",
}

export const NESTED_BLOCK_TYPES = Object.values(NestedBlockTypes);

export type BlockTypes = TopBlockTypes | ListBlockTypes | NestedBlockTypes;

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

export type PlainText = {
  type?: undefined;
  text: string;
  bold?: false;
  italic?: false;
  strikethrough?: false;
  underline?: false;
};

export type Paragraph = {
  type: TopBlockTypes.PARAGRAPH;
  children: FormattedText[];
};

export type BlockQuote = {
  type: TopBlockTypes.BLOCK_QUOTE;
  children: FormattedText[];
};

export type ListItem = {
  type: NestedBlockTypes.LIST_ITEM;
  children: FormattedText[];
};

export type List = {
  type: ListBlockTypes.BULLET_LIST | ListBlockTypes.NUMBERED_LIST;
  children: ListItem[];
};

export type TableCell = {
  type: NestedBlockTypes.TABLE_CELL;
  children: FormattedText[];
};

export type TableRow = {
  type: NestedBlockTypes.TABLE_ROW;
  children: TableCell[];
};

export type Table = {
  type: TopBlockTypes.TABLE;
  children: TableRow[];
};

export type HeadingLevel = 1 | 2 | 3 | 4;

export type Heading = {
  type: TopBlockTypes.HEADING;
  level: HeadingLevel;
  children: PlainText[];
};

export type StandardText = {
  type: TopBlockTypes.STANDARD_TEXT;
  standardText: string;
  standardTextId: string;
  children: FormattedText[];
};

export type EditableBlock =
  | Heading
  | Paragraph
  | List
  | ListItem
  | Table
  | TableRow
  | TableCell
  | BlockQuote
  | StandardText;
export type LeafType = FormattedText;

declare module "slate" {
  interface CustomTypes {
    Element: EditableBlock;
    Text: LeafType;
  }
}
