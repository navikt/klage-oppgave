import {
  BlockquoteElement,
  ELEMENT_ALIGN_CENTER,
  ELEMENT_ALIGN_JUSTIFY,
  ELEMENT_ALIGN_LEFT,
  ELEMENT_ALIGN_RIGHT,
  ELEMENT_BLOCKQUOTE,
  ELEMENT_H1,
  ELEMENT_H2,
  ELEMENT_H3,
  ELEMENT_H4,
  ELEMENT_H5,
  ELEMENT_H6,
  ELEMENT_LI,
  ELEMENT_OL,
  ELEMENT_PARAGRAPH,
  ELEMENT_TABLE,
  ELEMENT_TD,
  ELEMENT_TH,
  ELEMENT_TR,
  ELEMENT_UL,
  MARK_BOLD,
  MARK_HIGHLIGHT,
  MARK_ITALIC,
  MARK_SEARCH_HIGHLIGHT,
  MARK_STRIKETHROUGH,
  MARK_SUBSCRIPT,
  MARK_SUPERSCRIPT,
  MARK_UNDERLINE,
  StyledElement,
  StyledLeaf,
  TableElement,
  withProps,
} from "@udecode/slate-plugins";
import { ELEMENT_COMMENTS, ELEMENT_STANDARD_TEXT } from "./types";

export const components = {
  // [ELEMENT_COMMENTS]: withProps(StyledElement, {
  //   as: "span",
  //   styles: {
  //     root: {
  //       backgroundColor: "red",
  //     },
  //   },
  // }),
  [ELEMENT_STANDARD_TEXT]: withProps(StyledElement, {
    as: "p",
    styles: {
      root: {
        margin: 0,
        padding: "1em",
        marginLeft: "-1em",
        marginRight: "-1em",
        borderLeft: "1px solid red",
      },
    },
  }),
  [ELEMENT_ALIGN_CENTER]: withProps(StyledElement, {
    styles: {
      root: {
        textAlign: "center",
      },
    },
  }),
  [ELEMENT_ALIGN_JUSTIFY]: withProps(StyledElement, {
    styles: {
      root: {
        textAlign: "justify",
      },
    },
  }),
  [ELEMENT_ALIGN_LEFT]: withProps(StyledElement, {
    styles: {
      root: {
        textAlign: "left",
      },
    },
  }),
  [ELEMENT_ALIGN_RIGHT]: withProps(StyledElement, {
    styles: {
      root: {
        textAlign: "right",
      },
    },
  }),
  [ELEMENT_BLOCKQUOTE]: BlockquoteElement,
  [ELEMENT_H1]: withProps(StyledElement, { as: "h1", styles: { root: { fontSize: "2.75em" } } }),
  [ELEMENT_H2]: withProps(StyledElement, { as: "h2", styles: { root: { fontSize: "2.5em" } } }),
  [ELEMENT_H3]: withProps(StyledElement, { as: "h3", styles: { root: { fontSize: "2.25em" } } }),
  [ELEMENT_H4]: withProps(StyledElement, { as: "h4", styles: { root: { fontSize: "2em" } } }),
  [ELEMENT_H5]: withProps(StyledElement, { as: "h5", styles: { root: { fontSize: "1.75em" } } }),
  [ELEMENT_H6]: withProps(StyledElement, { as: "h6", styles: { root: { fontSize: "1.5em" } } }),
  [ELEMENT_UL]: withProps(StyledElement, { as: "ul" }),
  [ELEMENT_OL]: withProps(StyledElement, { as: "ol" }),
  [ELEMENT_LI]: withProps(StyledElement, { as: "li" }),
  [ELEMENT_PARAGRAPH]: withProps(StyledElement, { as: "p" }),
  [ELEMENT_TABLE]: withProps(TableElement, {
    styles: {
      root: {
        width: "auto",
      },
    },
  }),
  [ELEMENT_TD]: withProps(StyledElement, {
    as: "td",
    styles: {
      root: {
        border: "1px solid black",
        padding: ".5em",
      },
    },
  }),
  [ELEMENT_TH]: withProps(StyledElement, { as: "th" }),
  [ELEMENT_TR]: withProps(StyledElement, { as: "tr" }),
  [MARK_HIGHLIGHT]: withProps(StyledLeaf, {
    as: "mark",
    styles: {
      root: {
        backgroundColor: "#FEF3B7",
      },
    },
  }),
  [MARK_SEARCH_HIGHLIGHT]: withProps(StyledLeaf, {
    as: "span",
    styles: {
      root: {
        backgroundColor: "#fff59d",
      },
    },
  }),
  [MARK_BOLD]: withProps(StyledLeaf, { as: "strong" }),
  [MARK_ITALIC]: withProps(StyledLeaf, { as: "em" }),
  [MARK_UNDERLINE]: withProps(StyledLeaf, { as: "u" }),
  [MARK_STRIKETHROUGH]: withProps(StyledLeaf, { as: "s" }),
  [MARK_SUBSCRIPT]: withProps(StyledLeaf, { as: "sub" }),
  [MARK_SUPERSCRIPT]: withProps(StyledLeaf, { as: "sup" }),
};
