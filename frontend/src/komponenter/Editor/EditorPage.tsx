import React, { useCallback, useState } from "react";
import styled from "styled-components";
import { InputText } from "./InputText";
import Oppsett from "../Oppsett";
import { CommentsComponent } from "./Comments";
import Editor from "./Editor";
import { Block, Content, TEST_DATA } from "./test-data";
import {
  CommentFilter,
  OnAddCommentThread,
  OnCommentFocus,
  SetPartialCommentFilter,
} from "./types";

interface EditorPageProps {
  saksId: string;
}

const EditorPage = ({ saksId }: EditorPageProps) => {
  const [fieldId, setFieldId] = useState<string | null>(null);
  const [commentThreadId, setCommentThreadId] = useState<string | null>(null);

  return (
    <Oppsett visMeny={true}>
      <PageContent>
        {TEST_DATA.content.map(({ id, title, content }) => (
          <Section key={id}>
            <Title>{title}</Title>
            {toComponent(content, setCommentThreadId)}
          </Section>
        ))}
        <CommentsComponent saksId={saksId} fieldId={fieldId} commentThreadId={commentThreadId} />
      </PageContent>
    </Oppsett>
  );
};

const Section = styled.section`
  margin-bottom: 1.5em;
`;

const Title = styled.h1`
  font-size: 2.75em;
  margin: 0;
  margin-bottom: 0.5em;
  width: 100%;
`;

const toComponent = (
  content: Content[],
  setCommentThreadId: OnCommentFocus,
  onAddCommentThread: OnAddCommentThread
) =>
  content.map((c) => {
    switch (c.type) {
      case "rich-text": {
        if (typeof c.label === "string") {
          return (
            <div key={c.id}>
              <label htmlFor={c.id}>{c.label}:</label>
              <Editor
                id={c.id}
                initialData={c.content}
                placeholder={c.placeholder}
                onCommentFocus={setCommentThreadId}
                onAddCommentThread={onAddCommentThread}
              />
            </div>
          );
        }
        return (
          <Editor
            key={c.id}
            id={c.id}
            initialData={c.content}
            placeholder={c.placeholder}
            onCommentFocus={setCommentThreadId}
            onAddCommentThread={onAddCommentThread}
          />
        );
      }

      case "text":
        return (
          <InputText
            key={c.id}
            label={c.label}
            id={c.id}
            content={c.content}
            placeholder={c.placeholder}
            onAddCommentThread={onAddCommentThread}
          />
        );
    }
  });

const PageContent = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding-bottom: 100em;
`;

export default EditorPage;
