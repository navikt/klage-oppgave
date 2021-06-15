import { configureStore, getDefaultMiddleware } from "@reduxjs/toolkit";
import { createEpicMiddleware } from "redux-observable";
import reducer, { rootEpic, RootState } from "./root";
import { ajax } from "rxjs/ajax";
import { fromFetch } from "rxjs/fetch";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";

const dependencies = {
  ajax,
  fromFetch,
};

export type Dependencies = typeof dependencies;

const epicMiddleware = createEpicMiddleware({
  dependencies,
});

const defaultMiddleware = getDefaultMiddleware({
  serializableCheck: {
    // Ignore these field paths in all actions.
    ignoredActionPaths: ["payload.payload.file", "payload.file"],
  },
});

const middleware = [...defaultMiddleware, epicMiddleware];

const reduxStore = configureStore({
  reducer,
  devTools: true,
  middleware,
});

epicMiddleware.run(rootEpic);

export type AppDispatch = typeof reduxStore.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export default reduxStore;
