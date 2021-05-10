import React from "react";
import styled from "styled-components";
import { AddComment } from "@styled-icons/material-outlined/AddComment";
import { CommentableField } from "./types";

interface InputTextProps extends CommentableField {
  id: string;
  label: string;
  content?: string;
  placeholder?: string;
}

export const InputText = ({
  id,
  label,
  content = "",
  placeholder = "",
  onAddCommentThread,
}: InputTextProps) => (
  <StyledInput>
    <StyledLabel htmlFor={id}>{label}:</StyledLabel>
    <StyledInputField
      id={id}
      type="text"
      defaultValue={content}
      placeholder={placeholder}
      onFocus={() => setPartialCommentFilter({ fieldId: id })}
    />
    <StyledCommentButton title="Legg til kommentar" onClick={onAddCommentThread}>
      <AddComment />
    </StyledCommentButton>
  </StyledInput>
);

const StyledCommentButton = styled.button`
  border: none;
  border-radius: 0;
  width: 2em;
  padding: 0.25em;
  cursor: pointer;
  background-color: transparent;
`;

const StyledInputField = styled.input`
  border: none;
  padding: 0.25em;
  font-size: 1em;
  border-radius: 0.25em;
  background-color: #eee;
  flex-grow: 1;

  &:focus {
    background-color: #fff;
  }
`;

const StyledLabel = styled.label`
  margin-right: 0.5em;
`;

const StyledInput = styled.div`
  display: flex;
  margin-top: 0;
  margin-bottom: 1em;
`;
