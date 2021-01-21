import React from "react";

function Debug(state: any, dispatch: Function) {
  return (
    <>
      <pre
        style={{
          position: "fixed",
          background: "white",
          height: "80vh",
          padding: 10,
          width: "40%",
          overflowX: "hidden",
          overflowY: "scroll",
          zIndex: 0,
          right: 0,
          top: "5%",
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
    </>
  );
}
export default Debug;
