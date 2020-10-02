import React, { useEffect, useState } from "react";

import { Sidetittel, Normaltekst } from "nav-frontend-typografi";
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
      <header className="main-head">NAV Klage</header>
      <nav className="main-nav">
        <ul>
          <li>
            <a href="">Saker</a>
          </li>
          <li>
            <a href="">Mine Saker</a>
          </li>
          <li>
            <a href="">Innstillinger</a>
          </li>
        </ul>
      </nav>
      <article className="content">
        <p>Tildel meg sak...</p>
      </article>
      <aside className="side">Eventuelt?</aside>
      <footer className="main-footer">Bunn</footer>
    </main>
  );
};

export default App;
