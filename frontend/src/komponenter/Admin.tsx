import React, { useEffect } from "react";
import Oppsett from "../komponenter/Oppsett";
import "../stilark/App.less";
import "../stilark/Lists.less";
import "nav-frontend-tabell-style";
import OppgaveTabell from "../komponenter/Tabell/Tabell";
import styled from "styled-components";
import { renskElasticHandling } from "../tilstand/moduler/admin";
import { useDispatch } from "react-redux";

let Overskrift = styled.h1`
  padding: 1em;
`;
let Lenker = styled.ul`
  padding: 1em;
`;

const Admin = (): JSX.Element => {
  const dispatch = useDispatch();

  return (
    <Oppsett visMeny={false}>
      <>
        <Overskrift>Admin</Overskrift>
        <Lenker>
          <button onClick={() => dispatch(renskElasticHandling())}>Tøm Elastic</button>
        </Lenker>
      </>
    </Oppsett>
  );
};

export default Admin;
