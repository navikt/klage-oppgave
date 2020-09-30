import React, { useEffect, useState } from "react";

import { Sidetittel, Normaltekst } from "nav-frontend-typografi";
import { Logo } from "./assets/navlogo";
import "./App.less";
import { get } from "./api";

export interface TokenSkjema {
  token: string;
}

const App = (): JSX.Element => {
  const [tokendata, setTokendata] = useState<TokenSkjema>();

  useEffect(() => {
    const tokenUrl = "https://klage-oppgave-api.dev.nav.no/tokeninfo";
    get<TokenSkjema>(tokenUrl)
      .then((result) => {
        setTokendata(result);
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);
  return (
    <main className="container">
      <Logo />
      <Sidetittel>Klage Oppgave</Sidetittel>
      <pre
        style={{
          maxWidth: 800,
          whiteSpace: "pre-wrap",
          wordWrap: "break-word",
        }}
      >
        <h4>Respons fra API:</h4>
        {JSON.stringify(tokendata)}
      </pre>
    </main>
  );
};

export default App;
