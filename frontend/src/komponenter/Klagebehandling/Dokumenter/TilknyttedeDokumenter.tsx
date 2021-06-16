import React from "react";
import { formattedDate } from "../../../domene/datofunksjoner";
import { IDokument } from "../../../tilstand/moduler/dokumenter/stateTypes";
import {
  DokumenterMinivisning,
  Tilknyttet,
  TilknyttetDato,
  TilknyttetTittel,
} from "./styled-components/styled-components";

interface TilknyttedeDokumenterProps {
  dokumenter: IDokument[];
  skjult: boolean;
  settDokument: (dokument: IDokument) => void;
}

export const TilknyttedeDokumenter = ({
  dokumenter,
  skjult,
  settDokument,
}: TilknyttedeDokumenterProps) => {
  if (skjult) {
    return null;
  }

  return (
    <DokumenterMinivisning>
      {dokumenter.map((dokument) => {
        return (
          <Tilknyttet key={dokument.journalpostId + dokument.dokumentInfoId}>
            <TilknyttetDato>{formattedDate(dokument.registrert)}</TilknyttetDato>
            <TilknyttetTittel
              onClick={() => dokument.harTilgangTilArkivvariant && settDokument(dokument)}
            >
              {dokument.tittel}
            </TilknyttetTittel>
          </Tilknyttet>
        );
      })}
    </DokumenterMinivisning>
  );
};
