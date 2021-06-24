import React, { useEffect } from "react";
import Oppsett from "../komponenter/Oppsett";
import "../stilark/App.less";
import "../stilark/Lists.less";
import "nav-frontend-tabell-style";
import OppgaveTabell from "../komponenter/Tabell/Tabell";
import { withErrorBoundary } from "../utility/ErrorBoundary";
import { ErrorMessage } from "./error-message";

const ErrorMessageWithErrorBoundary = withErrorBoundary(ErrorMessage);

const App = (): JSX.Element => {
  return (
    <Oppsett visMeny={true}>
      <ErrorMessageWithErrorBoundary>
        <OppgaveTabell visFilter={false} />
      </ErrorMessageWithErrorBoundary>
    </Oppsett>
  );
};

export default App;
