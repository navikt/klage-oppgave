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
  it("første side har aktiv neste-lenke, inaktiv forrige-lenke", async () => {
    let rendered = render(
      <Router>
        <Paginering antallSider={4} startSide={1} pathname={"saker"} />
      </Router>
    );
    await waitFor(() => screen.queryAllByTestId("forrige"));
    expect(screen.getByTestId("forrige")).toHaveTextContent("Forrige");
    expect(screen.getByTestId("forrige")).toHaveClass("inactive");
    expect(screen.getByTestId("neste")).toHaveClass("pagineringslenke");
  });
  it("Både forrige og neste har lenker", async () => {
    let rendered = render(
      <Router>
        <Paginering antallSider={24} startSide={5} pathname={"saker"} />
      </Router>
    );
    await waitFor(() => screen.queryAllByTestId("forrige"));
    expect(screen.getByTestId("forrige")).toHaveTextContent("Forrige");
    expect(screen.getByTestId("forrige")).toHaveClass("pagineringslenke");
    expect(screen.getByTestId("neste")).toHaveClass("pagineringslenke");
  });

  it("Viser siste side med inaktive neste-link", async () => {
    let rendered = render(
      <Router>
        <Paginering antallSider={10} startSide={10} pathname={"saker"} />
      </Router>
    );
    await waitFor(() => screen.queryAllByTestId("forrige"));
    expect(screen.getByTestId("neste")).toHaveClass("inactive");
  });
});
