import type * as slate from "../../models/slate";
import type * as mdast from "../../models/mdast";

export type Decoration = Readonly<{
  [key in (
    | mdast.Emphasis
    | mdast.Strong
    | mdast.Delete
    | mdast.InlineCode
  )["type"]]?: true;
}>;

export type OverridedMdastBuilders = {
  [key in mdast.Content["type"]]?: MdastBuilder<key>;
} & ({ [key: string]: MdastBuilder<typeof key> } | {});

export type MdastBuilder<T extends string> = (
  node: T extends mdast.Content["type"]
    ? Extract<mdast.Content, { type: T }>
    : unknown,
  next: (children: any[]) => any
) => object | undefined;

export const mdastToGoldenSlate = (
  node: mdast.Root,
  overrides: OverridedMdastBuilders
): slate.Node[] => {
  return buildSlateRoot(node, overrides);
};

const buildSlateRoot = (
  root: mdast.Root,
  overrides: OverridedMdastBuilders
): slate.Node[] => {
  return convertNodes(root.children, {}, overrides);
};

const convertNodes = (
  nodes: mdast.Content[],
  deco: Decoration,
  overrides: OverridedMdastBuilders
): slate.Node[] => {
  return nodes.reduce<slate.Node[]>((acc, node) => {
    acc.push(...buildSlateNode(node, deco, overrides));
    return acc;
  }, []);
};

const emptyParagraph = {
  type: "paragraph",
  children: [{ text: "" }],
};

const buildSlateNode = (
  node: mdast.Content,
  deco: Decoration,
  overrides: OverridedMdastBuilders
): slate.Node[] => {
  const customNode = overrides[node.type]?.(node as any, (children) =>
    convertNodes(children, deco, overrides)
  );
  if (customNode != null) {
    return [customNode as slate.Node];
  }

  switch (node.type) {
    case "paragraph":
      return [buildParagraph(node, deco, overrides), emptyParagraph];
    case "heading":
      return [buildHeading(node, deco, overrides)];
    case "text":
      return [buildText(node.value, deco)];
    case "link":
      return buildLink(node, deco, overrides);
    default:
      return [];
  }
};

const buildParagraph = (
  { type, children }: mdast.Paragraph,
  deco: Decoration,
  overrides: OverridedMdastBuilders
) => {
  return {
    type,
    children: convertNodes(children, deco, overrides),
  };
};

const buildHeading = (
  { children, depth }: mdast.Heading,
  deco: Decoration,
  overrides: OverridedMdastBuilders
) => {
  const typeByDepth = {
    1: "heading",
    2: "heading",
    3: "subheading",
    4: "subheading2",
    5: "paragraph",
    6: "paragraph",
  };
  return {
    type: typeByDepth[depth],
    children: convertNodes(children, deco, overrides),
  };
};

const buildText = (text: string, deco: Decoration) => {
  return {
    ...deco,
    text,
  };
};

const getTextFromNode = (
  node: { text: string } | { children: slate.Node[] }
): string => {
  if ("text" in node) {
    return node.text;
  }

  return node.children.reduce((text, child) => {
    return (
      text +
      getTextFromNode(child as { text: string } | { children: slate.Node[] })
    );
  }, "");
};

const buildLink = (
  mdNode: mdast.Link,
  deco: Decoration,
  overrides: OverridedMdastBuilders
) => {
  const children = convertNodes(mdNode.children, deco, overrides);
  const text = getTextFromNode({children})
  const match = /^\((?<id>\d+)\)$/g.exec(text);
  if (match?.groups?.["id"]) {
    return [{
      type: "cite",
      children: [{ text: "" }],
      id: Number.parseInt(match?.groups?.["id"]),
    }]
  } else {
    return children
  }
};
