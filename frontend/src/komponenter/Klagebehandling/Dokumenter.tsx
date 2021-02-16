import {
  hentDokumentAlleHandling,
  hentDokumentTilordnedeHandling,
  IKlage,
  lasterDokumenter,
  nullstillDokumenter,
  tilordneDokumenterHandling,
} from "../../tilstand/moduler/klagebehandling";
import { useDispatch, useSelector } from "react-redux";
import { velgKlage } from "../../tilstand/moduler/klagebehandlinger.velgere";
import React, { useEffect, useState } from "react";
import NavFrontendSpinner from "nav-frontend-spinner";
import { formattedDate } from "../../domene/datofunksjoner";

export default function Dokumenter() {
  const [aktivtDokument, settaktivtDokument] = useState(0);

  return (
    <div className={"dokument-wrapper"}>
      <DokumentTabell settaktivtDokument={settaktivtDokument} />
      <div className={"preview"}>Forhåndsvisning {aktivtDokument > 0 && aktivtDokument}</div>
    </div>
  );
}

function DokumentTabell(props: { settaktivtDokument: Function }) {
  const dispatch = useDispatch();
  const klage: IKlage = useSelector(velgKlage);
  const { settaktivtDokument } = props;

  function hentNeste(ref: string | null) {
    dispatch(lasterDokumenter(false));
    dispatch(hentDokumentAlleHandling({ id: klage.id, ref: ref ?? null, antall: 10 }));
  }
  useEffect(() => {
    dispatch(nullstillDokumenter());
    dispatch(hentDokumentAlleHandling({ id: klage.id, ref: null, antall: 10 }));
    dispatch(hentDokumentTilordnedeHandling({ id: klage.id }));
  }, []);

  function hentForrige(ref: string | null) {
    dispatch(lasterDokumenter(false));
    dispatch(
      hentDokumentAlleHandling({
        id: klage.id,
        ref: ref ?? null,
        antall: 10,
        historyNavigate: true,
      })
    );
  }

  function tilordneDokument(behandlingId: string, journalpostId: string) {
    dispatch(tilordneDokumenterHandling({ id: behandlingId, journalpostId }));
  }

  if (!klage.dokumenter || !klage.dokumenterAlleHentet) {
    return <NavFrontendSpinner />;
  }
  return (
    <div>
      <table className={"dokument-tabell"} cellPadding={0} cellSpacing={0}>
        <thead>
          <tr>
            <th />
            <th>Dokumentbeskrivelse</th>
            <th>Tema</th>
            <th>Registrert</th>
          </tr>
        </thead>
        <tbody>
          {klage.dokumenter.map((dokument: any, idx: number) => (
            <tr
              key={`${idx}_${dokument.dokumentInfoId}`}
              onClick={() => settaktivtDokument(dokument.dokumentInfoId)}
            >
              <td>
                <input
                  type={"checkbox"}
                  onClick={() => tilordneDokument(klage.id, dokument.journalpostId)}
                />
              </td>
              <td>
                <button
                  onClick={() => settaktivtDokument(dokument.dokumentInfoId)}
                  className={"knapp__lenke"}
                >
                  {dokument.tittel}
                </button>
              </td>
              <td>
                <div
                  className={`etikett etikett--mw etikett--info etikett--${dokument.tema
                    .split(" ")[0]
                    .toLowerCase()}`}
                >
                  {dokument.tema}
                </div>
              </td>
              <td className={"liten"}>{formattedDate(dokument.registrert)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className={"dokument-tabell__paginator"}>
        <button
          className={"knapp__lenke"}
          onClick={() => hentForrige(klage.pageRefs[klage.pageIdx - 2])}
          disabled={klage.pageIdx === 0}
        >
          Forrige
        </button>
        <button
          className={"knapp__lenke"}
          onClick={() => hentNeste(klage.pageReference)}
          disabled={!klage.pageReference}
        >
          Neste
        </button>
      </div>
    </div>
  );
}
