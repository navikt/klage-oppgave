import React from "react";
import styled from "styled-components";

interface InfofeltProps {
  header: string;
  info: string;
}

interface InfoProps {
  info: string;
}

export const InfofeltStatisk = ({ header, info }: InfofeltProps) => (
  <Infofelt>
    <b>{header}:</b>
    <Info info={info} />
  </Infofelt>
);

const Infofelt = styled.div`
  p {
    margin: 0;
    white-space: pre-wrap;
  }
`;

const Info = ({ info }: InfoProps) => {
  if (info === "") {
    return <p>'-'</p>;
  }
  return <p>{info}</p>;
};
