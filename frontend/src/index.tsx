import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import App from "./App";
//import { ENV } from './constants/env';
import store from "./state/configureStore";
//import { initEnvironment } from './state/modules/environment';
import { BrowserRouter } from "react-router-dom";

//store.dispatch(initEnvironment(ENV));

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>,
  document.getElementById("app")
);
