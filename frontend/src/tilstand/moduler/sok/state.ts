import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IPersonResultat, ISokResultat } from "./types";

export const sokSlice = createSlice({
  name: "sok",
  initialState: {
    laster: false,
    response: {
      antallTreffTotalt: 0,
      personer: [] as IPersonResultat[],
    },
  },
  reducers: {
    SOK: (state, action: PayloadAction) => {
      state.laster = true;
      return state;
    },
    SOK_FAIL: (state, action: PayloadAction) => {
      return state;
    },
    SOK_LASTER: (state, action: PayloadAction<boolean>) => {
      state.laster = action.payload;
      return state;
    },
    SOK_RESPONSE: (state, action: PayloadAction<ISokResultat>) => {
      state.laster = false;
      state.response = {
        antallTreffTotalt: action.payload.antallTreffTotalt,
        personer: action.payload.personer ?? [],
      };
      return state;
    },
    SOK_TOM: (state) => {
      state.laster = false;
      state.response = {
        antallTreffTotalt: 0,
        personer: [] as IPersonResultat[],
      };
      return state;
    },
  },
});

export const { SOK, SOK_FAIL, SOK_LASTER, SOK_RESPONSE, SOK_TOM } = sokSlice.actions;

export default sokSlice.reducer;
