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
  type: "paragraph";
  children: FormattedText[];
};

export type BlockQuote = {
  type: "block-quote";
  children: FormattedText[];
};

export type ListItem = {
  type: "list-item";
  children: FormattedText[];
};

export type List = {
  type: "bullet-list" | "numbered-list";
  children: ListItem[];
};

export type TableCell = {
  type: "table-cell";
  children: FormattedText[];
};

export type TableRow = {
  type: "table-row";
  children: TableCell[];
};

export type Table = {
  type: "table";
  children: TableRow[];
};

export type Heading = {
  type: "heading";
  level: 1 | 2 | 3 | 4;
  children: PlainText[];
};

export type StandardText = {
  type: "standard-text";
  standardText: string;
  standardTextId: string;
  children: FormattedText[];
};

export type EditableBlock = Heading | Paragraph | List | Table | BlockQuote | StandardText;
export type LeafType = FormattedText;

declare module "slate" {
  interface CustomTypes {
    Element: EditableBlock;
    Text: LeafType;
  }
}
