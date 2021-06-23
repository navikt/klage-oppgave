import { useCallback, useState } from "react";
import { debounce } from "lodash";

export const useDebounce = (obj: any = null, wait: number = 1000) => {
  const [state, setState] = useState(obj);

  const setDebouncedState = (_val: any) => {
    debounceInner(_val);
  };

  const debounceInner = useCallback(
    debounce((_prop: string) => {
      setState(_prop);
    }, wait),
    []
  );

  return [state, setDebouncedState];
};
