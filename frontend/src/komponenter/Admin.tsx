import React, { useEffect, useState } from "react";
import Oppsett from "../komponenter/Oppsett";
import "../stilark/App.less";
import "../stilark/Lists.less";
import "nav-frontend-tabell-style";
import styled from "styled-components";
import { gjenbyggElasticHandling } from "../tilstand/moduler/admin";
import { useDispatch, useSelector } from "react-redux";
import { velgAdmin } from "../tilstand/moduler/admin.velgere";
import NavFrontendSpinner from "nav-frontend-spinner";
import { velgFeatureToggles } from "../tilstand/moduler/unleash.velgere";
import { hentFeatureToggleHandling } from "../tilstand/moduler/unleash";

let Container = styled.div`
  display: flex;
  flex-flow: column;
  margin: 1em;
`;

let Overskrift = styled.h1`
  text-decoration: underline;
  padding: 0;
`;

let Lenker = styled.div``;

let Knapp = styled.button`
  padding: 0.5em;
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
  const featureToggles = useSelector(velgFeatureToggles);
  const [tilgang, settTilgang] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    dispatch(hentFeatureToggleHandling("klage.admin"));
  }, []);

  useEffect(() => {
    const tilgangEnabled = featureToggles.features.find((f) => f?.navn === "klage.admin");
    if (tilgangEnabled?.isEnabled !== undefined) {
      settTilgang(tilgangEnabled.isEnabled);
    }
  }, [featureToggles]);
  if (tilgang === undefined) {
    return <NavFrontendSpinner />;
  }
  if (!tilgang) {
    return <div>Beklager, men din bruker har ikke tilgang til denne siden</div>;
  }

  return (
    <Oppsett visMeny={false}>
      <Container>
        <Overskrift>Admin</Overskrift>
        <Lenker>
          {admin.laster && <NavFrontendSpinner />}
          {!admin.laster && (
            <>
              <div>Trykk her for å gjenoppbygge elastic-index.</div>
              <Knapp
                disabled={admin.laster}
                onClick={() => {
                  dispatch(gjenbyggElasticHandling());
                }}
              >
                Gjenoppbygg Elastic
              </Knapp>
            </>
          )}
        </Lenker>
      </Container>
    </Oppsett>
  );
};

export default Admin;
