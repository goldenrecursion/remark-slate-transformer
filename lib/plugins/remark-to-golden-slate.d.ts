import type { Plugin } from "unified";
import type * as mdast from "../models/mdast";
import type * as slate from "../models/slate";
type Row = {
    entity: unknown;
    value: any;
    index: number;
} & Record<string, unknown>;
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
    links?: {
        name: string;
        id: number;
    }[];
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
export declare const BLOCK: {
    readonly p: "paragraph";
    readonly h1: "heading";
    readonly h2: "subheading";
    readonly h3: "subheading2";
    readonly ul: "bulleted-list";
    readonly ol: "numbered-list";
    readonly li: "list-item";
    readonly img: "image";
    readonly video: "video";
    readonly table: "table";
    readonly entitytable: "entity-table";
    readonly math: "math";
    readonly code: "code";
    readonly blockquote: "block-quote";
    readonly queryView: "query-view";
    readonly listView: "list-view";
    readonly linkBlock: "link-block";
};
export declare const INLINE: {
    readonly a: "link";
    readonly internalLink: "internal-link";
    readonly cite: "cite";
    readonly mathInline: "math-inline";
};
export declare const MARK: {
    readonly em: "italic";
    readonly strong: "bold";
    readonly u: "underline";
    readonly superScript: "superscript";
    readonly subScript: "subscript";
};
export declare const BLOCK_TYPES: ("paragraph" | "heading" | "table" | "code" | "math" | "image" | "subheading" | "subheading2" | "bulleted-list" | "numbered-list" | "list-item" | "video" | "entity-table" | "block-quote" | "query-view" | "list-view" | "link-block")[];
declare const plugin: Plugin<[], mdast.Root, slate.Node[]>;
export default plugin;
