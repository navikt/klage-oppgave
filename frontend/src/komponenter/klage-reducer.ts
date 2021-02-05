import { useReducer } from "react";

export interface IKlageState {
  oppgaveId: string;
  aktivSide: string;
}

function klageReducer() {
  const initialState: IKlageState = {
    oppgaveId: "0",
    aktivSide: "klagen",
  };

  function reducer(state: any, action: any) {
    //console.debug({ type: action.type, payload: action.payload });
    switch (action.type) {
      case "sett_aktiv_side": {
        return {
          ...state,
          aktivSide: action.payload,
        };
      }
      case "sett_oppgave_id": {
        return {
          ...state,
          oppgaveId: action.payload,
        };
      }

      default:
        throw new Error(action.type);
    }
  }

  const [klage_state, klage_dispatch] = useReducer(reducer, initialState);

  return { klage_state, klage_dispatch };
}

export default klageReducer;
