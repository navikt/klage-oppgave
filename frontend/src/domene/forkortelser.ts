import { useSelector } from "react-redux";
import { IKodeverkVerdi } from "../tilstand/moduler/kodeverk";
import { velgKodeverk } from "../tilstand/moduler/kodeverk.velgere";

export const temaOversettelse = (temaId?: string | null): string => {
  const kodeverk = useSelector(velgKodeverk);
  if (kodeverk.kodeverk.tema && typeof temaId === "string") {
    return kodeverk.kodeverk.tema.find((t: IKodeverkVerdi) => t.id == temaId)?.navn ?? "";
  }
  return "";
};

export const typeOversettelse = (typeId?: string | null): string => {
  const kodeverk = useSelector(velgKodeverk);
  if (kodeverk.kodeverk.type && typeof typeId === "string") {
    return kodeverk.kodeverk.type.find((t: IKodeverkVerdi) => t.id == typeId)?.navn ?? "";
  }
  return "";
};
