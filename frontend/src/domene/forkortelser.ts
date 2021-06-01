import { useSelector } from "react-redux";
import { IKodeverkVerdi } from "../tilstand/moduler/kodeverk";
import { velgKodeverk } from "../tilstand/moduler/oppgave.velgere";

export const temaOversettelse = (temaId?: string | null): string => {
  const kodeverk = useSelector(velgKodeverk);
  if (kodeverk.tema && typeof temaId === "string") {
    return kodeverk.tema.find((t: IKodeverkVerdi) => t.id == temaId)?.navn ?? "";
  }
  return "";
};

export const typeOversettelse = (typeId?: string | null): string => {
  const kodeverk = useSelector(velgKodeverk);
  if (kodeverk.type && typeof typeId === "string") {
    return kodeverk.type.find((t: IKodeverkVerdi) => t.id == typeId)?.navn ?? "";
  }
  return "";
};
