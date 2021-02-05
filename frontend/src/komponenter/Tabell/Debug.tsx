import React, { useEffect, useRef, useState } from "react";
import Draggable from "react-draggable";

function Debug(state: any) {
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
          textAlign: "left",
          overflowX: "hidden",
          overflowY: "scroll",
          zIndex: 1,
          border: "3px dashed #aa0000",
        }}
      >
        {JSON.stringify(state, null, 2)}
      </pre>
    </Draggable>
  );
}

export default Debug;
