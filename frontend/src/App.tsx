import React, { useEffect, useState } from "react";
import Layout from "./components/Layout";
import "./App.less";
import "./Tabell.less";
import { get } from "./api";
import { getApiHost } from "./utility/getApiHost";

interface OppgaveRad {
  id: number;
  bruker: {
    fnr: string;
    navn: string;
  };
  type: string;
  ytelse: string;
  hjemmel: [string];
  frist: string;
  saksbehandler: string;
}

interface OppgaveRader {
  data: [OppgaveRad];
}

const initRad: OppgaveRad = {
  id: 0,
  bruker: {
    fnr: "",
    navn: "",
  },
  type: "",
  ytelse: "",
  hjemmel: [""],
  frist: "",
  saksbehandler: "",
};

const OppgaveSkjema = (data: OppgaveRader) => {
  return <table className="oppgave">{visTabell(data.data)}</table>;
};

const OppgaveRad = ({ id, type, ytelse, hjemmel, frist }: OppgaveRad) => {
  return (
    <tr>
      <td>{type}</td>
      <td>{id}</td>
      <td>{ytelse}</td>
      <td>{hjemmel}</td>
      <td>{frist}</td>
      <td>
        <button>Tildel meg</button>
      </td>
      <td>
        <input type="checkbox" />
      </td>
    </tr>
  );
};

const visTabell = (rader: Array<OppgaveRad>): JSX.Element[] => {
  return rader.map((rad) => <OppgaveRad key={rad.id} {...rad} />);
};

const App = (): JSX.Element => {
  const [data, setData] = useState<[OppgaveRad]>([initRad]);

  useEffect(() => {
    const oppgaveUrl = `${getApiHost(window.location.host)}/oppgaver`;
    get<[OppgaveRad]>(oppgaveUrl)
      .then((result) => setData(result))
      .catch((err) => console.error(err));
  }, []);

  return (
    <Layout loading={JSON.stringify(data[0]) === JSON.stringify(initRad)}>
      <OppgaveSkjema data={data} />
    </Layout>
  );
};

export default App;
