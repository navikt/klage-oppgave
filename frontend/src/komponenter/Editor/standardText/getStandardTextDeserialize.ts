import { getElementDeserializer } from "@udecode/slate-plugins-common";
import { Deserialize, getSlatePluginOptions } from "@udecode/slate-plugins-core";
import { ELEMENT_STANDARD_TEXT } from "../types";

export const getStandardTextDeserialize = (): Deserialize => (editor) => {
  const options = getSlatePluginOptions(editor, ELEMENT_STANDARD_TEXT);

  return {
    element: getElementDeserializer({
      ...options.deserialize,
      type: options.type,
      rules: [{ nodeNames: "SECTION" }],
    }),
  };
};
