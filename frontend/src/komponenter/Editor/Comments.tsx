import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { Close } from "@styled-icons/material-outlined/Close";
import { NewComment } from "./NewComment";
import { CommentThreadData } from "./types";
import { commentService } from "./commentService";
import { getHue } from "./comment/createCommentPlugin";

interface CommentsProps {
  saksId: string;
  fieldId: string | null;
  commentThreadId: string | null;
}

export const CommentsComponent = ({ saksId, fieldId, commentThreadId }: CommentsProps) => {
  const [commentThreads, setCommentThreads] = useState<CommentThreadData[]>([]);

  useEffect(() => {
    commentService.getCommentThreads(saksId, fieldId, commentThreadId).then(setCommentThreads);
  }, [saksId, fieldId, commentThreadId]);

  if (commentThreads === null || fieldId === null) {
    return null;
  }

  return (
    <CommentThreadsContainer>
      {...renderCommentThreads(commentThreads, saksId, fieldId)}
    </CommentThreadsContainer>
  );
};

const renderCommentThreads = (threads: CommentThreadData[], saksId: string, fieldId: string) =>
  threads.map((thread) => (
    <CommentThread key={thread.id} thread={thread} saksId={saksId} fieldId={fieldId} />
  ));

interface CommentThreadProps {
  thread: CommentThreadData;
  saksId: string;
  fieldId: string;
}

const CommentThread = ({ thread, saksId, fieldId }: CommentThreadProps) => {
  const { id: commentThreadId, comments } = thread;
  return (
    <CommentThreadContainer key={commentThreadId} hue={getHue(commentThreadId)}>
      <CloseButton title="Lukk kommentarfelt">
        <Close />
      </CloseButton>
      <h1>{commentThreadId}</h1>
      {comments.map(({ id, text, author, createdDate }) => (
        <CommentContainer key={id}>
          {author.name}: {text}
        </CommentContainer>
      ))}
      <NewComment
        key="new-comment"
        commentThreadId={commentThreadId}
        saksId={saksId}
        fieldId={fieldId}
      />
    </CommentThreadContainer>
  );
};

interface CommentThreadContainerProps {
  hue: number;
}

const CommentThreadsContainer = styled.section`
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 20em;
  background-color: #eee;
`;

const CommentThreadContainer = styled.ul<CommentThreadContainerProps>`
  position: relative;
  width: 100%;
  margin: 0;
  padding: 1em;
  list-style: none;
  overflow-y: scroll;
  box-shadow: #ddd -5px 0 5px;
  z-index: 2;
  border-left: 3px solid hsl(${({ hue }) => hue}, 100%, 50%);
`;

const CommentContainer = styled.li`
  display: block;
  padding: 0.5em;
  border-radius: 0.25em;
  background-color: #eee;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 0;
  right: 0;
  width: 1em;
  cursor: pointer;
  padding: 0;
  margin: 0;
  font-size: 1em;
  border: none;
  border-radius: 0;
`;
