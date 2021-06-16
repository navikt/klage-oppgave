import styled from "styled-components";

interface ListProps {
  direction?: "vertical" | "horizontal";
}

export const List = styled.ul<ListProps>`
  display: ${({ direction }) => (direction === "horizontal" ? "flex" : "block")};
  list-style: none;
  font-size: 16px;
  margin: 0;
  padding: 6px;
`;

export const ListItem = styled.li`
  border-top: 1px solid #c6c2bf;
  padding: 8px;
  margin: 4px;
`;
