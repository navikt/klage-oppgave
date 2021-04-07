import {
  ELEMENT_H1,
  ELEMENT_H2,
  ELEMENT_H3,
  ELEMENT_H4,
  ELEMENT_H5,
  ELEMENT_H6,
  ELEMENT_BLOCKQUOTE,
  ELEMENT_PARAGRAPH,
  ELEMENT_UL,
  ELEMENT_LI,
  ELEMENT_LIC,
  ELEMENT_TABLE,
  ELEMENT_TR,
  ELEMENT_TD,
} from "@udecode/slate-plugins";
import { TDescendant } from "@udecode/slate-plugins-core";
import { ELEMENT_STANDARD_TEXT } from "./types";

export const TEST_DATA: Template = {
  id: "template-id",
  content: [
    {
      id: "basic",
      title: "Fast tittel for vedtaksmalen",
      comments: [
        [
          {
            author: {
              id: "userId",
              name: "Testuser",
            },
            id: "123",
            text: "Kommentar",
            createdDate: "2021-04-20",
          },
        ],
      ],
      content: [
        {
          id: "klager",
          type: "text",
          label: "Klager",
        },
        {
          id: "fnr",
          type: "text",
          label: "Fødselsnummer",
        },
        {
          id: "saksnummer",
          type: "text",
          label: "Saksnummer",
        },
        {
          id: "prosess",
          type: "text",
          label: "Prosessfullmektig",
        },
        {
          id: "about",
          type: "text",
          label: "Saken gjelder",
          placeholder: "Klagen din av (dato) på (enhet) sitt vedtak av (dato).",
        },
        {
          id: "problem",
          type: "rich-text",
          label: "Problemstilling",
          placeholder: "Spørsmålet er om du (tekst) fra (dato).",
          content: [
            {
              type: ELEMENT_PARAGRAPH,
              children: [{ text: "" }],
            },
          ],
        },
      ],
    },
    {
      id: "vedtak-block",
      title: "Vedtak",
      comments: [
        [
          {
            author: {
              id: "userId",
              name: "Testuser",
            },
            id: "123",
            text: "Kommentar",
            createdDate: "2021-04-20",
          },
        ],
      ],
      content: [
        {
          id: "vedtak",
          type: "rich-text",
          content: [
            {
              type: ELEMENT_STANDARD_TEXT,
              standardText: "Dette er en standardtekst.",
              standardTextId: "id-123",
              children: [
                {
                  text: "Dette er en standardtekst.",
                },
              ],
            },
            {
              type: ELEMENT_H1,
              children: [{ text: "Tittel for vedtaket" }],
            },
            {
              type: ELEMENT_H2,
              children: [{ text: "Tittel for vedtaket" }],
            },
            {
              type: ELEMENT_H3,
              children: [{ text: "Tittel for vedtaket" }],
            },
            {
              type: ELEMENT_H4,
              children: [{ text: "Tittel for vedtaket" }],
            },
            {
              type: ELEMENT_H5,
              children: [{ text: "Tittel for vedtaket" }],
            },
            {
              type: ELEMENT_H6,
              children: [{ text: "Tittel for vedtaket" }],
            },
            {
              type: ELEMENT_BLOCKQUOTE,
              children: [{ text: "Block quote." }],
            },
            {
              type: ELEMENT_PARAGRAPH,
              children: [
                { text: "En paragraf med " },
                { text: "bold", bold: true },
                { text: " (ctrl/cmd + b), " },
                { text: "kursiv", italic: true },
                { text: " (ctrl/cmd + i), " },
                { text: "understreking", underline: true },
                { text: " (ctrl/cmd + u) og " },
                { text: "gjennomstreking", strikethrough: true },
                { text: ". Tekst med superscript" },
                { text: "superscript", superscript: true },
                { text: ". Og tekst med subscript" },
                { text: "subscript", subscript: true },
                { text: "." },
              ],
            },
            {
              type: ELEMENT_UL,
              children: [
                {
                  type: ELEMENT_LI,
                  children: [
                    {
                      type: ELEMENT_LIC,
                      children: [{ text: "Punkt 1" }],
                    },
                  ],
                },
                {
                  type: ELEMENT_LI,
                  children: [
                    {
                      type: ELEMENT_LIC,
                      children: [{ text: "Punkt 2" }],
                    },
                  ],
                },
                {
                  type: ELEMENT_LI,
                  children: [
                    {
                      type: ELEMENT_LIC,
                      children: [{ text: "Punkt 3" }],
                    },
                  ],
                },
              ],
            },
            {
              type: ELEMENT_TABLE,
              children: [
                {
                  type: ELEMENT_TR,
                  children: [
                    {
                      type: ELEMENT_TD,
                      children: [{ text: "test" }],
                    },
                    {
                      type: ELEMENT_TD,
                      children: [{ text: "test" }],
                    },
                    {
                      type: ELEMENT_TD,
                      children: [{ text: "test" }],
                    },
                  ],
                },
                {
                  type: ELEMENT_TR,
                  children: [
                    {
                      type: ELEMENT_TD,
                      children: [{ text: "test" }],
                    },
                    {
                      type: ELEMENT_TD,
                      children: [{ text: "test" }],
                    },
                    {
                      type: ELEMENT_TD,
                      children: [{ text: "test" }],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};

export type UUID = string;

export interface CommentData {
  id: UUID;
  author: {
    id: UUID;
    name: string;
  };
  text: string;
  createdDate: string;
}

export type CommentThreadsData = CommentData[][];

export interface RichText {
  id: UUID;
  label?: string | null;
  type: "rich-text";
  content: TDescendant[];
  placeholder?: string;
}

export interface Text {
  id: UUID;
  label: string;
  type: "text";
  content?: string;
  placeholder?: string;
}

export type Content = RichText | Text;

export interface Block {
  id: UUID;
  title: string | null;
  comments: CommentThreadsData;
  content: Content[];
}

export interface Template {
  id: UUID;
  content: Block[];
}
