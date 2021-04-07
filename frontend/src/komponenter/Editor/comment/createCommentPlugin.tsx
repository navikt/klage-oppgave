import React from "react";
import styled from "styled-components";
import { SlatePlugin } from "@udecode/slate-plugins-core";
import { getCommentDeserialize } from "./getCommentDeserialize";
import { ELEMENT_COMMENTS } from "../types";

export const createCommentPlugin = (): SlatePlugin => ({
  pluginKeys: ELEMENT_COMMENTS,
  deserialize: getCommentDeserialize(),
  inlineTypes: () => [ELEMENT_COMMENTS],
  renderElement: (editor) => ({ element, attributes, children }) => {
    const { type, commentThreadId } = element;
    if (
      type === ELEMENT_COMMENTS &&
      typeof commentThreadId === "string" &&
      commentThreadId.length > 0
    ) {
      return <Comment {...attributes}>{children}</Comment>;
    }
  },
});

const Comment = styled.span`
  background-color: rgba(0, 200, 0, 0.25);
  box-shadow: 0 0 0 0.125em rgba(0, 150, 0, 0.75);
  border-radius: 0.125em;
`;
