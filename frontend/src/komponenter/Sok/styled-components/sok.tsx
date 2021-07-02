import styled from "styled-components";

export const SokInput = styled.div`
  display: block;
  margin: 1em;
  max-width: 60em;
`;

export const Result = styled.div`
  display: block;
  margin: 4.5em 1em 0 1em;
`;

export const SokeTabell = styled.table`
  max-width: 60em;
  width: 60em;
`;

export const SokeTabellAvsluttede = styled.table`
  max-width: 60em;
  width: 60em;
  margin: 2em 0 0 0;
  padding: 0 0 8em 0;
`;
export const Tr = styled.tr`
  background: #e5f3ff;
`;
export const TrBunnramme = styled.tr``;

export const Td = styled.td`
  text-align: left;
  padding: 0;
  margin: 0;
  width: 16em;
`;
export const TdSenter = styled.td`
  text-align: center;
  border-bottom: 1px solid #c6c2bf;
  width: 16em;
`;
export const TdResultat = styled.td`
  width: 16em;
  text-align: left;
  border-bottom: 1px solid #c6c2bf;
`;

export const Th = styled.th`
  text-align: left;
  border-bottom: 1px solid #c6c2bf;
`;

export const SokeForklaring = styled.div`
  margin: 0 0 0.5em 0;
`;
export const SokBeholder = styled.div`
  position: relative;
  width: 40em;
`;
export const SokIkon = styled.img`
  position: absolute;
  right: 0;
  top: 0;
  z-index: 1;
  height: 2.5em;
`;
export const SokeTekst = styled.input`
  width: 40em;
  position; absolute;
  font-family: "Source Sans Pro", Arial, sans-serif;
  font-size: 1rem;
  font-weight: 400;
  appearance: none;
  padding: 0.5rem;
  background-color: #fff;
  border-radius: 4px;
  border: 1px solid #6a6a6a;
  box-sizing: border-box;
  line-height: 1.375rem;
  &:hover{
  border-color: #0067c5;
  }
`;
