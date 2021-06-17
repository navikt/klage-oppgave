import { Checkbox } from "nav-frontend-skjema";
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

export const DokumenterFullvisning = styled.div`
  display: flex;
  overflow: auto;
  flex-flow: column;
`;

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

export const TilknyttetTittel = styled.button<{ tilknyttet: boolean }>`
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

export const DokumentTittel = styled.li`
  cursor: pointer;
  color: #0067c5;
  grid-area: tittel;
  width: 11em;
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
export const DokumentDato = styled.li`
  max-width: 8em;
  cursor: pointer;
  text-align: center;
  font-size: 0.9em;
  grid-area: dato;
`;

export const DokumentSjekkboks = styled.li`
  width: 100%;
  text-align: right;
  grid-area: sjekkboks;
  position: relative;
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

export const DokumentCheckbox = styled(Checkbox)`
  font-size: 0;
  line-height: 0;
`;
