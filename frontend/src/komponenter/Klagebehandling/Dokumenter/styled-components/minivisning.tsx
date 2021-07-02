import styled from "styled-components";

export const DokumenterMinivisning = styled.ul`
  display: block;
  list-style: none;
  padding: 0;
  margin: 0;
`;

export const Tilknyttet = styled.li`
  padding: 0.5em 1em;
`;

export const TilknyttetDato = styled.time`
  display: block;
  font-size: 12px;
`;

export const TilknyttetKnapp = styled.button<{ tilknyttet: boolean }>`
  display: block;
  cursor: pointer;
  padding: 0;
  border: none;
  background-color: transparent;
  color: #0067c5;
  font-size: 16px;
  text-decoration: ${(props) => (props.tilknyttet ? "none" : "line-through")};
  text-align: left;
`;
