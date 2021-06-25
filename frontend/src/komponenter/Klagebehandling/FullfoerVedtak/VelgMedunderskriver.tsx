import React, { useEffect, useMemo } from "react";
import { Select } from "nav-frontend-skjema";
import { useAppDispatch, useAppSelector } from "../../../tilstand/konfigurerTilstand";
import { lastMedunderskrivere } from "../../../tilstand/moduler/medunderskrivere/actions";
import { velgMedunderskrivere } from "../../../tilstand/moduler/medunderskrivere/selectors";
import { velgMeg } from "../../../tilstand/moduler/meg.velgere";

interface VelgMedunderskriverProps {
  value?: string;
  onSelect: (ident: string) => void;
  tema: string;
}

export const VelgMedunderskriver = ({ value, onSelect, tema }: VelgMedunderskriverProps) => {
  const dispatch = useAppDispatch();
  const { loading, medunderskrivere } = useAppSelector(velgMedunderskrivere);
  const {
    graphData: { id },
  } = useAppSelector(velgMeg);

  useEffect(() => {
    dispatch(lastMedunderskrivere({ id, tema }));
  }, [id, tema]);

  const ingenMedunderskrivere = useMemo(() => medunderskrivere.length === 0, [medunderskrivere]);
  const disabled = useMemo(
    () => loading || ingenMedunderskrivere,
    [loading, ingenMedunderskrivere]
  );
  const defaultValgTekst = useMemo(
    () => getDefaultText(loading, ingenMedunderskrivere),
    [loading, ingenMedunderskrivere]
  );

  return (
    <Select
      style={{
        width: "100%",
      }}
      label="Medunderskriver"
      value={value}
      onChange={(e) => onSelect(e.target.value)}
      disabled={disabled}
    >
      <option key="none" value="none">
        {defaultValgTekst}
      </option>
      {medunderskrivere.map(({ ident, navn }) => (
        <option key={ident} value={ident}>
          {navn}
        </option>
      ))}
    </Select>
  );
};

const getDefaultText = (loading: boolean, ingenMedunderskrivere: boolean): string => {
  if (loading && ingenMedunderskrivere) {
    return "Laster medunderskrivere...";
  }
  if (ingenMedunderskrivere) {
    return "Kunne ikke laste medunderskrivere.";
  }
  return "Velg medunderskriver";
};
