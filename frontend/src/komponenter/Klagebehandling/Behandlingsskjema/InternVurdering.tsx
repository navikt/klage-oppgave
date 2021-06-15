import React, { useState } from "react";
import { Textarea } from "nav-frontend-skjema";
import { useKanEndre } from "../utils/useKlagebehandlingUpdater";

interface InterfaceInternVurderingProps {
  defaultValue: string;
  onChange: Function;
}

export function InternVurdering({ defaultValue, onChange }: InterfaceInternVurderingProps) {
  const [internVurdering, settInternVurdering] = useState<string>(defaultValue);
  const kanEndre = useKanEndre();

  return (
    <Textarea
      data-testid="internVurdering"
      id="internVurdering"
      value={internVurdering}
      label="Vurdering av kvalitet for intern bruk:"
      maxLength={0}
      onChange={(e) => {
        settInternVurdering(e.target.value);
        onChange(e.target.value);
      }}
      style={{
        minHeight: "80px",
      }}
      readOnly={!kanEndre}
    />
  );
}
