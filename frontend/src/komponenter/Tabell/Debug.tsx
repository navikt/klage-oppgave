import React, { useEffect, useRef, useState } from "react";
import Draggable from "react-draggable";

function Debug(state: any, dispatch: Function) {
  const nodeRef = React.useRef(null);
  return (
    <Draggable defaultPosition={{ x: 50, y: 0 }} nodeRef={nodeRef}>
      <pre
        ref={nodeRef}
        style={{
          position: "fixed",
          background: "white",
          height: "80vh",
          padding: 10,
          width: "40%",
          overflowX: "hidden",
          overflowY: "scroll",
          zIndex: 1,
          border: "3px dashed #aa0000",
        }}
      >
        {JSON.stringify(state, null, 2)}
        <button
          onClick={() =>
            dispatch({
              type: "sett_frist",
              payload:
                state?.transformasjoner?.sortering?.frist === "stigende" ? "synkende" : "stigende",
            })
          }
        >
          frist
        </button>
        <button
          onClick={() =>
            dispatch({
              type: "sett_projeksjon",
              payload: state?.projeksjon === "UTVIDET" ? undefined : "UTVIDET",
            })
          }
        >
          sett projeksjon
        </button>
        <button onClick={() => dispatch({ type: "hent_oppgaver" })}>hent oppgaver</button>
      </pre>
    </Draggable>
  );
}

export default Debug;
