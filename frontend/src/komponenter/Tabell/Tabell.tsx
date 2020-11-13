import { Filter, OppgaveRader, oppgaveRequest, ytelseType } from "../../tilstand/moduler/oppgave";
import { useDispatch, useSelector } from "react-redux";
import React, { useEffect, useRef, useState } from "react";
import { velgMeg } from "../../tilstand/moduler/meg.velgere";
import {
  velgFiltrering,
  velgSideLaster,
  velgSortering,
} from "../../tilstand/moduler/oppgave.velgere";
import { tildelMegHandling } from "../../tilstand/moduler/saksbehandler";
import classNames from "classnames";
import "../../stilark/Tabell.less";
import "../../stilark/TabellHead.less";
import FiltrerbarHeader, { settFilter } from "./FiltrerbarHeader";
import { valgtOppgaveType } from "../types";
import { genererTabellRader } from "./tabellfunksjoner";
import Paginering from "../Paginering/Paginering";
import { useParams } from "react-router-dom";
import NavFrontendSpinner from "nav-frontend-spinner";

function initState(filter: any) {
  if ("undefined" === typeof filter) {
    return [];
  }
  if (!Array.isArray(filter)) return [{ label: filter }];
  return filter.map(function (f: string) {
    return { label: f };
  });
}

const OppgaveTabell: any = (oppgaver: OppgaveRader) => {
  const dispatch = useDispatch();
  const meg = useSelector(velgMeg);
  const sortering = useSelector(velgSortering);
  const filtrering = useSelector(velgFiltrering);
  const sideLaster = useSelector(velgSideLaster);

  interface ParamTypes {
    side: string | undefined;
  }

  let { side } = useParams<ParamTypes>();
  let tolketSide = parseInt(side as string, 10) || 1;

  const [sortToggle, setSortToggle] = useState(0);
  const [hjemmelFilter, settHjemmelFilter] = useState<string[] | undefined>(undefined);
  const [aktiveHjemler, settAktiveHjemler] = useState<Filter[]>(initState(filtrering.hjemler));

  const [ytelseFilter, settYtelseFilter] = useState<ytelseType>(undefined);
  const [aktiveYtelser, settAktiveYtelser] = useState<Filter[]>(initState(filtrering.ytelser));

  const [typeFilter, settTypeFilter] = useState<string[] | undefined>(undefined);
  const [aktiveTyper, settAktiveTyper] = useState<Filter[]>(initState(filtrering.typer));

  const [sorteringFilter, settSorteringFilter] = useState<"synkende" | "stigende">(sortering.frist);
  const [valgtOppgave, settValgOppgave] = useState<valgtOppgaveType>({ id: "", versjon: 0 });

  const [antall, settAntall] = useState<number>(5);

  useEffect(() => {
    if (valgtOppgave.id) {
      dispatch(
        tildelMegHandling({
          oppgaveId: valgtOppgave.id,
          ident: meg.id,
          versjon: valgtOppgave.versjon,
        })
      );
    }
  }, [valgtOppgave.id]);

  useEffect(() => {
    if (meg.id) dispatchTransformering();
  }, [hjemmelFilter, ytelseFilter, typeFilter, sorteringFilter, tolketSide, meg]);

  const dispatchTransformering = () =>
    dispatch(
      oppgaveRequest({
        ident: meg.id,
        antall: antall,
        start: tolketSide,
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
      let typer = filtre.reduce((a, b) => {
        return { label: `${a.label},${b.label}` };
      });
      settTypeFilter([typer.label as string]);
    }
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
    console.log(filtre);

    if (!filtre.length) {
      settHjemmelFilter(undefined);
    } else {
      let hjemler = filtre.reduce((a, b) => {
        return { label: `${a.label},${b.label}` };
      });
      settHjemmelFilter([hjemler.label as string]);
    }
  };
  const filtrerYtelse = (filtre: Filter[]) => {
    if (!filtre.length) {
      settYtelseFilter(undefined);
    } else {
      let ytelser = filtre.reduce((a, b) => {
        return { label: `${a.label},${b.label}` };
      });
      settYtelseFilter(ytelser.label as ytelseType);
    }
  };

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
              filtre={[{ label: "Klage" }, { label: "Anke" }]}
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
                { label: "Foreldrepenger" },
                { label: "Sykepenger" },
                { label: "Dagpenger" },
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
                { label: "8-2, 8-15, 8-47 og 8-49" },
                { label: "8-3 og 8-13" },
                { label: "8-4, 8-7, og 8,8" },
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
                  <Paginering startSide={tolketSide} antallSider={oppgaver.meta.sider} />
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
