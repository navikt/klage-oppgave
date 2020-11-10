import {
  Filter,
  OppgaveRader,
  oppgaveRequest,
  settSide,
  ytelseType,
} from "../../tilstand/moduler/oppgave";
import { useDispatch, useSelector } from "react-redux";
import React, { useEffect, useState } from "react";
import { velgMeg } from "../../tilstand/moduler/meg.velgere";
import { tildelMegHandling } from "../../tilstand/moduler/saksbehandler";
import { Select } from "nav-frontend-skjema";
import classNames from "classnames";
import "../../stilark/Tabell.less";
import "../../stilark/TabellHead.less";
import FiltrerbarHeader, { settFilter } from "./FiltrerbarHeader";
import { valgtOppgaveType } from "../types";
import { genererTabellRader } from "./tabellfunksjoner";

const OppgaveTabell: any = (oppgaver: OppgaveRader) => {
  const dispatch = useDispatch();
  const meg = useSelector(velgMeg);

  const [sortToggle, setSortToggle] = useState(0);
  const [hjemmelFilter, settHjemmelFilter] = useState<string[] | undefined>(undefined);
  const [aktiveHjemler, settAktiveHjemler] = useState<Filter[]>([]);

  const [ytelseFilter, settYtelseFilter] = useState<ytelseType>(undefined);
  const [aktiveYtelser, settAktiveYtelser] = useState<Filter[]>([]);

  const [typeFilter, settTypeFilter] = useState<string[] | undefined>(undefined);
  const [aktiveTyper, settAktiveTyper] = useState<Filter[]>([]);

  const [sorteringFilter, settSorteringFilter] = useState<"synkende" | "stigende">("synkende");
  const [valgtOppgave, settValgOppgave] = useState<valgtOppgaveType>({ id: "", versjon: 0 });

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
    dispatchTransformering();
    dispatch(settSide(1));
  }, [hjemmelFilter, ytelseFilter, typeFilter, sorteringFilter]);

  const dispatchTransformering = () =>
    dispatch(
      oppgaveRequest({
        ident: meg.id,
        antall: 5,
        start: 0,
        transformasjoner: {
          filtrering: {
            hjemmel: hjemmelFilter,
            type: typeFilter,
            ytelse: ytelseFilter,
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
      console.log("dispatch typer:", typer.label);
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
    if (!filtre.length) {
      settHjemmelFilter(undefined);
    } else {
      let hjemler = filtre.reduce((a, b) => {
        return { label: `${a.label},${b.label}` };
      });
      console.log("dispatch hjemler:", hjemler.label);
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
      console.log("dispatch ytelser:", ytelser.label);
      settYtelseFilter(ytelser.label as ytelseType);
    }
  };

  return (
    <table
      className={classNames("Tabell", "tabell tabell--stripet")}
      cellSpacing={0}
      cellPadding={10}
    >
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
            filtre={[{ label: "Foreldrepenger" }, { label: "Sykepenger" }, { label: "Dagpenger" }]}
            dispatchFunc={filtrerYtelse}
            aktiveFiltere={aktiveYtelser}
          >
            Ytelse
          </FiltrerbarHeader>

          <FiltrerbarHeader
            onFilter={(filter, velgAlleEllerIngen) =>
              settFilter(settAktiveHjemler, filter, aktiveHjemler, velgAlleEllerIngen)
            }
            filtre={[{ label: "8-65" }, { label: "8-66" }, { label: "8-67" }]}
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
      <tbody>{genererTabellRader(settValgOppgave, oppgaver)}</tbody>
    </table>
  );
};

export default OppgaveTabell;
