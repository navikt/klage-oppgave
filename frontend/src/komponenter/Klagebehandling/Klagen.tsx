import { IKlage } from "../../tilstand/moduler/klagebehandling";
import { useSelector } from "react-redux";
import { velgKlage } from "../../tilstand/moduler/klagebehandlinger.velgere";
//@ts-ignore
import ExtLink from "../extlink.svg";
import KlageDokumenter from "./KlageDokumenter";
import React from "react";

export default function Klagen() {
  const klage: IKlage = useSelector(velgKlage);

  return (
    <div className={"klage_og_detaljer"}>
      <div className={"klagen"}>
        <h1>Behandlingsopplysninger</h1>
        <div className={"opplysninger"}>
          <div>Klage Innsendt:</div>
          <div className={"data"}>{klage.klageInnsendtdato || "N/A"}</div>
        </div>
        <div className={"opplysninger"}>
          <div>Fra NAV-enhet</div>
          <div className={"data"}>{klage.fraNAVEnhet}</div>
        </div>
        <div className={"opplysninger"}>
          <div>Mottatt første instans</div>
          <div className={"data"}>{klage.mottattFoersteinstans || "N/A"}</div>
        </div>

        <div className={"opplysninger"}>
          <div>Oversendt til KA</div>
          <div className={"data"}>N/A</div>
        </div>

        <div className={"opplysninger"}>
          <div>Klage basert på sak</div>
          <div className={"data"}>
            <a
              target="_blank"
              aria-label={"Ekstern lenke til Gosys for denne personen"}
              href={`/gosys/personoversikt/fnr=`}
            >
              SAKSNR (N/A)
            </a>
            <a
              target="_blank"
              aria-label={"Ekstern lenke til Gosys for denne personen"}
              href={`/gosys/personoversikt/fnr=`}
              className="pl"
            >
              <img alt="Ekstern lenke" src={ExtLink} />
            </a>
          </div>
        </div>

        <KlageDokumenter />
      </div>

      <div className={"oversendingsdetaljer"}>
        <h3>Oversendingsdetaljer</h3>
        <div className={"detaljer"}>
          <div>
            Tema:
            <ul className={"detaljliste"}>
              <li>
                <div className={"etikett etikett-Sykepenger etikett--info"}>{klage.tema}</div>
              </li>
            </ul>
          </div>

          <div>
            Type:
            <ul className={"detaljliste"}>
              <li>
                <div className={"etikett etikett-Sykepenger etikett--type"}>{klage.sakstype}</div>
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
                    {hjemmel.original}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
