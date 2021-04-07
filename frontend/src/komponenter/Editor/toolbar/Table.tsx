import React from "react";
import { BorderAll } from "@styled-icons/material/BorderAll";
import { BorderBottom } from "@styled-icons/material/BorderBottom";
import { BorderClear } from "@styled-icons/material/BorderClear";
import { BorderLeft } from "@styled-icons/material/BorderLeft";
import { BorderRight } from "@styled-icons/material/BorderRight";
import { BorderTop } from "@styled-icons/material/BorderTop";
import {
  addColumn,
  addRow,
  deleteColumn,
  deleteRow,
  deleteTable,
  insertTable,
  ToolbarTable,
} from "@udecode/slate-plugins";
import { getToolbarTooltip } from "./Tooltip";

export const ToolbarButtonsTable = () => (
  <>
    <ToolbarTable
      icon={<BorderAll />}
      transform={insertTable}
      tooltip={getToolbarTooltip("Sett inn tabell")}
    />
    <ToolbarTable
      icon={<BorderClear />}
      transform={deleteTable}
      tooltip={getToolbarTooltip("Slett tabell")}
    />
    <ToolbarTable
      icon={<BorderBottom />}
      transform={addRow}
      tooltip={getToolbarTooltip("Legg til rad")}
    />
    <ToolbarTable
      icon={<BorderTop />}
      transform={deleteRow}
      tooltip={getToolbarTooltip("Slett rad")}
    />
    <ToolbarTable
      icon={<BorderLeft />}
      transform={addColumn}
      tooltip={getToolbarTooltip("Legg til kolonne")}
    />
    <ToolbarTable
      icon={<BorderRight />}
      transform={deleteColumn}
      tooltip={getToolbarTooltip("Slett kolonne")}
    />
  </>
);
