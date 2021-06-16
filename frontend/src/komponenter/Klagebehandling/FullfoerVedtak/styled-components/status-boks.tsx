import React from "react";
import styled from "styled-components";
import { AlertStripeSuksess } from "nav-frontend-alertstriper";

export const StatusBoks = styled(AlertStripeSuksess)`
  margin-top: 1em;
`;

interface StatusBoksMedTittelProps {
  tittel: string;
}

export const StatusBoksMedTittel: React.FC<StatusBoksMedTittelProps> = ({ tittel, children }) => (
  <StatusBoks>
    <StatusBoksTittel>{tittel}</StatusBoksTittel>
    {children}
  </StatusBoks>
);

const StatusBoksTittel = styled.strong`
  display: block;
`;
