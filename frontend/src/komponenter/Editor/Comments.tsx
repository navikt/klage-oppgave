import React, { useMemo } from "react";
import styled from "styled-components";
import { NewComment } from "./NewComment";
import { CommentData } from "./test-data";

const CommentThread = styled.ul`
  position: fixed;
  max-height: 100%;
  right: 0;
  bottom: 0;
  list-style: none;
  padding: 1em;
  border-radius: 0.5m;
  margin: 0;
  background-color: #eee;
`;
const CommentContainer = styled.li`
  display: block;
  padding: 0.5em;
  border-radius: 0.25em;
  background-color: #eee;
`;

interface CommentsProps {
  commentThreadId: string | null;
  show: boolean;
}

export const CommentsComponent = ({ commentThreadId, show = false }: CommentsProps) => {
  const comments = useMemo<CommentData[]>(() => {
    return [];
  }, [commentThreadId]);

  if (!show || commentThreadId === null) {
    return null;
  }

  return (
    <CommentThread key={commentThreadId}>
      <h1>{commentThreadId}</h1>
      {comments.map(({ id, text, author, createdDate }) => (
        <CommentContainer key={id}>
          {author.name}: {text}
        </CommentContainer>
      ))}
      <NewComment key="new-comment" />
    </CommentThread>
  );
};
