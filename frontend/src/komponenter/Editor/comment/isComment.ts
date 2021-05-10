import { Node, Element, Editor } from "slate";
import { CommentNode, ELEMENT_COMMENTS } from "../types";

export const isComment = (node: Node): node is CommentNode =>
  !Editor.isEditor(node) && Element.isElement(node) && node.type === ELEMENT_COMMENTS;
