import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import { Provider, useDispatch } from "react-redux";
//import { ENV } from './constants/env';
import store from "./tilstand/konfigurerTilstand";
//import { initEnvironment } from './state/modules/environment';
import { BrowserRouter, Redirect, Route, Switch } from "react-router-dom";
import MineSaker from "./komponenter/MineSaker";
import AlleSaker from "./komponenter/AlleSaker";
import Innstillinger from "./komponenter/Innstillinger";
import { hentMegHandling } from "./tilstand/moduler/meg";

store.dispatch(hentMegHandling());

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <Switch>
          <Route exact path="/saker" render={() => <AlleSaker />} />
          <Route exact path="/saker/:side" render={() => <AlleSaker />} />
          <Route exact path="/minesaker" render={() => <MineSaker />} />
          <Route exact path="/minesaker/:side" render={() => <MineSaker />} />
          <Route path="/innstillinger" render={() => <Innstillinger />} />
          <Route exact path="/">
            <Redirect to="/saker" />
          </Route>
        </Switch>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>,
  document.getElementById("app")
);
