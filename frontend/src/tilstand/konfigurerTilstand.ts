import { configureStore, getDefaultMiddleware } from "@reduxjs/toolkit";
import { createEpicMiddleware } from "redux-observable";
import reducer, { rootEpic, RootState } from "./root";
import { ajax } from "rxjs/ajax";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";

const epicMiddleware = createEpicMiddleware({
  dependencies: { getJSON: ajax.getJSON, get: ajax.get, put: ajax.put, post: ajax.post },
});

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

export type AppDispatch = typeof reduxStore.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export default reduxStore;
