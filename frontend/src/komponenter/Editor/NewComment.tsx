import React, { KeyboardEventHandler, useCallback, useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { commentService } from "./commentService";

const TextArea = styled.textarea`
  display: block;
  width: 100%;
`;

interface NewCommentProps {
  saksId: string;
  fieldId: string;
  commentThreadId: string | null;
  autofocus?: boolean;
}

export const NewComment = ({
  autofocus = false,
  commentThreadId,
  saksId,
  fieldId,
}: NewCommentProps) => {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [value, setValue] = useState<string>("");
  const [posting, setPosting] = useState<boolean>(false);

  useEffect(() => {
    if (autofocus) {
      inputRef.current?.focus();
    }
  }, [inputRef, autofocus]);

  const onEnter: KeyboardEventHandler<HTMLTextAreaElement> = useCallback(
    (event) => {
      if (!posting && event.key === "Enter" && !event.shiftKey && !event.ctrlKey) {
        setPosting(true);
        const commentText = inputRef.current?.value;
        if (typeof commentText !== "string" || commentText.length === 0) {
          return;
        }
        if (commentThreadId === null) {
          commentService
            .addThread({
              saksId,
              fieldId,
              comments: [
                {
                  commentThreadId,
                  text: commentText,
                },
              ],
            })
            .then((success) => {
              if (success) {
                setValue("");
              }
              setPosting(false);
            });
        } else {
          commentService
            .addComment({
              commentThreadId,
              text: commentText,
            })
            .then((success) => {
              if (success) {
                setValue("");
              }
              setPosting(false);
            });
        }
      }
    },
    [commentThreadId, inputRef, posting]
  );
  return (
    <TextArea
      ref={inputRef}
      value={value}
      onChange={(event) => setValue(event.target.value)}
      placeholder="Ny kommentar"
      onKeyPress={onEnter}
      disabled={posting}
    />
  );
};
