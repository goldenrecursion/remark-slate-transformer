import { GoldenNode } from "./plugins/remark-to-golden-slate";
export declare const unreachable: (_: never) => never;
type CiteIDMapFunction = (id: number) => Promise<number>;
export declare const mapGoldenSlateCiteIDs: (nodes: GoldenNode[], mapFunction: CiteIDMapFunction) => Promise<GoldenNode[]>;
export {};
