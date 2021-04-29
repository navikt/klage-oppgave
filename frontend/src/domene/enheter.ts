export enum EnhetKey {
  ENHET_4403 = "4403",
  ENHET_4404 = "4404",
  ENHET_4405 = "4405",
  ENHET_4406 = "4406",
  ENHET_0104 = "0104",
}

export enum EnhetName {
  ENHET_4403 = "4403 NAY Oslo",
  ENHET_4404 = "4403 NAY Hamar",
  ENHET_4405 = "4403 NAY Lillehammer",
  ENHET_4406 = "4403 NAY Tønsberg",
  ENHET_0104 = "4403 NAY Skien",
}

export const ENHET_KEYS = Object.values(EnhetKey);

export const FaaGyldigEnhet = (potensiellEnhetStreng: string | null): EnhetKey | null => {
  if (potensiellEnhetStreng === null) {
    return null;
  }
  return ENHET_KEYS.find((enhetKey) => enhetKey === potensiellEnhetStreng) ?? null;
};

export const FaaEnhetNavn = (enhetKey: EnhetKey): string | null => {
  const gyldigEnhetKey = FaaGyldigEnhet(enhetKey);
  if (gyldigEnhetKey === null) {
    return null;
  }
  return EnhetName["ENHET_" + gyldigEnhetKey];
};
