import { NavLink } from "react-router-dom";
import React from "react";
import "./paginering.less";

type PagineringType = {
  startSide: number;
  antallSider: number;
};

export default ({ startSide, antallSider }: PagineringType): JSX.Element => {
  let n = startSide;
  let out = [];
  let temp = [];
  let j = 0;
  let it = 2;
  temp.push(
    <span className={"pagpad active"} key={`n${n}`}>
      {n}
    </span>
  );
  while (n-- > 1 && j++ < it) {
    temp.push(
      <NavLink className={"pagpad"} key={`n${n}`} to={`/saker/${n}`}>
        {n}
      </NavLink>
    );
  }
  if (startSide > it + 1) {
    temp.push(
      <span key={"dotdot1"} className={"pagpad dots"}>
        ..
      </span>
    );
    temp.push(
      <NavLink className={"pagpad"} key={`side${1}`} to={`/saker/${1}`}>
        {1}
      </NavLink>
    );
  }
  out.push(temp.reverse());
  j = 0;
  n = startSide;
  while (n++ < antallSider && j++ < it) {
    out.push(
      <NavLink className={"pagpad"} key={`side${n}`} to={`/saker/${n}`}>
        {n}
      </NavLink>
    );
  }
  if (n < antallSider) {
    out.push(
      <span key={"dotdot2"} className={"pagpad dots"}>
        ...
      </span>
    );
    out.push(
      <NavLink className={"pagpad active"} key={`side${antallSider}`} to={`/saker/${antallSider}`}>
        {antallSider}
      </NavLink>
    );
  }
  return (
    <>
      {startSide - 1 > 0 && (
        <NavLink
          data-testid={"forrige"}
          className={"pagineringslenke pagpad"}
          to={`/saker/${startSide - 1}`}
        >
          Forrige side
        </NavLink>
      )}
      {startSide - 1 == 0 && (
        <span data-testid={"forrige"} className={"inactive pagpad"}>
          Forrige side
        </span>
      )}
      {out.map((element) => element)}
      {startSide + 1 < antallSider && (
        <NavLink
          data-testid={"neste"}
          className={"pagineringslenke pagpad"}
          to={`/saker/${startSide + 1}`}
        >
          Neste side
        </NavLink>
      )}
      {startSide + 1 >= antallSider && (
        <span data-testid={"neste"} className={"inactive pagpad"}>
          Neste side
        </span>
      )}
    </>
  );
};
