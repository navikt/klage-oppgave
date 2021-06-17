import styled from "styled-components";

export const DokumenterBeholder = styled.section<{ fullvisning: boolean }>`
  margin: 0.25em 0.25em 0.25em 0.25em;
  background: white;
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
  border-radius: 4px;
  position: relative;
  overflow-y: auto;
  overflow-x: hidden;
  min-width: ${({ fullvisning }) => (fullvisning ? "40em" : "16em")};
  height: 100%;
`;
