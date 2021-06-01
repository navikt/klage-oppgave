import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import store from "./tilstand/konfigurerTilstand";
import { BrowserRouter, Redirect, Route, Switch } from "react-router-dom";
import MineSaker from "./komponenter/MineSaker";
import AlleSaker from "./komponenter/AlleSaker";
import Innstillinger from "./komponenter/Innstillinger";
import { hentMegHandling } from "./tilstand/moduler/meg";
import Admin from "./komponenter/Admin";
import Kvalitetsskjema from "./komponenter/Kvalitetsskjema";
import { KlagebehandlingLaster } from "./komponenter/Klagebehandling/KlagebehandlingLaster";

store.dispatch(hentMegHandling());

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <Switch>
          <Route exact path="/klagebehandling/:id" render={() => <KlagebehandlingLaster />} />
          <Route exact path="/oppgaver" render={() => <AlleSaker />} />
          <Route exact path="/oppgaver/:side" render={() => <AlleSaker />} />
          <Route exact path="/mineoppgaver" render={() => <MineSaker />} />
          <Route exact path="/mineoppgaver/:side" render={() => <MineSaker />} />
          <Route exact path="/innstillinger" render={() => <Innstillinger />} />
          <Route exact path="/kvalitetsskjema" render={() => <Kvalitetsskjema />} />
          <Route exact path="/admin" render={() => <Admin />} />
          <Redirect to="/oppgaver" />
        </Switch>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>,
  document.getElementById("app")
);
