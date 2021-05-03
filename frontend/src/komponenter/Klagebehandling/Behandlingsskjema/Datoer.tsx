import { Datepicker } from "nav-datovelger";
import { Label } from "nav-frontend-skjema";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { ISODate } from "../../../domene/datofunksjoner";
import { Row } from "../../../styled-components/Row";
import { IKlage } from "../../../tilstand/moduler/klagebehandling";
import { velgKlage } from "../../../tilstand/moduler/klagebehandlinger.velgere";

export function Datoer() {
  const klage: IKlage = useSelector(velgKlage);
  const [datoPaaklagetVedtak, settDatoPaaklagetVedtak] = useState<string | null>(null);
  const [datoKlageInnsendt, settDatoKlageInnsendt] = useState<string | null>(
    klage.klageInnsendtdato ?? null
  );
  const [datoMottattFoersteInstans, settDatoMottattFoersteInstans] = useState<string | null>(
    klage.mottattFoersteinstans ?? null
  );
  return (
    <Dato
      label="Mottatt første instans:"
      dato={datoMottattFoersteInstans}
      settDato={settDatoMottattFoersteInstans}
    />
  );
}

export function Dato({ label, dato, settDato }: DatoProps) {
  return (
    <div>
      <Label htmlFor="vedtaksdato">{label}</Label>
      <Datepicker
        onChange={(dateISO, isValid) => settDato(isValid ? dateISO : null)}
        value={dato ?? undefined}
        showYearSelector
        limitations={{
          maxDate: new Date().toISOString().substring(0, 10),
        }}
        inputId={label}
        locale="nb"
      />
    </div>
  );
}

interface DatoProps {
  label: string;
  dato: ISODate | null;
  settDato: (date: ISODate | null) => void;
}
