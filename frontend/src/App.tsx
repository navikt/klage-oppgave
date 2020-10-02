import React, { useEffect, useState } from "react";

import { Sidetittel, Normaltekst } from "nav-frontend-typografi";
import "./App.less";
import { get } from "./api";

export interface StringSkjema {
  token: string;
}

const App = (): JSX.Element => {
  const [tokendata, setTokendata] = useState<StringSkjema>();
  const [data, setData] = useState<StringSkjema>();

  useEffect(() => {
    const tokenUrl = "https://klage-oppgave-api.dev.nav.no/tokeninfo";
    get<StringSkjema>(tokenUrl)
      .then((result) => {
        setTokendata(result);
      })
      .catch((err) => {
        console.error(err);
      });
    const oppgaveUrl = "https://klage-oppgave-api.dev.nav.no/oppgaver";
    get<StringSkjema>(oppgaveUrl)
      .then((result) => {
        setData(result);
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  return (
    <main className="container">
      <header className="main-head">
        <div>NAV Klage</div>
      </header>
      <nav className="main-nav">
        <ul>
          <li>
            <a className="active" href="">
              Saker
            </a>
          </li>
          <li>
            <a href="">Mine&nbsp;Saker</a>
          </li>
          <li>
            <a href="">Innstillinger</a>
          </li>
        </ul>
      </nav>
      <article className="content">
        <h4>Respons fra API:</h4>
        <pre
          style={{
            maxWidth: 800,
            whiteSpace: "pre-wrap",
            wordWrap: "break-word",
          }}
        >
          {JSON.stringify(data)}

          {JSON.stringify(tokendata)}
        </pre>
      </article>
      <footer className="main-footer">
        <div>Bunnlinje</div>
      </footer>
    </main>
  );
};

export default App;
