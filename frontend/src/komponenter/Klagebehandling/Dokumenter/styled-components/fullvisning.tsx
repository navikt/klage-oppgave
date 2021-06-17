import styled from "styled-components";
import { Checkbox } from "nav-frontend-skjema";
import { Knapp } from "nav-frontend-knapper";

export const DokumenterFullvisning = styled.div`
  display: flex;
  overflow: hidden;
  flex-flow: column;
`;
export const List = styled.ul`
  display: block;
  list-style: none;
  font-size: 16px;
  margin: 0;
  padding: 6px;
`;

export const ListItem = styled.li`
  border-top: 1px solid #c6c2bf;
  padding: 12px;
`;

export const RightAlign = styled.div`
  display: flex;
  justify-content: right;
  float: right; //for safari
  position: relative;
`;

export const DokumentRad = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0.25em;
  display: grid;
  grid-template-areas:
    "tittel tema dato sjekkboks"
    "vedlegg vedlegg vedlegg vedlegg";
  grid-template-rows: 1fr;
`;

export const DokumentDato = styled.li`
  max-width: 8em;
  cursor: pointer;
  text-align: center;
  font-size: 0.9em;
  grid-area: dato;
`;

export const DokumentTittel = styled.li`
  cursor: pointer;
  color: #0067c5;
  grid-area: tittel;
  width: 11em;
`;

export const DokumentSjekkboks = styled.li`
  width: 100%;
  text-align: right;
  grid-area: sjekkboks;
  position: relative;
`;

export const DokumentCheckbox = styled(Checkbox)`
  font-size: 0;
  line-height: 0;
`;

export const DokumentTema = styled.li`
  width: 8em;
  cursor: pointer;
  grid-area: tema;
  max-height: 2em;
`;

export const TemaText = styled.div`
  max-width: 8em;
  white-space: nowrap;
  cursor: pointer;
  overflow: hidden;
  text-overflow: ellipsis;
  margin: 0;
`;

export const VedleggBeholder = styled.div`
  grid-area: vedlegg;
`;

export const VedleggRad = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0.65em 0 0 0;
  display: flex;
  justify-content: space-between;
`;

export const VedleggTittel = styled.li`
  color: #0067c5;
  margin: 0 0 0 2em;
  min-width: 15em;
  cursor: pointer;
`;

export const StyledLastFlereKnapp = styled(Knapp)`
  width: calc(100% - 2em);
  margin-bottom: 1em;
  margin-top: 1em;
  margin-left: auto;
  margin-right: auto;
`;
