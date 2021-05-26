/**
 * @jest-environment jsdom
 */
import React from "react";
import { render } from "../../utility/test-util.jsx";
import Medunderskriver from "./Medunderskriver";
import { screen } from "@testing-library/dom";

describe("Medunderskriver", () => {
  /*
    1. erMedunderskriver = null => return children
    2. Sendt til medunderskriver og saksbehandler ikke er medunderskriver = false
    3. Send til medunderskriver og saksbehandler er medunderskriver = true
    4. Medunderskriver har godkjent = null , og feltet finalized er satt til tidspunktet den ble godkjent. (Dette feltet er ikke med i KlagebehandlingListView (ennå), disse klagebehandlingene dukker ikke opp i den vanlige lista..)
    */

  test('Vis "medunderskriver" som status', () => {
    let meg = {
      id: "saksbehandler1",
    };
    let klagebehandlinger = {
      rader: [
        {
          id: "abc",
          erMedunderskriver: "saksbehandler1",
          type: "",
          klagebehandlingVersjon: 1,
          tema: "",
          hjemmel: "",
          frist: "",
          mottatt: "",
          saksbehandler: "saksbehandler1",
        },
      ],
      antallTreffTotalt: 1,
      start: 1,
      antall: 1,
      transformasjoner: {
        filtrering: {
          typer: [],
          temaer: [],
          hjemler: [],
        },
        sortering: {
          type: "mottatt" as "mottatt",
          frist: "stigende" as "stigende",
          mottatt: "stigende" as "stigende",
        },
      },
    };

    const tableRow = document.createElement("tr");
    render(
      <Medunderskriver id={"abc"}>
        <td>Tomt innhold</td>
      </Medunderskriver>,
      {
        initialState: { klagebehandlinger, meg },
        container: document.body.appendChild(tableRow),
      }
    );
    const node = screen.getByTestId("abc-text");
    expect(node.textContent).toEqual("Medunderskriver");
  });

  test('Vis "sendt til medunderskriver" som status', () => {
    let meg = {
      id: "saksbehandler1",
    };
    let klagebehandlinger = {
      rader: [
        {
          id: "abc",
          erMedunderskriver: "saksbehandler2",
          type: "",
          klagebehandlingVersjon: 1,
          tema: "",
          hjemmel: "",
          frist: "",
          mottatt: "",
          saksbehandler: "saksbehandler1",
        },
      ],
      antallTreffTotalt: 1,
      start: 1,
      antall: 1,
      transformasjoner: {
        filtrering: {
          typer: [],
          temaer: [],
          hjemler: [],
        },
        sortering: {
          type: "mottatt" as "mottatt",
          frist: "stigende" as "stigende",
          mottatt: "stigende" as "stigende",
        },
      },
    };

    const tableRow = document.createElement("tr");
    render(
      <Medunderskriver id={"abc"}>
        <td>Tomt innhold</td>
      </Medunderskriver>,
      {
        initialState: { klagebehandlinger, meg },
        container: document.body.appendChild(tableRow),
      }
    );
    const node = screen.getByTestId("abc-text");
    expect(node.textContent).toEqual("Sendt til medunderskriver");
  });

  test('Vis default innhold hvis "medunderskriver"-status er ugyldig', () => {
    let meg = {
      id: "saksbehandler1",
    };
    let klagebehandlinger = {
      rader: [
        {
          id: "abc",
          erMedunderskriver: "",
          type: "",
          klagebehandlingVersjon: 1,
          tema: "",
          hjemmel: "",
          frist: "",
          mottatt: "",
          saksbehandler: "",
        },
      ],
      antallTreffTotalt: 1,
      start: 1,
      antall: 1,
      transformasjoner: {
        filtrering: {
          typer: [],
          temaer: [],
          hjemler: [],
        },
        sortering: {
          type: "mottatt" as "mottatt",
          frist: "stigende" as "stigende",
          mottatt: "stigende" as "stigende",
        },
      },
    };

    const tableRow = document.createElement("tr");
    render(
      <Medunderskriver id={"abc"}>
        <td>Tomt innhold</td>
      </Medunderskriver>,
      {
        initialState: { klagebehandlinger, meg },
        container: document.body.appendChild(tableRow),
      }
    );
    const node = screen.findAllByText("Tomt innhold");
    expect(node).toBeTruthy();
  });
});
