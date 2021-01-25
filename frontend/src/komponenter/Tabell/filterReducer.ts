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

function filterReducer(dispatchFn: Function, antall: number, start: number) {
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
        frist: "stigende",
      },
    },
  };

  function toValue<T>(filters: Array<string | temaType | Filter>) {
    return filters.map((filter: any) => filter.value);
  }

  function hentOppgaver(dispatchFn: Function, state: FilterState) {
    dispatchFn(
      oppgaveRequest({
        ident: state.ident,
        antall: state.antall,
        start: state.start || 0,
        enhetId: state?.enhetId,
        projeksjon: state?.projeksjon ? "UTVIDET" : undefined,
        tildeltSaksbehandler: state.tildeltSaksbehandler,
        transformasjoner: {
          filtrering: {
            hjemler: <string[]>toValue(state.transformasjoner.filtrering.hjemler),
            typer: <string[]>toValue(state.transformasjoner.filtrering.typer),
            temaer: <temaType[]>toValue(state.transformasjoner.filtrering.temaer),
          },
          sortering: {
            frist: state.transformasjoner.sortering.frist,
          },
        },
      })
    );
  }

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
      case "hent_oppgaver": {
        /**
         * HENT DATA FRA API
         */
        if (!state.ident) {
          console.error("henter oppgaver uten ident!");
          return state;
        }
        if (!state.enhetId) {
          console.error("henter oppgaver uten enhetId!");
          return state;
        }
        if (undefined === typeof state.start) {
          console.error("henter ikke oppgaver uten start!");
          return state;
        }
        if (!state.antall) {
          console.error("henter ikke oppgaver uten antall!");
          return state;
        }

        state.meta.kan_hente_oppgaver = false;
        hentOppgaver(dispatchFn, state);
        return state;
      }
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
