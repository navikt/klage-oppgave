import styled from "styled-components";
import { NavLink } from "react-router-dom";

export const TilbakeTilOppgaverLenke = styled(NavLink)`
  display: inline-block;
  color: #0067c5;
  font-size: 1em;
  margin-top: 2em;
  padding-left: 1em;
  padding-right: 1em;
  padding-top: 0.5em;
  padding-bottom: 0.5em;
  border: 2px solid #0067c5;
  border-radius: 2px;
  text-decoration: none;

  &:hover,
  &:active {
    background-color: #0067c5;
    color: #fff;
  }
`;
