import { useEffect, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "../../../tilstand/konfigurerTilstand";
import { lagreKlagebehandling } from "../../../tilstand/moduler/klagebehandling/actions";
import {
  velgKlagebehandling,
  velgKlagebehandlingOpptatt,
  velgLagretKlagebehandlingVersjon,
} from "../../../tilstand/moduler/klagebehandling/selectors";
import {
  IKlagebehandling,
  TilknyttetDokument,
} from "../../../tilstand/moduler/klagebehandling/stateTypes";
import { IKlagebehandlingOppdatering } from "../../../tilstand/moduler/klagebehandling/types";
import { velgMeg } from "../../../tilstand/moduler/meg.velgere";
import { dokumentMatcher } from "../Dokumenter/helpers";
import { arrayEquals } from "./helpers";

export const useKlagebehandlingUpdater = ({
  id,
  klagebehandlingVersjon,
  internVurdering,
  vedtak,
  tilknyttedeDokumenter,
}: IKlagebehandling) => {
  const dispatch = useAppDispatch();
  const opptatt = useAppSelector(velgKlagebehandlingOpptatt);

  const update = useGetUpdate();

  useEffect(() => {
    if (opptatt || update === null) {
      return;
    }

    const timeout = setTimeout(() => dispatch(lagreKlagebehandling(update)), 200);
    return () => clearTimeout(timeout); // Clear existing timer every time it runs.
  }, [opptatt, klagebehandlingVersjon, id, internVurdering, vedtak, tilknyttedeDokumenter]);
};

export const useKanEndre = () => {
  const klagebehandling = useAppSelector(velgKlagebehandling);
  const meg = useAppSelector(velgMeg);
  return useMemo(
    () =>
      klagebehandling?.tildeltSaksbehandlerident === meg.graphData.id &&
      klagebehandling?.avsluttetAvSaksbehandler === null,
    [
      klagebehandling?.tildeltSaksbehandlerident,
      klagebehandling?.avsluttetAvSaksbehandler,
      meg.graphData.id,
    ]
  );
};

export const useGetUpdate = () => {
  const kanEndre = useKanEndre();
  const klagebehandling = useAppSelector(velgKlagebehandling);
  const lagretVersjon = useAppSelector(velgLagretKlagebehandlingVersjon);

  const update = useMemo<IKlagebehandlingOppdatering | null>(() => {
    if (!kanEndre) {
      return null;
    }
    const oppdatering: IKlagebehandlingOppdatering | null =
      klagebehandling === null
        ? null
        : createOppdatering({ ...klagebehandling, klagebehandlingId: klagebehandling.id });
    return isEqual(oppdatering, lagretVersjon) ? null : oppdatering;
  }, [klagebehandling, lagretVersjon, kanEndre]);

  return update;
};

export const useIsSaved = () => useGetUpdate() === null;

export const isEqual = (
  a: IKlagebehandlingOppdatering | null,
  b: IKlagebehandlingOppdatering | null
): boolean => {
  if (a === b) {
    return true;
  }
  if (a === null || b === null) {
    return false;
  }
  return (
    a.internVurdering === b.internVurdering &&
    a.klagebehandlingId === b.klagebehandlingId &&
    a.klagebehandlingVersjon === b.klagebehandlingVersjon &&
    a.vedtak[0].grunn === b.vedtak[0].grunn &&
    a.vedtak[0].utfall === b.vedtak[0].utfall &&
    arrayEquals(a.vedtak[0].hjemler, b.vedtak[0].hjemler) &&
    compareTilknyttedeDokumenter(a.tilknyttedeDokumenter, b.tilknyttedeDokumenter)
  );
};

const compareTilknyttedeDokumenter = (a: TilknyttetDokument[], b: TilknyttetDokument[]) =>
  a.length === b.length && a.every((t1) => b.some((t2) => dokumentMatcher(t1, t2)));

const createOppdatering = ({
  internVurdering,
  klagebehandlingId,
  klagebehandlingVersjon,
  tilknyttedeDokumenter,
  vedtak,
}: IKlagebehandlingOppdatering): IKlagebehandlingOppdatering => ({
  internVurdering,
  klagebehandlingId,
  klagebehandlingVersjon,
  tilknyttedeDokumenter,
  vedtak,
});
