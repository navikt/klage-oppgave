import * as React from "react";
import useInfiniteScroll from "react-infinite-scroll-hook";
import styled from "styled-components";
import {
  hentDokumentAlleHandling,
  hentPreviewHandling,
  IKlage,
  lasterDokumenter,
} from "../../tilstand/moduler/klagebehandling";
import { useDispatch, useSelector } from "react-redux";
import { velgKlage } from "../../tilstand/moduler/klagebehandlinger.velgere";

interface Item {
  key: number;
  value: string;
}

const List = styled.ul`
  list-style: none;
  font-size: 16px;
  margin: 0;
  padding: 6px;
`;

const ListItem = styled.li`
  background-color: #fafafa;
  border: 1px solid #99b4c0;
  padding: 8px;
  margin: 4px;
`;

const ARRAY_SIZE = 20;
const RESPONSE_TIME = 1000;

function loadItems(prevArray: Item[] = [], startCursor = 0): Promise<Item[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      let newArray = prevArray;

      for (let i = startCursor; i < startCursor + ARRAY_SIZE; i++) {
        const newItem = {
          key: i,
          value: `This is item ${i}`,
        };
        newArray = [...newArray, newItem];
      }

      resolve(newArray);
    }, RESPONSE_TIME);
  });
}

function UendeligListe({ scrollContainer }: { scrollContainer: any }) {
  const [loading, setLoading] = React.useState(false);
  const [items, setItems] = React.useState<Item[]>([]);
  const klage: IKlage = useSelector(velgKlage);
  const dispatch = useDispatch();

  function hentNeste(ref: string | null) {
    //dispatch(lasterDokumenter(false));
    dispatch(hentDokumentAlleHandling({ id: klage.id, ref: ref ?? null, antall: 10 }));
  }

  function handleLoadMore() {
    setLoading(true);
    hentNeste(klage.pageReference);

    loadItems(items, items.length).then((newArray) => {
      setLoading(false);
      setItems(newArray);
    });
  }

  const infiniteRef = useInfiniteScroll<HTMLUListElement>({
    loading,
    hasNextPage: klage.hasMore && !loading,
    onLoadMore: handleLoadMore,
    scrollContainer,
  });
  return (
    <List ref={infiniteRef}>
      {klage.pageReference}
      {klage.dokumenter.map((dokument: any, idx: number) => (
        <ListItem key={dokument.journalpostId + idx}>
          {dokument.journalpostId} {dokument.tema} {dokument.tittel} {dokument.registrert}
        </ListItem>
      ))}
      {loading && <ListItem>Loading...</ListItem>}
    </List>
  );
}

export default UendeligListe;
