import React, { useEffect } from "react";
import Oppsett from "./komponenter/Oppsett";
import "./stilark/App.less";
import "./stilark/Lists.less";
import "nav-frontend-tabell-style";

import OppgaveTabell from "./komponenter/Tabell/Tabell";

const App = (): JSX.Element => {
  return (
    <Oppsett isFetching={false}>
      <OppgaveTabell />
    </Oppsett>
  );
};

export default App;
