import React from "react";

export default function KlageDokumenter() {
  return (
    <div className={"dokumenter"}>
      <div className={"wrapper"}>
        <h1>Dokumenter</h1>
        <button className={"knapp__lenke"}>Legg til/ta bort</button>
        <button className={"knapp__lenke"}>Åpne alle</button>
      </div>
      <div className={"opplysninger"}>Ingen dokumenter knyttet til klagen enda</div>
    </div>
  );
}
