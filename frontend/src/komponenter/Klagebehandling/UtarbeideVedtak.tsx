import React from "react";
import "nav-frontend-tabell-style";
import "./UtarbeideVedtak.less";

interface Props {
  klage: any;
}

const UtarbeideVedtak = (props: Props): JSX.Element => {
  const klage = props.klage;
  return (
    <div className="container">
      <div className="vedtak-container">
        <div className="brukerinfo">
          <p>NAVN</p>
          <p>ADRESSE</p>
          <p>{klage.foedselsnummer}</p>
        </div>
        <div>
          <p>Fra NAV-enhet: {klage.fraNAVEnhet}</p>
          <p>Tema: {klage.tema}</p>
        </div>
      </div>
    </div>
  );
};

export default UtarbeideVedtak;
