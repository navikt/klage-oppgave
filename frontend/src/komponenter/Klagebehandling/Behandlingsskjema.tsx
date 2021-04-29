import { IKlage } from "../../tilstand/moduler/klagebehandling";
import { useSelector } from "react-redux";
import { velgKlage } from "../../tilstand/moduler/klagebehandlinger.velgere";
import React, { useState } from "react";
import { temaOversettelse } from "../../domene/forkortelser";

import styled from "styled-components";
import { Row } from "../../styled-components/Row";
import { Datepicker } from "nav-datovelger";
import { Label, Select } from "nav-frontend-skjema";
import { ISODate } from "../../domene/datofunksjoner";
import { EnhetKey, FaaGyldigEnhet } from "../../domene/enheter";

const KlageKontainer = styled.div`
  display: ${(props) => props.theme.display};
  grid-template-columns: repeat(4, 1fr);
  gap: 0.2em;
  margin: 1em 0 1em 0;

  @media (max-width: 1600px) {
    grid-template-columns: repeat(2, 1fr);
    margin: 1em 0 1em 0;
  }
`;

const Detaljer = styled.div`
  display: flex;
  justify-content: space-between;
  max-width: 25em;
`;

export interface CustomMaxWidthPercProps {
  maxWidth?: number;
}

// const MaxWidthPercContainer = styled.div<CustomMaxWidthPercProps>`
//   max-width: ${({ maxWidth = 0 }) => maxWidth + "%"};
// `;

const KlageBoks = styled.div`
  width: 100%;
  background: white;
  border-radius: 0.25em;
  margin: 0 0 0 1em;
  padding: 0.25em 1.5em;

  h1 {
    font-size: 1.25em;
    font-weight: 600;
  }
`;

interface DatoProps {
  label: string;
  dato: ISODate | null;
  settDato: (date: ISODate | null) => void;
}

function InfofeltStatisk(props: { header: string; info: string }) {
  return (
    <div>
      <b>{props.header}:</b>
      <br />
      {props.info}
    </div>
  );
}

function FraNavEnhet() {
  const klage: IKlage = useSelector(velgKlage);
  const [fraNAVEnhet, settFraNAVEnhet] = useState<EnhetKey | null>(
    FaaGyldigEnhet(klage.fraNAVEnhet)
  );

  return (
    <Select
      label="Fra NAV-enhet:"
      bredde="l"
      value={fraNAVEnhet ?? undefined}
      onChange={(e) => {
        settFraNAVEnhet(FaaGyldigEnhet(e.target.value));
      }}
    >
      <option value="">Velg enhet</option>
      <option value="4403">4403 NAY Oslo</option>
      <option value="4404">4404 NAY Hamar</option>
      <option value="4405">4405 NAY Lillehammer</option>
      <option value="4407">4407 NAY Tønsberg</option>
      <option value="0104">4408 NAY Skien</option>
    </Select>
  );
}

function Utfall() {
  const klage: IKlage = useSelector(velgKlage);
  return (
    <div className={"detaljer"}>
      <div style={{ marginTop: "1em" }}>
        <span>Utfall / resultat:</span>
        <div className={"nedtrekksboks"}>
          <select className={"input__nedtrekk"} onChange={() => {}}>
            <option value="Trukket">Trukket</option>
            <option value="Retur">Retur</option>
            <option value="Opphevet">Opphevet</option>
            <option value="Medhold">Medhold</option>
            <option value="DelvisMehold">Delvis Mehold</option>
            <option value="Oppretthold">Oppretthold</option>
            <option value="Ugunst">Ugunst (Ugyldig)</option>
            <option value="Avvist">Avvist</option>
          </select>
        </div>
      </div>
    </div>
  );
}

function HjemmelBasis() {
  const klage: IKlage = useSelector(velgKlage);
  return (
    <div className={"detaljer"}>
      <div style={{ marginTop: "1em" }}>
        <span>Utfallet er basert på lovhjemmel:</span>
        <div className={"nedtrekksboks"}>
          <select className={"input__nedtrekk"} onChange={() => {}}>
            <option value="Trukket">1-322</option>
          </select>
        </div>
      </div>
    </div>
  );
}

function OversendtKA() {
  const klage: IKlage = useSelector(velgKlage);
  console.log(klage);
  const [datoOversendtTilKA, settDatoOversendtTilKA] = useState<string | null>(
    klage.mottatt ?? null
  );

  return (
    <Dato label="Oversendt til KA:" dato={datoOversendtTilKA} settDato={settDatoOversendtTilKA} />
  );
}

function Datoer() {
  const klage: IKlage = useSelector(velgKlage);
  const [datoPaaklagetVedtak, settDatoPaaklagetVedtak] = useState<string | null>(null);
  const [datoKlageInnsendt, settDatoKlageInnsendt] = useState<string | null>(
    klage.klageInnsendtdato ?? null
  );
  const [datoMottattFoersteInstans, settDatoMottattFoersteInstans] = useState<string | null>(
    klage.mottattFoersteinstans ?? null
  );
  return (
    <div>
      <Row>
        <Dato
          label="Dato påklaget vedtak:"
          dato={datoPaaklagetVedtak}
          settDato={settDatoPaaklagetVedtak}
        />
      </Row>
      <Row>
        <Dato label="Klage innsendt:" dato={datoKlageInnsendt} settDato={settDatoKlageInnsendt} />
      </Row>
      <Row>
        <Dato
          label="Mottatt første instans:"
          dato={datoMottattFoersteInstans}
          settDato={settDatoMottattFoersteInstans}
        />
      </Row>
    </div>
  );
}

function Dato({ label, dato, settDato }: DatoProps) {
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

function Klager() {
  const klage: IKlage = useSelector(velgKlage);
  return <InfofeltStatisk header="Klager" info={klage.foedselsnummer} />;
}

function TyperTemaer() {
  const klage: IKlage = useSelector(velgKlage);
  return (
    <Detaljer>
      <div>
        <b>Type:</b>
        <ul className={"detaljliste"}>
          <li>
            <div className={"etikett etikett--type"}>{klage.type}</div>
          </li>
        </ul>
      </div>

      <div>
        <b>Tema:</b>
        <ul className={"detaljliste"}>
          <li>
            <div className={"etikett etikett--sykepenger"}>{temaOversettelse(klage.tema)}</div>
          </li>
        </ul>
      </div>

      {/* <div>
        Hjemmel:
        <ul className={"detaljliste"}>
          {klage.hjemler.length === 0 && <div>Ingen satt</div>}
          {klage.hjemler.map((hjemmel: any, idx: number) => (
            <li key={`hjemmel${idx}`}>
              <div className={"etikett etikett-Sykepenger etikett--hjemmel"}>
                {hjemmel.original || "ikke satt"}
              </div>
            </li>
          ))}
        </ul>
      </div> */}
    </Detaljer>
  );
}

export default function Behandlingsskjema({ skjult }: { skjult: boolean }) {
  return (
    <KlageKontainer theme={{ display: !skjult ? "grid" : "none" }}>
      <KlageBoks>
        <h1>Behandlingsdetaljer</h1>
        <Row>
          <Klager />
        </Row>
        <Row>
          <TyperTemaer />
        </Row>
        <Datoer />
        <Row>
          <FraNavEnhet />
        </Row>
        <Row>
          <OversendtKA />
        </Row>
      </KlageBoks>

      <KlageBoks>
        <h1>Utarbeide vedtak</h1>
        <Utfall />
        <HjemmelBasis />
      </KlageBoks>
    </KlageKontainer>
  );
}
