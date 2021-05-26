// test-utils.jsx
import React from "react";
import { render as rtlRender } from "@testing-library/react";
import { createStore } from "redux";
import { Provider } from "react-redux";
// Import your own reducer
import reducer from "../tilstand/root";

function render(
  ui,
  { initialState, store = createStore(reducer, initialState), container, ...renderOptions } = {}
) {
  function Wrapper({ children }) {
    return <Provider store={store}>{children}</Provider>;
  }
  return rtlRender(ui, { wrapper: Wrapper, ...renderOptions, container });
}

// re-export everything
export * from "@testing-library/react";
// override render method
export { render };
