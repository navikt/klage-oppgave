import React from "react";
import Oppsett from "./Oppsett";
import "../stilark/klagebehandling.less";

const Klagebehandling = (): JSX.Element => {
  return (
    <Oppsett visMeny={false}>
      <div className="klagebehandling__informasjon">
        <div className="rad">Henriette Bjørk</div>
      </div>
    </Oppsett>
  );
};

export default Klagebehandling;
