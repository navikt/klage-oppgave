import EtikettBase from "nav-frontend-etiketter";
import React, { useCallback, useMemo, useState } from "react";
import styled from "styled-components";
import { IKodeverkVerdi } from "../../../../tilstand/moduler/kodeverk";
import { Filter } from "../../../../tilstand/moduler/oppgave";
import { isNotUndefined } from "../../utils/helpers";
import { useKanEndre } from "../../utils/hooks";
import { MultipleChoiceHeader } from "./MultipleChoiceHeader";

interface BasertPaaHjemmelProps {
  gyldigeHjemler: IKodeverkVerdi[];
  defaultValue: IKodeverkVerdi[];
  onChange: (hjemler: IKodeverkVerdi[]) => void;
}

const Etikettliste = styled.div`
  display: flex;
  flex-flow: row;
  flex-wrap: wrap;
  justify-content: start;
  > * {
    margin: 3px 10px 3px 0;
  }
`;

export function forkortet(hjemmel: string): string {
  const paragrafPos = hjemmel.indexOf("§");
  return paragrafPos !== -1 ? hjemmel.slice(paragrafPos) : hjemmel;
}

export function BasertPaaHjemmel({
  gyldigeHjemler,
  defaultValue,
  onChange,
}: BasertPaaHjemmelProps) {
  const [valgteHjemler, settValgteHjemler] = useState<IKodeverkVerdi[]>(defaultValue);
  const kanEndre = useKanEndre();

  const hjemmelTagsDisplay = useMemo(() => {
    if (gyldigeHjemler.length === 0) {
      return "Ingen hjemler under valgt tema";
    }
    if (valgteHjemler.length === 0) {
      return "Velg hjemmel";
    }
    return (
      <Etikettliste>
        {valgteHjemler
          .map((hjemmel) => forkortet(hjemmel.beskrivelse))
          .sort(
            (a: string, b: string) =>
              Number.parseInt(a.replace(/[§-]/g, ""), 10) -
              Number.parseInt(b.replace(/[§-]/g, ""), 10)
          )
          .map((hjemmelTag) => (
            <EtikettBase key={hjemmelTag} type="info" className={`etikett-type`}>
              {forkortet(hjemmelTag)}
            </EtikettBase>
          ))}
      </Etikettliste>
    );
  }, [gyldigeHjemler.length, valgteHjemler.length, valgteHjemler]);

  const valgMuligheter = useMemo<Filter[]>(
    () => gyldigeHjemler.map(({ id, beskrivelse }) => ({ label: beskrivelse, value: id })),
    [gyldigeHjemler]
  );

  const valgteMulighet = useMemo<Filter[]>(
    () => valgteHjemler.map(({ id, beskrivelse }) => ({ label: beskrivelse, value: id })),
    [valgteHjemler]
  );

  const onSelect = useCallback((hjemler: Filter[]) => {
    const valgte = hjemler
      .map(({ value }) => gyldigeHjemler.find(({ id }) => id === value))
      .filter(isNotUndefined);

    settValgteHjemler(valgte);
    onChange(valgte);
  }, []);

  return (
    <div>
      <MultipleChoiceHeader
        label="Utfallet er basert på lovhjemmel:"
        valgmuligheter={valgMuligheter}
        onSelect={onSelect}
        defaultValgte={valgteMulighet}
        disabled={!kanEndre}
      >
        {hjemmelTagsDisplay}
      </MultipleChoiceHeader>
    </div>
  );
}
