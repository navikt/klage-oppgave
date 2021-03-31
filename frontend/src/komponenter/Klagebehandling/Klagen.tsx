import { IKlage } from "../../tilstand/moduler/klagebehandling";
import { useSelector } from "react-redux";
import { velgKlage } from "../../tilstand/moduler/klagebehandlinger.velgere";
//@ts-ignore
import ExtLink from "../extlink.svg";
import React from "react";
import { temaOversettelse } from "../../domene/forkortelser";

// @ts-ignore
import Kalender from "../../komponenter/kalender.svg";

function FraNavEnhet() {
  const klage: IKlage = useSelector(velgKlage);
  return (
    <div className={"detaljer"}>
      <div style={{ marginTop: "1em" }}>
        <span>Fra NAV-enhet:</span>
        <div className={"nedtrekksboks"}>
          <input
            type={"text"}
            className={"input__dato"}
            placeholder={"NAV-enhet"}
            value={klage.fraNAVEnhet}
            onChange={() => {}}
          />
        </div>
      </div>
    </div>
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
  return (
    <div className={"detaljer maxw95"}>
      <div style={{ marginTop: "1em" }}>
        <span>Oversendt til KA: </span>
        <div className={"input__med_ikon"}>
          <span className={"ikon__bg"}>
            <img alt="Kalender-ikon" src={Kalender} />
          </span>
          <input
            type={"text"}
            className={"input__dato"}
            placeholder={"DD.MM.ÅÅÅÅ"}
            value={klage.klageInnsendtdato || ""}
            onChange={() => {}}
          />
        </div>
      </div>
    </div>
  );
}

function Sjekkliste() {
  const klage: IKlage = useSelector(velgKlage);
  return (
    <div className={"detaljer maxw95 flex-col"}>
      <div style={{ marginTop: "1em" }}>
        <div className={"checkbox__med_label"}>
          <label htmlFor={"formkrav"}>Vurdert formkrav</label>
          <input type={"checkbox"} id={"formkrav"} className={"input__checkbox"} />
        </div>
      </div>
      <div style={{ marginTop: "1em" }}>
        <div className={"checkbox__med_label"}>
          <label htmlFor={"utfall"}>Konkludert utfall med hjemmel </label>
          <input type={"checkbox"} id={"utfall"} className={"input__checkbox"} />
        </div>
      </div>
      <div style={{ marginTop: "1em" }}>
        <div className={"checkbox__med_label"}>
          <label htmlFor={"ferdigform"}>Ferdig formulert vedtaksbrev</label>
          <input type={"checkbox"} id={"ferdigform"} className={"input__checkbox"} />
        </div>
      </div>

      <div style={{ marginTop: "1em" }}>
        <div className={"checkbox__med_label"}>
          <label htmlFor={"utfyltvur"}>Utfylt kvalitetsvurdering</label>
          <input type={"checkbox"} id={"utfyltvur"} className={"input__checkbox"} />
        </div>
      </div>

      <div style={{ marginTop: "1em" }}>
        <div className={"checkbox__med_label"}>
          <label htmlFor={"godkjent"}>Godkjent av medunderskriver</label>
          <input type={"checkbox"} id={"godkjent"} disabled={true} className={"input__checkbox"} />
        </div>
      </div>

      <div style={{ marginTop: "1em" }}>
        <button disabled={true} className={"input__submit"}>
          Fullfør behandling
        </button>
      </div>
    </div>
  );
}

function Datoer() {
  const klage: IKlage = useSelector(velgKlage);
  return (
    <div className={"detaljer maxw95"}>
      <div style={{ marginTop: "1em" }}>
        <span>Dato påklaget vedtak:</span>
        <div className={"input__med_ikon"}>
          <span className={"ikon__bg"}>
            <img alt="Kalender-ikon" src={Kalender} />
          </span>
          <input type={"text"} className={"input__dato"} placeholder={"DD.MM.ÅÅÅÅ"} />
        </div>
      </div>

      <div style={{ marginTop: "1em" }}>
        <span>Klage innsendt:</span>
        <div className={"input__med_ikon"}>
          <span className={"ikon__bg"}>
            <img alt="Kalender-ikon" src={Kalender} />
          </span>
          <input type={"text"} className={"input__dato"} placeholder={"DD.MM.ÅÅÅÅ"} />
        </div>
      </div>
      <div style={{ marginTop: "1em" }}>
        <span>Mottatt første instans:</span>
        <div className={"input__med_ikon"}>
          <span className={"ikon__bg"}>
            <img alt="Kalender-ikon" src={Kalender} />
          </span>
          <input type={"text"} className={"input__dato"} placeholder={"DD.MM.ÅÅÅÅ"} />
        </div>
      </div>
    </div>
  );
}

function TyperTemaerOgHjemler() {
  const klage: IKlage = useSelector(velgKlage);
  return (
    <div className={"detaljer maxw80"}>
      <div>
        Type:
        <ul className={"detaljliste"}>
          <li>
            <div className={"etikett etikett--type"}>{klage.sakstype}</div>
          </li>
        </ul>
      </div>

      <div>
        Tema:
        <ul className={"detaljliste"}>
          <li>
            <div className={"etikett etikett--sykepenger"}>{temaOversettelse(klage.tema)}</div>
          </li>
        </ul>
      </div>

      <div>
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
      </div>
    </div>
  );
}

export default function Klagen() {
  return (
    <div className={"klage_og_detaljer"}>
      <div className={"klagebehandling_grid"}>
        <div className={"grid1"}></div>
      </div>
    </div>
  );
}
