import { GoldenNode } from "./plugins/remark-to-golden-slate";

export const unreachable = (_: never): never => {
  throw new Error("unreachable");
};

type CiteIDMapFunction = (id: number) => Promise<number>;

const mapGoldenNodeCiteID = async (
  node: GoldenNode,
  mapFunction: CiteIDMapFunction
): Promise<GoldenNode> => {
  if (node.type === "cite" && node.data.id) {
    return {
      ...node,
      data: {
        ...node.data,
        id: await mapFunction(node.data.id),
      },
    };
  }

  if (node.nodes) {
    return {
      ...node,
      nodes: await mapGoldenSlateCiteIDs(
        node.nodes as GoldenNode[],
        mapFunction
      ),
    };
  }

  return node;
};

export const mapGoldenSlateCiteIDs = async (
  nodes: GoldenNode[],
  mapFunction: CiteIDMapFunction
): Promise<GoldenNode[]> => {
  return await Promise.all(
    nodes.map(async (node) => await mapGoldenNodeCiteID(node, mapFunction))
  );
};
