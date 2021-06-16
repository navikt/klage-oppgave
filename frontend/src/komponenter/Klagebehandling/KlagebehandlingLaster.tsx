import NavFrontendSpinner from "nav-frontend-spinner";
import React, { useEffect } from "react";
import { NavLink, useParams } from "react-router-dom";
import styled from "styled-components";
import { useAppDispatch, useAppSelector } from "../../tilstand/konfigurerTilstand";
import {
  hentKlagebehandling,
  unloadKlagebehandling,
} from "../../tilstand/moduler/klagebehandling/actions";
import {
  velgKlagebehandling,
  velgKlagebehandlingError,
} from "../../tilstand/moduler/klagebehandling/selectors";
import { velgKodeverk } from "../../tilstand/moduler/kodeverk.velgere";
import Oppsett from "../Oppsett";
import { Klagebehandling } from "./KlageBehandling";

export const KlagebehandlingLaster = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const klagebehandling = useAppSelector(velgKlagebehandling);
  const klagebehandlingError = useAppSelector(velgKlagebehandlingError);
  const { lasterKodeverk } = useAppSelector(velgKodeverk);

  useEffect(() => {
    if (id.length > 0) {
      dispatch(hentKlagebehandling(id));
    }
    return () => {
      dispatch(unloadKlagebehandling());
    };
  }, [id, dispatch]);

  if (id.length === 0 || klagebehandling === null || lasterKodeverk) {
    return (
      <div style={{ margin: "40vh auto 0 auto" }}>
        <NavFrontendSpinner />
      </div>
    );
  }

  if (klagebehandlingError !== null) {
    return (
      <Oppsett backLink={"/mineoppgaver"} visMeny={false}>
        <FeilmeldingInformasjon className="klagebehandling__informasjon" style={{ padding: "5em" }}>
          <div>Klage kunne ikke hentes...</div>
          <div>
            <NavLink to={"/mineoppgaver"}>Tilbake til Mine Oppgaver</NavLink>
          </div>
        </FeilmeldingInformasjon>
      </Oppsett>
    );
  }

  return <Klagebehandling klagebehandling={klagebehandling} />;
};

const FeilmeldingInformasjon = styled.div`
  background-color: #f8f8f8;
  display: flex;
  height: 4em;
  font-size: 1.1em;
  justify-content: space-between;

  &.rad {
    margin-top: 1.5em;
    padding: 0 0 0 1em;
  }
`;
