import React from "react";
import styled from "styled-components";
import Oppsett from "../Oppsett";
import Editor from "./Editor";
import { Block, Content, TEST_DATA } from "./test-data";

const PageContent = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
`;

const EditorPage = () => (
  <Oppsett visMeny={true}>
    <PageContent>{toBlock(TEST_DATA.content)}</PageContent>
  </Oppsett>
);

const toBlock = (blocks: Block[]) =>
  blocks.map(({ id, title, content }) => (
    <Section key={id}>
      <Title>{title}</Title>
      {toComponent(content)}
    </Section>
  ));

const Section = styled.section`
  margin-bottom: 1.5em;
`;

const Title = styled.h1`
  font-size: 2.75em;
  margin: 0;
  margin-bottom: 0.5em;
  width: 100%;
`;

const toComponent = (content: Content[]) =>
  content.map((c) => {
    switch (c.type) {
      case "rich-text": {
        if (typeof c.label === "string") {
          return (
            <div key={c.id}>
              <label htmlFor={c.id}>{c.label}:</label>
              <Editor id={c.id} initialData={c.content} placeholder={c.placeholder} />
            </div>
          );
        }
        return <Editor key={c.id} id={c.id} initialData={c.content} placeholder={c.placeholder} />;
      }

      case "text":
        return (
          <InputText
            key={c.id}
            label={c.label}
            id={c.id}
            content={c.content}
            placeholder={c.placeholder}
          />
        );
    }
  });

interface InputTextProps {
  id: string;
  label: string;
  content?: string;
  placeholder?: string;
}

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

const InputText = ({ id, label, content = "", placeholder = "" }: InputTextProps) => (
  <StyledInput>
    <StyledLabel htmlFor={id}>{label}:</StyledLabel>
    <StyledInputField id={id} type="text" defaultValue={content} placeholder={placeholder} />
  </StyledInput>
);

export default EditorPage;
