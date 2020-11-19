import { Filter, oppgaveRequest, ytelseType } from "../../tilstand/moduler/oppgave";
import { useDispatch, useSelector } from "react-redux";
import React, { useEffect, useState } from "react";
import { velgMeg } from "../../tilstand/moduler/meg.velgere";
import {
  velgFiltrering,
  velgOppgaver,
  velgSideLaster,
  velgSortering,
} from "../../tilstand/moduler/oppgave.velgere";
import { tildelMegHandling } from "../../tilstand/moduler/saksbehandler";
import "../../stilark/Tabell.less";
import "../../stilark/TabellHead.less";
import FiltrerbarHeader, { settFilter } from "./FiltrerbarHeader";
import { valgtOppgaveType } from "../types";
import { genererTabellRader } from "./tabellfunksjoner";
import Paginering from "../Paginering/Paginering";
import { useHistory, useParams } from "react-router-dom";
import NavFrontendSpinner from "nav-frontend-spinner";
import Oppsett from "../Oppsett";
import { routingRequest } from "../../tilstand/moduler/router";
import { velgForrigeSti } from "../../tilstand/moduler/router.velgere";

function initState(filter: any) {
  if ("undefined" === typeof filter) {
    return [];
  }
  if (!Array.isArray(filter)) return [{ label: filter }];
  return filter.map(function (f: string) {
    return { label: f, value: f };
  });
}

const OppgaveTabell: React.FunctionComponent = () => {
  const dispatch = useDispatch();
  const meg = useSelector(velgMeg);
  const sortering = useSelector(velgSortering);
  const filtrering = useSelector(velgFiltrering);
  const sideLaster = useSelector(velgSideLaster);
  const oppgaver = useSelector(velgOppgaver);
  const forrigeSti = useSelector(velgForrigeSti);

  interface ParamTypes {
    side: string | undefined;
  }

  let { side } = useParams<ParamTypes>();
  let tolketSide = parseInt(side as string, 10) || 1;

  const [sortToggle, setSortToggle] = useState(0);
  const [hjemmelFilter, settHjemmelFilter] = useState<string[] | undefined>(undefined);
  const [aktiveHjemler, settAktiveHjemler] = useState<Filter[]>(initState(filtrering.hjemler));

  const [ytelseFilter, settYtelseFilter] = useState<ytelseType[] | undefined>(undefined);
  const [aktiveYtelser, settAktiveYtelser] = useState<Filter[]>(initState(filtrering.ytelser));

  const [typeFilter, settTypeFilter] = useState<string[] | undefined>(undefined);
  const [aktiveTyper, settAktiveTyper] = useState<Filter[]>(initState(filtrering.typer));

  const [sorteringFilter, settSorteringFilter] = useState<"synkende" | "stigende">(sortering.frist);
  const [valgtOppgave, settValgOppgave] = useState<valgtOppgaveType>({ id: "", versjon: 0 });

  const [antall, settAntall] = useState<number>(5);
  const [start, settStart] = useState<number>(0);
  const history = useHistory();
  const pathname = history.location.pathname.split("/")[1];

  useEffect(() => {
    if (valgtOppgave.id) {
      dispatch(
        tildelMegHandling({
          oppgaveId: valgtOppgave.id,
          ident: meg.id,
          versjon: valgtOppgave.versjon,
        })
      );
      dispatchTransformering(history.location.pathname.startsWith("/minesaker"));
    }
  }, [valgtOppgave.id]);

  useEffect(() => {
    if (meg.id) dispatchTransformering(history.location.pathname.startsWith("/minesaker"));
  }, [start, meg, hjemmelFilter, ytelseFilter, typeFilter, sorteringFilter]);

  useEffect(() => {
    settStart((tolketSide - 1) * antall);
    if (forrigeSti.split("/")[1] !== history.location.pathname.split("/")[1]) {
      settHjemmelFilter(undefined);
      settYtelseFilter(undefined);
      settTypeFilter(undefined);
      settAktiveTyper([]);
      settAktiveYtelser([]);
      settAktiveHjemler([]);
      dispatch(routingRequest(history.location.pathname));
    }
  }, [antall, tolketSide, forrigeSti, history.location.pathname]);

  const dispatchTransformering = (utvidet: boolean) =>
    dispatch(
      oppgaveRequest({
        ident: meg.id,
        antall: antall,
        start: start,
        projeksjon: utvidet ? "UTVIDET" : undefined,
        tildeltSaksbehandler: utvidet ? meg.id : undefined,
        transformasjoner: {
          filtrering: {
            hjemler: hjemmelFilter,
            typer: typeFilter,
            ytelser: ytelseFilter,
          },
          sortering: {
            frist: sorteringFilter,
          },
        },
      })
    );

  const filtrerType = (filtre: Filter[]) => {
    if (!filtre.length) {
      settTypeFilter(undefined);
    } else {
      settTypeFilter(filtre.map((f) => f.value as string));
    }
    settStart(0);
    history.push(history.location.pathname.replace(/\d+$/, "1"));
  };
  const skiftSortering = (
    event: React.MouseEvent<HTMLElement | HTMLButtonElement>,
    sortToggle: number,
    settSorteringFilter: Function,
    setSortToggle: Function
  ) => {
    event.preventDefault();
    if (sortToggle === 0) {
      settSorteringFilter("stigende");
      setSortToggle(1);
    } else {
      settSorteringFilter("synkende");
      setSortToggle(0);
    }
  };

  const filtrerHjemmel = (filtre: Filter[]) => {
    if (!filtre.length) {
      settHjemmelFilter(undefined);
    } else {
      settHjemmelFilter(filtre.map((f) => f.value as string));
    }
    settStart(0);
    history.push(history.location.pathname.replace(/\d+$/, "1"));
  };
  const filtrerYtelse = (filtre: Filter[]) => {
    if (!filtre.length) {
      settYtelseFilter(undefined);
    } else {
      settYtelseFilter(filtre.map((f) => f.value as ytelseType));
    }
    settStart(0);
    history.push(history.location.pathname.replace(/\d+$/, "1"));
  };

  if (oppgaver.meta.feilmelding) {
    return (
      <div className={"feil"}>
        <h1>{oppgaver.meta.feilmelding}</h1>
        <div>Vennligst forsøk igjen litt senere...</div>
      </div>
    );
  }

  if (sideLaster) {
    return <NavFrontendSpinner />;
  }

  return (
    <>
      <table className={`Tabell tabell tabell--stripet`} cellSpacing={0} cellPadding={10}>
        <thead>
          <tr>
            <FiltrerbarHeader
              onFilter={(filter, velgAlleEllerIngen) =>
                settFilter(settAktiveTyper, filter, aktiveTyper, velgAlleEllerIngen)
              }
              filtre={[
                { label: "Klage", value: "Klage" },
                { label: "Anke", value: "Anke" },
              ]}
              dispatchFunc={filtrerType}
              aktiveFiltere={aktiveTyper}
            >
              Type
            </FiltrerbarHeader>

            <FiltrerbarHeader
              onFilter={(filter, velgAlleEllerIngen) =>
                settFilter(settAktiveYtelser, filter, aktiveYtelser, velgAlleEllerIngen)
              }
              filtre={[
                { label: "Foreldrepenger", value: "Foreldrepenger" },
                { label: "Sykepenger", value: "Sykepenger" },
                { label: "Dagpenger", value: "Dagpenger" },
              ]}
              dispatchFunc={filtrerYtelse}
              aktiveFiltere={aktiveYtelser}
            >
              Ytelse
            </FiltrerbarHeader>

            <FiltrerbarHeader
              onFilter={(filter, velgAlleEllerIngen) =>
                settFilter(settAktiveHjemler, filter, aktiveHjemler, velgAlleEllerIngen)
              }
              filtre={[
                { label: "8-2, 8-15, 8-47 og 8-49", value: "8-2, 8-15, 8-47, 8-49" },
                { label: "8-3 og 8-13", value: "8-3, 8-13" },
                { label: "8-4, 8-7, og 8,8", value: "8-4, 8-7, 8-8" },
                { label: "8-9", value: "8-9" },
                { label: "8-12", value: "8-12" },
                { label: "8-20", value: "8-20" },
                { label: "8-28 - 8-30", value: "8-28, 8-29, 8-30" },
                { label: "8-34 - 8-39", value: "8-34, 8-35, 8-36, 8-37, 8-38, 8-39" },
                { label: "8-40 - 8-43", value: "8-40, 8-41, 8-42, 8-43" },
                { label: "22-3 og 22-12", value: "22-3, 22-12" },
                { label: "Annet", value: "?" },
              ]}
              dispatchFunc={filtrerHjemmel}
              aktiveFiltere={aktiveHjemler}
            >
              Hjemmel
            </FiltrerbarHeader>

            <th role="columnheader" aria-sort={sortToggle === 0 ? "ascending" : "descending"}>
              <div
                className={`sortHeader ${sortToggle === 0 ? "ascending" : "descending"}`}
                onClick={(e) => skiftSortering(e, sortToggle, settSorteringFilter, setSortToggle)}
              >
                Frist
              </div>
            </th>
            <th />
          </tr>
        </thead>
        <tbody>
          {genererTabellRader(settValgOppgave, oppgaver)}
          <tr>
            <td colSpan={6}>
              <div className="table-lbl">
                <div className={"paginering"}>
                  <Paginering
                    startSide={tolketSide}
                    antallSider={oppgaver.meta.sider}
                    pathname={pathname}
                  />
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </>
  );
};

export default OppgaveTabell;
