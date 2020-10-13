import { configureStore, getDefaultMiddleware } from "@reduxjs/toolkit";
import { createEpicMiddleware } from "redux-observable";
import reducer, { rootEpic } from "./root";

const epicMiddleware = createEpicMiddleware();

const defaultMiddleware = getDefaultMiddleware({
  serializableCheck: {
    ignoredActions: [
      // Add actions here whose payload may contain non-serializable values.
      // Only add them if you are certain it will not cause any issues.
    ],
  },
});

const middleware = [...defaultMiddleware, epicMiddleware];

const reduxStore = configureStore({
  reducer,
  devTools: true,
  middleware,
});

epicMiddleware.run(rootEpic);

export default reduxStore;
