import React, { useCallback, useMemo, useState } from "react";
import { SlatePlugin, SPEditor } from "@udecode/slate-plugins-core";
import { BaseSelection } from "slate";
import { getStandardTextDeserialize } from "./getStandardTextDeserialize";
import { ELEMENT_STANDARD_TEXT, StandardTextData } from "../types";
import { insertStandardText } from "./insertStandardText";
import { components } from "../components";

interface StandardTextPluginOptions {
  standardTexts?: StandardTextData[];
  // Character triggering the standard text select
  trigger?: string;
  // Maximum number of suggestions
  maxSuggestions?: number;
  // Function to match standard texts for a given search
  filter?: (search: string) => (standardText: StandardTextData) => boolean;
  pattern?: string;
}

export interface GetStandardTextSelectProps {
  // List of standard texts
  options: StandardTextData[];
  // Callback called when clicking on an option
  onSelect: (editor: SPEditor, option: StandardTextData, selection: BaseSelection) => void;
  query: string;
  onQueryChange: (query: string) => void;
  isOpen: boolean;
  close: () => void;
}

// Enables support for finding and inserting standard texts.
export const useStandardTextPlugin = ({
  standardTexts = [],
  maxSuggestions = 10,
  filter: standardTextFilter = (search: string) => (c) =>
    c.standardText.toLowerCase().includes(search.toLowerCase()),
}: StandardTextPluginOptions = {}): {
  plugin: SlatePlugin;
  getStandardTextSelectProps: () => GetStandardTextSelectProps;
  toggleStandardTextUi: () => boolean;
} => {
  const [isOpen, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const values = useMemo(
    () => standardTexts.filter(standardTextFilter(query)).slice(0, maxSuggestions),
    [maxSuggestions, standardTextFilter, standardTexts, query]
  );

  return {
    plugin: useMemo(
      (): SlatePlugin => ({
        pluginKeys: ELEMENT_STANDARD_TEXT,
        renderElement: () => ({ attributes, ...props }) => {
          if (props.element.type === ELEMENT_STANDARD_TEXT) {
            const Element = components[ELEMENT_STANDARD_TEXT];
            return <Element attributes={attributes} {...props} />;
          }
        },
        deserialize: getStandardTextDeserialize(),
      }),
      []
    ),

    getStandardTextSelectProps: useCallback<() => GetStandardTextSelectProps>(
      () => ({
        options: values,
        isOpen,
        query,
        onSelect: insertStandardText,
        onQueryChange: setQuery,
        close: () => setOpen(false),
      }),
      [setQuery, query, isOpen, values]
    ),
    toggleStandardTextUi: () => {
      setOpen(!isOpen);
      return isOpen;
    },
  };
};
