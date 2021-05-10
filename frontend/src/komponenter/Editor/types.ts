import { TDescendant } from "@udecode/slate-plugins-core";
import { TElement } from "@udecode/slate-plugins-core";
import { BaseEditor, Descendant } from "slate";
import { ReactEditor } from "slate-react";

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

export interface CommentNode {
  commentThreadId: string;
  type: typeof ELEMENT_COMMENTS;
  children: Descendant[];
}

declare module "slate" {
  interface CustomTypes {
    Element: StandardText | CommentNode;
    Editor: BaseEditor & ReactEditor;
  }
}

export type UUID = string;

export interface CommentThreadData {
  id: string;
  saksId: string;
  fieldId: string | null;
  comments: CommentData[];
}

export interface NewCommentData {
  commentThreadId: string | null;
  text: string;
}

export interface CommentData {
  id: UUID;
  author: {
    id: UUID;
    name: string;
  };
  createdDate: string;
  text: string;
}

export type OnAddCommentThread = () => Promise<string>;
export type OnCommentFocus = (threadId: string | null) => void;

export interface CommentableField {
  onFocus: () => void;
  onAddCommentThread: OnAddCommentThread;
  onCommentFocus: OnCommentFocus;
}
