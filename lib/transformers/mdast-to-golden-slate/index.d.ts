import type * as slate from "../../models/slate";
import type * as mdast from "../../models/mdast";
export type Decoration = Readonly<{
    [key in (mdast.Emphasis | mdast.Strong | mdast.Delete | mdast.InlineCode)["type"]]?: true;
}>;
export type OverridedMdastBuilders = {
    [key in mdast.Content["type"]]?: MdastBuilder<key>;
} & ({
    [key: string]: MdastBuilder<typeof key>;
} | {});
export type MdastBuilder<T extends string> = (node: T extends mdast.Content["type"] ? Extract<mdast.Content, {
    type: T;
}> : unknown, next: (children: any[]) => any) => object | undefined;
export declare const mdastToGoldenSlate: (node: mdast.Root, overrides: OverridedMdastBuilders) => slate.Node[];
export type Paragraph = ReturnType<typeof buildParagraph>;
declare const buildParagraph: ({ type, children }: mdast.Paragraph, deco: Decoration, overrides: OverridedMdastBuilders) => {
    type: "paragraph";
    children: slate.Node[];
};
export type Heading = ReturnType<typeof buildHeading>;
declare const buildHeading: ({ children, depth }: mdast.Heading, deco: Decoration, overrides: OverridedMdastBuilders) => {
    type: string;
    children: slate.Node[];
};
export type Text = ReturnType<typeof buildText>;
declare const buildText: (text: string, deco: Decoration) => {
    text: string;
    emphasis?: true;
    strong?: true;
    delete?: true;
    inlineCode?: true;
};
export type Link = ReturnType<typeof buildLink>;
declare const buildLink: ({ children, url }: mdast.Link, deco: Decoration, overrides: OverridedMdastBuilders) => {
    type: string;
    children: slate.Node[];
    href?: string;
    id?: number;
};
export type SlateNode = Paragraph | Heading | Text | Link;
export {};
