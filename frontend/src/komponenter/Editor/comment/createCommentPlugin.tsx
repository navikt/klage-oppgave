import React from "react";
import styled from "styled-components";
import { SlatePlugin } from "@udecode/slate-plugins-core";
import { getCommentDeserialize } from "./getCommentDeserialize";
import { ELEMENT_COMMENTS } from "../types";
import { isComment } from "./isComment";

const hues: Map<string, number> = new Map([]);

export const getHue = (id: string): number => {
  const existingHue = hues.get(id);
  if (typeof existingHue === "number") {
    return existingHue;
  }
  const next = hues.size * 53;
  const newHue = next > 360 ? next % 360 : next;
  hues.set(id, newHue);
  return newHue;
};

export const createCommentPlugin = (): SlatePlugin => ({
  deserialize: getCommentDeserialize(),
  inlineTypes: () => [ELEMENT_COMMENTS],
  renderElement: (editor) => ({ element, attributes, children }) => {
    if (isComment(element)) {
      const { commentThreadId } = element;
      return (
        <StyledInlineComment hue={getHue(commentThreadId)} {...attributes}>
          {children}
        </StyledInlineComment>
      );
    }
  },
});

// interface InlineCommentProps {
//   id: string;
//   children: any;
// }

// const InlineComment = ({ id, children }: InlineCommentProps) => {
//   return <StyledInlineComment hue={getHue(id)}>{children}</StyledInlineComment>;
// };

interface StyledInlineCommentProps {
  hue: number;
}

const StyledInlineComment = styled.span<StyledInlineCommentProps>`
  background-color: hsl(${({ hue }) => hue}, 100%, 80%);
`;
