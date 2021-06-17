import React from "react";
import styled from "styled-components";

interface InfofeltProps {
  header: string;
  info: string;
}

export const InfofeltStatisk = ({ header, info }: InfofeltProps) => (
  <Info>
    <b>{header}:</b>
    <p>{info}</p>
  </Info>
);

const Info = styled.div`
  p {
    margin: 0;
    white-space: pre-wrap;
  }
`;
