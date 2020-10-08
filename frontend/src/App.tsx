import React, { useEffect, useState } from "react";
import NavFrontendSpinner from "nav-frontend-spinner";
import { Sidetittel, Normaltekst } from "nav-frontend-typografi";
import Layout from "./components/Layout";
import "./App.less";
import { get } from "./api";

type MainProps = { data: string };
const Main = ({ data }: MainProps) => {
  return (
    <>
      <pre
        style={{
          maxWidth: 800,
          whiteSpace: "pre-wrap",
          wordWrap: "break-word",
        }}
      >
        {JSON.stringify(data)}
      </pre>
    </>
  );
};
const App = (): JSX.Element => {
  const [data, setData] = useState<string>("");

  useEffect(() => {
    const oppgaveUrl = "/api/oppgaver";
    get<string>(oppgaveUrl)
      .then((result) => {
        setData(result);
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  return (
    <Layout loading={!data}>
      <Main data={data} />
    </Layout>
  );
};

export default App;
