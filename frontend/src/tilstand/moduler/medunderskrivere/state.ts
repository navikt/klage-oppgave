import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IMedunderskrivereState } from "./stateTypes";
import { IMedunderskriverePayload } from "./types";

const initialState: IMedunderskrivereState = {
  medunderskrivere: [],
  loading: false,
};

const medunderskrivereSlice = createSlice({
  name: "medunderskrivere",
  initialState: initialState,
  reducers: {
    LASTET: (state, action: PayloadAction<IMedunderskriverePayload>) => ({
      medunderskrivere: action.payload.medunderskrivere,
      loading: false,
    }),
    LOADING: (state) => {
      state.loading = true;
      return state;
    },
    DONE: (state) => {
      state.loading = false;
      return state;
    },
    ERROR: (state, action: PayloadAction<Error>) => {
      console.error(action.payload);
      state.loading = false;
      return state;
    },
  },
});

export const medunderskrivere = medunderskrivereSlice.reducer;

export const { LASTET, LOADING, DONE, ERROR } = medunderskrivereSlice.actions;
