import type { Plugin } from "unified";
import type * as mdast from "../models/mdast";
import type * as slate from "../models/slate";
import { mdastToGoldenSlate } from "../transformers/mdast-to-golden-slate";

type Row = { entity: unknown; value: any; index: number } & Record<
  string,
  unknown
>;

type Column = {
  key: string;
} & Record<string, unknown>;

type CustomElement = {
  type: (typeof BLOCK_TYPES)[number];
  src?: string;
  data?: {
    title?: string;
    heading?: string;
    math?: string;
  };
  columns?: Column[];
  rows?: Row[];
  title?: string;
  maxRowCount?: number;
  query?: unknown | null;
  tableId?: string;
  heading?: string;
  children: (CustomElement | CustomText)[];
  inserted?: true;
  deleted?: true;
  id?: number;
  start?: number;
  links?: { name: string; id: number }[];
  position?: "left" | "center" | "right";
  width?: number;
  height?: number;
  href?: string;
  videoType?: "youtube" | "vimeo";
  math?: string;
  listId?: string;
};

type CustomText = {
  type?: undefined;
  children?: undefined;
  text: string;
  italic?: true;
  bold?: true;
  underline?: true;
  superscript?: true;
  subscript?: true;
  inserted?: true;
  deleted?: true;
};

export type GoldenNode = {
  object: "inline" | "block";
  kind?: string;
  type: string;
  data: Omit<CustomElement, "type" | "children">;
  nodes: (GoldenNode | GoldenTextNode)[];
  inserted?: boolean;
  deleted?: boolean;
};

type GoldenTextNode = {
  object: "text";
  leaves: Array<{
    object: "leaf";
    text: string;
    marks: {
      object: "mark";
      type: string;
      data: any;
    }[];
  }>;
};

export const BLOCK = {
  p: "paragraph",
  h1: "heading",
  h2: "subheading",
  h3: "subheading2",
  ul: "bulleted-list",
  ol: "numbered-list",
  li: "list-item",
  img: "image",
  video: "video",
  table: "table",
  entitytable: "entity-table",
  math: "math",
  code: "code",
  blockquote: "block-quote",
  queryView: "query-view",
  listView: "list-view",
  linkBlock: "link-block",
} as const;
export const INLINE = {
  a: "link",
  internalLink: "internal-link",
  cite: "cite",
  mathInline: "math-inline",
} as const;
export const MARK = {
  em: "italic",
  strong: "bold",
  u: "underline",
  superScript: "superscript",
  subScript: "subscript",
} as const;
export const BLOCK_TYPES = Object.values(BLOCK);

const childToGolden = (node: CustomElement): GoldenNode => {
  const { type, children, ...data } = node;
  const newNode: GoldenNode = {
    object: BLOCK_TYPES.includes(type) ? "block" : "inline",
    type,
    nodes: children?.reduce((arr, child) => {
      if ("children" in child) {
        arr.push(childToGolden(child as CustomElement));
      } else {
        const lastNode = arr[arr.length - 1];
        const { text, ...marks } = child as CustomText;

        const leaves: GoldenTextNode["leaves"][number][] = [
          {
            object: "leaf",
            text,
            marks: Object.keys(marks).map((type) => ({
              object: "mark",
              type,
              data: {},
            })),
          },
        ];

        if (lastNode && "leaves" in lastNode) {
          // merge neighboring text nodes
          lastNode.leaves.push(...leaves);
        } else {
          arr.push({
            object: "text",
            leaves,
          });
        }
      }
      return arr;
    }, [] as Array<GoldenNode | GoldenTextNode>),
    data,
  };
  return newNode;
};

const plugin: Plugin<[], mdast.Root, slate.Node[]> = function () {
  this.Compiler = function (node) {
    return mdastToGoldenSlate(node, {}).map((child) =>
      childToGolden(child as CustomElement)
    );
  };
};
export default plugin;
