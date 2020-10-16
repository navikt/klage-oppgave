import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import App from "./App";
//import { ENV } from './constants/env';
import store from "./tilstand/konfigurerTilstand";
//import { initEnvironment } from './state/modules/environment';
import { BrowserRouter, Route, Switch } from "react-router-dom";

//store.dispatch(initEnvironment(ENV));

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <Switch>
          <Route path="/saker" render={() => <App />} />
          <Route path="/minesaker" render={() => <App />} />
          <Route path="/innstillinger" render={() => <App />} />
          <Route path="/" render={() => <App />} />
        </Switch>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>,
  document.getElementById("app")
);
