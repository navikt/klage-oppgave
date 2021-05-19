import styled from "styled-components";

interface BeholderProps {
  skjult: boolean;
}

export const Beholder = styled.section<BeholderProps>`
  display: ${(props) => (props.skjult ? "none" : "block")};
  margin: 0.25em 0.25em 0.25em 0.25em;
  background: white;
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
  border-radius: 4px;
  padding: 1.5em;
  padding-bottom: 0.25em;
`;
