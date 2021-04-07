import React, { KeyboardEventHandler, useCallback, useEffect, useRef } from "react";
import styled from "styled-components";

const TextArea = styled.textarea`
  display: block;
  width: 100%;
`;

export const NewComment = () => {
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // useEffect(() => inputRef.current?.focus(), [inputRef]);

  const onEnter: KeyboardEventHandler<HTMLTextAreaElement> = useCallback((event) => {
    if (event.key === "Enter" && !event.shiftKey && !event.ctrlKey) {
      console.log(inputRef.current?.value);
    }
  }, []);
  return <TextArea ref={inputRef} placeholder="Ny kommentar" onKeyPress={onEnter} />;
};
