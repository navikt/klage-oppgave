import React, { useEffect, useState } from "react";
import Oppsett from "../komponenter/Oppsett";
import "../stilark/App.less";
import "../stilark/Lists.less";
import "nav-frontend-tabell-style";
import OppgaveTabell from "../komponenter/Tabell/Tabell";
import styled from "styled-components";
import { renskElasticHandling } from "../tilstand/moduler/admin";
import { useDispatch, useSelector } from "react-redux";
import { velgAdmin } from "../tilstand/moduler/admin.velgere";
import NavFrontendSpinner from "nav-frontend-spinner";

let Overskrift = styled.h1`
  padding: 1em;
`;
let Lenker = styled.div`
  margin: 1em;
`;
let Knapp = styled.button`
  padding: 1em;
  border: 1px solid blue;
  width: 10em;
  &:hover {
    background: blue;
    color: white;
  }
  &:disabled {
    background: blue;
    color: white;
    opacity: 0.5;
  }
`;

const Admin = (): JSX.Element => {
  const dispatch = useDispatch();
  const admin = useSelector(velgAdmin);

  useEffect(() => {
    console.debug({ admin });
  }, [admin.laster]);

  return (
    <Oppsett visMeny={false}>
      <>
        <Overskrift>Admin</Overskrift>
        <Lenker>
          {admin.response}
          {admin.laster && <NavFrontendSpinner />}
          {!admin.laster && (
            <Knapp
              disabled={admin.laster}
              onClick={() => {
                dispatch(renskElasticHandling());
              }}
            >
              Tøm Elastic
            </Knapp>
          )}
        </Lenker>
      </>
    </Oppsett>
  );
};

export default Admin;
