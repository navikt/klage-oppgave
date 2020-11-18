import { NavLink } from "react-router-dom";
import React from "react";
import "./paginering.less";

type PagineringType = {
  startSide: number;
  antallSider: number;
  pathname: string;
};

export default ({ startSide, antallSider, pathname }: PagineringType): JSX.Element => {
  startSide = Math.floor(startSide);
  let n = startSide;
  let out = [];
  let temp = [];
  let j = 0;
  let it = 2;
  temp.push(
    <span className={"paginering_padding active"} key={`n${n}`}>
      {n}
    </span>
  );
  while (n-- > 1 && j++ < it) {
    temp.push(
      <NavLink className={"paginering_padding"} key={`n${n}`} to={`/${pathname}/${n}`}>
        {n}
      </NavLink>
    );
  }
  if (startSide > it + 1) {
    temp.push(
      <span key={"dotdot1"} className={"paginering_padding dots"}>
        ..
      </span>
    );
    temp.push(
      <NavLink className={"paginering_padding"} key={`side${1}`} to={`/${pathname}/${1}`}>
        {1}
      </NavLink>
    );
  }
  out.push(temp.reverse());
  j = 0;
  n = startSide;
  while (n++ < antallSider && j++ < it) {
    out.push(
      <NavLink className={"paginering_padding"} key={`side${n}`} to={`/${pathname}/${n}`}>
        {n}
      </NavLink>
    );
  }
  if (n < antallSider) {
    out.push(
      <span key={"dotdot2"} className={"paginering_padding dots"}>
        ...
      </span>
    );
    out.push(
      <NavLink
        className={"paginering_padding active"}
        key={`side${antallSider}`}
        to={`/${pathname}/${antallSider}`}
      >
        {antallSider}
      </NavLink>
    );
  }
  return (
    <>
      {startSide - 1 > 0 && (
        <NavLink
          data-testid={"forrige"}
          className={"pagineringslenke paginering_padding"}
          to={`/${pathname}/${startSide - 1}`}
        >
          Forrige
        </NavLink>
      )}
      {startSide - 1 == 0 && (
        <span data-testid={"forrige"} className={"inactive paginering_padding"}>
          Forrige
        </span>
      )}
      {out.map((element) => element)}
      {startSide + 1 <= antallSider && (
        <NavLink
          data-testid={"neste"}
          className={"pagineringslenke paginering_padding"}
          to={`/${pathname}/${startSide + 1}`}
        >
          Neste
        </NavLink>
      )}
      {startSide + 1 > antallSider && (
        <span data-testid={"neste"} className={"inactive paginering_padding"}>
          Neste
        </span>
      )}
    </>
  );
};
