import { getLeafDeserializer } from "@udecode/slate-plugins-common";
import { Deserialize, getSlatePluginOptions } from "@udecode/slate-plugins-core";
import { ELEMENT_COMMENTS } from "../types";

export const getCommentDeserialize = (): Deserialize => (editor) => {
  const options = getSlatePluginOptions(editor, ELEMENT_COMMENTS);

  return {
    leaf: getLeafDeserializer({
      type: options.type,
      rules: [{ nodeNames: ["SPAN"] }],
      ...options.deserialize,
    }),
  };
};
