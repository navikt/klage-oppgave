import React, { useEffect, useState } from "react";
import Layout from "./components/Layout";
import "./App.less";
import { get } from "./api";
import { getApiHost } from "./utility/getApiHost";

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
    const oppgaveUrl = `${getApiHost(window.location.host)}/oppgaver`;
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
