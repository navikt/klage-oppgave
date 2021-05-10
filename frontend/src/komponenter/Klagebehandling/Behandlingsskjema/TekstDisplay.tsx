import React from "react";
import styled from "styled-components";

interface Bruker {
  fornavn?: string;
  mellomnavn?: string;
  etternavn?: string;
}

const Info = styled.div`
  p {
    margin: 0;
  }
`;

export function InfofeltStatisk(props: { header: string; info: string }) {
  return (
    <Info>
      <b>{props.header}:</b>
      <p>{props.info}</p>
    </Info>
  );
}

export const faaFulltNavn = (bruker: Bruker): string => {
  let name = bruker.fornavn ?? "";
  name += bruker.mellomnavn ? " " + bruker.mellomnavn : "";
  name += bruker.etternavn ? " " + bruker.etternavn : "";
  return name;
};

export const faaFulltNavnMedFnr = (bruker: Bruker, fnr: string) =>
  faaFulltNavn(bruker) + " (" + fnr + ")";
