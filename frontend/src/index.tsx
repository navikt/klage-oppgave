import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import App from "./App";
//import { ENV } from './constants/env';
import store from "./tilstand/konfigurerTilstand";
//import { initEnvironment } from './state/modules/environment';
import { BrowserRouter, Redirect, Route, Switch } from "react-router-dom";
import MineSaker from "./komponenter/MineSaker";
import Innstillinger from "./komponenter/Innstillinger";

//store.dispatch(initEnvironment(ENV));

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <Switch>
          <Route exact path="/saker" render={() => <App />} />
          <Route exact path="/saker/:side" render={() => <App />} />
          <Route path="/minesaker" render={() => <MineSaker />} />
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
