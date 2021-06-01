import { useSelector } from "react-redux";
import { IKodeverkVerdi } from "../tilstand/moduler/oppgave";
import { velgKodeverk } from "../tilstand/moduler/oppgave.velgere";

export const temaOversettelse = (temaId: string): string => {
  const kodeverk = useSelector(velgKodeverk);
  if (kodeverk.tema) {
    return kodeverk.tema.find((t: IKodeverkVerdi) => t.id == temaId)?.navn ?? "";
  }
  return "";
};

export const typeOversettelse = (typeId: string): string => {
  const kodeverk = useSelector(velgKodeverk);
  if (kodeverk.type) {
    return kodeverk.type.find((t: IKodeverkVerdi) => t.id == typeId)?.navn ?? "";
  }
  return "";
};
