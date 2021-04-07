import { TDescendant } from "@udecode/slate-plugins-core";
import { TElement } from "@udecode/slate-plugins-core";
import { CommentData } from "./test-data";

export const ELEMENT_STANDARD_TEXT = "standard_text";
export const ELEMENT_COMMENTS = "comments";

export type StandardTextData = {
  standardText: string;
  standardTextId: string;
};

export type StandardTextNode = TElement<StandardTextData>;

export type StandardText = StandardTextData & {
  type: typeof ELEMENT_STANDARD_TEXT;
  children: TDescendant[];
};

export type CommentNode = {
  commentThreadId: string;
  type: typeof ELEMENT_COMMENTS;
};

declare module "slate" {
  interface CustomTypes {
    Element: StandardText | CommentNode;
  }
}
