import React from "react";
import Oppsett from "../komponenter/Oppsett";
import "../stilark/App.less";
import "../stilark/Lists.less";
import "nav-frontend-tabell-style";
import debounce from "lodash.debounce";
import { useDispatch, useSelector } from "react-redux";
import { startSok } from "../tilstand/moduler/sok";
import { velgMeg } from "../tilstand/moduler/meg.velgere";
import NavFrontendSpinner from "nav-frontend-spinner";
import { velgSok } from "../tilstand/moduler/sok.velgere";
import styled from "styled-components";
import { Input } from "nav-frontend-skjema";

let SokInput = styled.div`
  display: block;
  margin: 1em;
  max-width: 60em;
`;

let Result = styled.div`
  display: block;
  margin: 1em;
`;

const Sok = (): JSX.Element => {
  let dispatch = useDispatch();
  const person = useSelector(velgMeg);
  const sokResult = useSelector(velgSok);

  return (
    <Oppsett visMeny={true}>
      <div>
        <SokInput>
          <Input
            type={"text"}
            onChange={(e) =>
              dispatch(
                startSok({
                  antall: 10,
                  navIdent: person.id,
                  start: 0,
                  fnr: e.target.value.trim(),
                })
              )
            }
          />
        </SokInput>

        <Result>
          {sokResult.laster && <NavFrontendSpinner />}

          {!sokResult.laster && <div>{JSON.stringify(sokResult.response)}</div>}
        </Result>
      </div>
    </Oppsett>
  );
};

export default Sok;
