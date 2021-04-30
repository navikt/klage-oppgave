import React from "react";

interface Bruker {
  fornavn?: string;
  mellomnavn?: string;
  etternavn?: string;
}

export function InfofeltStatisk(props: { header: string; info: string }) {
  return (
    <div>
      <b>{props.header}:</b>
      <br />
      {props.info}
    </div>
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
