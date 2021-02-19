import { Filter, oppgaveRequest, temaType, Transformasjoner } from "../../tilstand/moduler/oppgave";
import { useReducer } from "react";
import { MegType } from "../../tilstand/moduler/meg";

interface FilterState {
  meta: {
    transformasjoner_satt: boolean;
    saksbehandler_satt: boolean;
    kan_hente_oppgaver: boolean;
  };
  meg: Partial<MegType> | undefined;
  ident: string;
  antall: number;
  start: number;
  enhetId: string;
  projeksjon: "UTVIDET" | undefined;
  tildeltSaksbehandler?: string;
  transformasjoner: Transformasjoner;
}

function filterReducer(antall: number, start: number) {
  const initialState: FilterState = {
    meta: {
      transformasjoner_satt: false,
      saksbehandler_satt: false,
      kan_hente_oppgaver: false,
    },
    meg: undefined,
    ident: "",
    antall: antall || 10,
    start: start || 0,
    enhetId: "",
    projeksjon: undefined,
    tildeltSaksbehandler: undefined,
    transformasjoner: {
      filtrering: {
        hjemler: [],
        typer: [],
        temaer: [],
      },
      sortering: {
        type: "frist",
        frist: "stigende",
      },
    },
  };

  function kanHenteOppgaver(state: any) {
    let klar = true;
    if (!state.ident) {
      klar = false;
    }
    if (!state.meta.transformasjoner_satt) {
      klar = false;
    }
    if (!state.meta.saksbehandler_satt) {
      klar = false;
    }
    return klar;
  }

  function reducer(state: any, action: any) {
    switch (action.type) {
      case "sett_start": {
        if (undefined !== typeof action.payload) return { ...state, start: action.payload };
        else return state;
      }

      case "sett_tildelt_saksbehandler": {
        return {
          ...state,
          meta: { ...state.meta, saksbehandler_satt: true },
          tildeltSaksbehandler: action.payload,
        };
      }

      case "sett_kan_hente_oppgaver": {
        return {
          ...state,
          meta: { ...state.meta, kan_hente_oppgaver: true },
        };
      }

      case "sett_transformasjoner": {
        return {
          ...state,
          meta: {
            ...state.meta,
            transformasjoner_satt: true,
            kan_hente_oppgaver: kanHenteOppgaver(state),
          },
          transformasjoner: {
            ...state.transformasjoner,
            filtrering: {
              temaer: action.payload.temaer,
              hjemler: action.payload.hjemler,
              typer: action.payload.typer,
            },
          },
        };
      }
      case "sett_aktive_temaer": {
        return {
          ...state,
          transformasjoner: {
            ...state.transformasjoner,
            filtrering: { ...state.transformasjoner.filtrering, temaer: action.payload },
          },
        };
      }
      case "sett_aktive_hjemler": {
        return {
          ...state,
          transformasjoner: {
            ...state.transformasjoner,
            filtrering: { ...state.transformasjoner.filtrering, hjemler: action.payload },
          },
        };
      }
      case "sett_aktive_typer": {
        return {
          ...state,
          transformasjoner: {
            ...state.transformasjoner,
            filtrering: { ...state.transformasjoner.filtrering, typer: action.payload },
          },
        };
      }
      case "sett_frist": {
        return {
          ...state,
          meta: { ...state.meta, kan_hente_oppgaver: true },
          transformasjoner: { ...state.transformasjoner, sortering: { frist: action.payload } },
        };
      }
      case "sett_navident": {
        return {
          ...state,
          meta: { ...state.meta, kan_hente_oppgaver: kanHenteOppgaver(state) },
          ident: action.payload.id,
          enhetId: action.payload.enheter[action.payload.valgtEnhet].id,
          meg: { ...action.payload },
        };
      }
      case "sett_projeksjon": {
        return { ...state, projeksjon: action.payload };
      }

      default:
        throw new Error(action.type);
    }
  }

  const [filter_state, filter_dispatch] = useReducer(reducer, initialState);

  return { filter_state, filter_dispatch };
}

export default filterReducer;
