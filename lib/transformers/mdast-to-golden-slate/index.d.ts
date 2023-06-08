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
