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
  let [venter, settVenter] = useState(false);

  useEffect(() => {
    console.debug({ admin });
  }, [admin]);

  return (
    <Oppsett visMeny={false}>
      <>
        <Overskrift>Admin</Overskrift>
        <Lenker>
          <Knapp
            disabled={venter}
            onClick={() => {
              settVenter(true);
              dispatch(renskElasticHandling());
            }}
          >
            Tøm Elastic
          </Knapp>
        </Lenker>
      </>
    </Oppsett>
  );
};

export default Admin;
