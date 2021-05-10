import { SlatePlugin } from "@udecode/slate-plugins-core";
import { options } from "../pluginOptions";
import { ELEMENT_STANDARD_TEXT } from "../types";
import { getStandardTextDeserialize } from "./getStandardTextDeserialize";

export const createStandardTextPlugin = (): SlatePlugin => ({
  pluginKeys: ELEMENT_STANDARD_TEXT,
  inlineTypes: () => [ELEMENT_STANDARD_TEXT],
  renderElement: () => options[ELEMENT_STANDARD_TEXT].component,
  deserialize: getStandardTextDeserialize(),
});
