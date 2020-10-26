/**
 * @jest-environment jsdom
 */
import { cleanup, fireEvent, waitFor, screen, render } from "@testing-library/react";
import "@testing-library/jest-dom";
import Paginering from "./Paginering";
import React, { createElement } from "react";
import { NavLink, BrowserRouter as Router } from "react-router-dom";

jest.mock("./paginering.less", () => jest.fn());

describe("Paginering", () => {
  it("CheckboxWithLabel changes the text after click", async () => {
    /*          const {queryAllByTestId, queryByText,queryByTestId,queryByLabelText, getByLabelText} = render(
                          <Router>
                              <Paginering antallSider={4} startSide={1}/>
                          </Router>
                      );
          */
    let rendered = render(
      <Router>
        <Paginering antallSider={4} startSide={1} />
      </Router>
    );

    await waitFor(() => screen.queryAllByTestId("forrige"));

    expect(screen.getByTestId("forrige")).toHaveTextContent("Forrige side");

    //expect(queryAllByTestId(/forrige/i)).toHaveTextContent("forrige");
  });
});
