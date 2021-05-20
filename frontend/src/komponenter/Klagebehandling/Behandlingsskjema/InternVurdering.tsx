import React from "react";
import { Textarea } from "nav-frontend-skjema";

interface InterfaceInternVurderingProps {
  internVurdering: string;
  // endreInternVurdering: (internVurdering: string) => void;
  settInternVurdering: (internVurdering: string) => void;
}

export function InternVurdering({
  internVurdering,
  settInternVurdering,
}: InterfaceInternVurderingProps) {
  return (
    <Textarea
      id="internVurdering"
      value={internVurdering ?? ""}
      label="Vurdering av kvalitet for intern bruk:"
      maxLength={0}
      onChange={(e) => {
        settInternVurdering(e.target.value);
      }}
      style={{
        minHeight: "80px",
      }}
    />
  );
}
