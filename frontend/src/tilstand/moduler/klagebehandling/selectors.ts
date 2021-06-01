import { RootState } from "../../root";

export const velgKlagebehandling = (state: RootState) => state.klagebehandlingState.klagebehandling;
export const velgKlagebehandlingOpptatt = (state: RootState) => state.klagebehandlingState.opptatt;
export const velgLagretKlagebehandlingVersjon = (state: RootState) =>
  state.klagebehandlingState.lagretVersjon;
export const velgKlagebehandlingError = (state: RootState) => state.klagebehandlingState.error;
