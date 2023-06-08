import { describe, it, expect } from "@jest/globals";
import fs from "fs";
import path from "path";
import { unified } from "unified";
import markdown from "remark-parse";
import gfm from "remark-gfm";
import footnotes from "remark-footnotes";
import frontmatter from "remark-frontmatter";
import math from "remark-math";
import stringify from "remark-stringify";
import {
  remarkToSlate,
  slateToRemark,
  remarkToSlateLegacy,
  slateToRemarkLegacy,
  remarkToGoldenSlate,
  mapGoldenSlateCiteIDs,
} from ".";
import { Value } from "slate_legacy";
import { GoldenNode } from "./plugins/remark-to-golden-slate";

const FIXTURE_PATH = "../fixtures";

describe("e2e", () => {
  const toSlateProcessor = unified()
    .use(markdown)
    .use(gfm)
    .use(footnotes, { inlineNotes: true })
    .use(frontmatter, ["yaml", "toml"])
    .use(math)
    .use(remarkToSlate);
  const toRemarkProcessor = unified()
    .use(slateToRemark)
    .use(gfm)
    .use(footnotes, { inlineNotes: true })
    .use(frontmatter, ["yaml", "toml"])
    .use(math)
    .use(stringify, { bullet: "-", emphasis: "_" });

  const fixturesDir = path.join(__dirname, FIXTURE_PATH);
  const filenames = fs.readdirSync(fixturesDir);
  filenames.forEach((filename) => {
    it(filename, () => {
      const slateNodes = toSlateProcessor.processSync(
        fs.readFileSync(path.join(fixturesDir, filename))
      ).result;
      expect(slateNodes).toMatchSnapshot();

      const mdastTree = toRemarkProcessor.runSync({
        type: "root",
        children: slateNodes,
      });
      expect(mdastTree).toMatchSnapshot();

      const text = toRemarkProcessor.stringify(mdastTree);
      expect(text).toMatchSnapshot();
    });
  });
});

describe("e2e legacy", () => {
  const toSlateProcessor = unified()
    .use(markdown)
    .use(gfm)
    .use(footnotes, { inlineNotes: true })
    .use(frontmatter, ["yaml", "toml"])
    .use(math)
    .use(remarkToSlateLegacy);
  const toRemarkProcessor = unified()
    .use(slateToRemarkLegacy)
    .use(gfm)
    .use(footnotes, { inlineNotes: true })
    .use(frontmatter, ["yaml", "toml"])
    .use(math)
    .use(stringify, { bullet: "-", emphasis: "_" });

  const fixturesDir = path.join(__dirname, FIXTURE_PATH);
  const filenames = fs.readdirSync(fixturesDir);
  filenames.forEach((filename) => {
    it(filename, () => {
      const value: any = toSlateProcessor.processSync(
        fs.readFileSync(path.join(fixturesDir, filename))
      ).result;
      expect(value).toMatchSnapshot();
      expect(Value.fromJSON(value)).toMatchSnapshot();

      const mdastTree = toRemarkProcessor.runSync({
        type: "root",
        children: value.document.nodes,
      } as any);
      expect(mdastTree).toMatchSnapshot();

      const text = toRemarkProcessor.stringify(mdastTree);
      expect(text).toMatchSnapshot();
    });
  });
});

describe("options", () => {
  it("override builders", () => {
    const mdText = `
  - AAAA
    - BBBB
  - CCCC
    `;
    const toSlateProcessor = unified()
      .use(markdown)
      .use(remarkToSlate, {
        overrides: {
          list: (node, next) => ({
            type: "foo",
            children: next(node.children),
          }),
          text: (node) => ({ type: "bar", bar: node.value }),
        },
      });
    const toRemarkProcessor = unified()
      .use(slateToRemark, {
        overrides: {
          foo: (node: any, next) => ({
            type: "list",
            children: next(node.children),
          }),
          bar: (node: any) => ({ type: "text", value: node.bar }),
        },
      })
      .use(stringify, { bullet: "-" });
    const slateTree = toSlateProcessor.processSync(mdText).result;
    expect(slateTree).toMatchSnapshot();
    const mdastTree = toRemarkProcessor.runSync({
      type: "root",
      children: slateTree,
    });
    expect(mdastTree).toMatchSnapshot();
    const text = toRemarkProcessor.stringify(mdastTree);
    expect(text).toMatchSnapshot();
  });
});

describe("issues", () => {
  it("issue42", () => {
    const mdText = `
- list
  - list
- list
- list
- 
  `;
    const toSlateProcessor = unified().use(markdown).use(remarkToSlate);
    const toRemarkProcessor = unified()
      .use(slateToRemark)
      .use(stringify, { bullet: "-" });
    const slateTree = toSlateProcessor.processSync(mdText).result;
    expect(slateTree).toMatchSnapshot();
    const mdastTree = toRemarkProcessor.runSync({
      type: "root",
      children: slateTree,
    });
    const text = toRemarkProcessor.stringify(mdastTree);
    expect(text).toMatchSnapshot();
  });

  it("issue44", () => {
    const slateNodes = [
      {
        type: "paragraph",
        children: [
          {
            text: "Naoki Urasawa is a ",
          },
          {
            text: "Japanese ",
            strong: true,
          },
          {
            text: "manga artist and musician. He has been ",
          },
          {
            emphasis: true,
            text: "drawing ",
          },
          {
            text: "manga since he ",
          },
          {
            strong: true,
            text: " was",
          },
          {
            text: " four years old, and for most of his career has created two series simultaneously. ",
          },
          {
            strong: true,
            text: "So there ",
          },
        ],
      },
    ];
    const toSlateProcessor = unified().use(markdown).use(remarkToSlate);
    const toRemarkProcessor = unified()
      .use(slateToRemark)
      .use(stringify, { emphasis: "*" });
    const mdastTree = toRemarkProcessor.runSync({
      type: "root",
      children: slateNodes,
    });
    expect(mdastTree).toMatchSnapshot();
    const text = toRemarkProcessor.stringify(mdastTree);
    expect(text).toMatchSnapshot();
    const slateTree = toSlateProcessor.processSync(text).result;
    expect(slateTree).toMatchSnapshot();
  });

  it("issue90", () => {
    const slateNodes = [
      {
        type: "paragraph",
        children: [
          {
            text: "Italic",
            strong: true,
            emphasis: true,
          },
          {
            strong: true,
            text: " in a bold paragraph",
          },
        ],
      },
      {
        type: "paragraph",
        children: [
          {
            strong: true,
            text: "This is an ",
          },
          {
            text: "Italic",
            strong: true,
            emphasis: true,
          },
          {
            strong: true,
            text: " in a bold paragraph",
          },
        ],
      },
    ];
    const toSlateProcessor = unified().use(markdown).use(remarkToSlate);
    const toRemarkProcessor = unified()
      .use(slateToRemark)
      .use(stringify, { emphasis: "*" });
    const mdastTree = toRemarkProcessor.runSync({
      type: "root",
      children: slateNodes,
    });
    expect(mdastTree).toMatchSnapshot();
    const text = toRemarkProcessor.stringify(mdastTree);
    expect(text).toMatchSnapshot();
    const slateTree = toSlateProcessor.processSync(text).result;
    expect(slateTree).toMatchSnapshot();
  });

  it("issue129", () => {
    const toSlateProcessor = unified().use(markdown).use(remarkToSlate);
    const slateTree = toSlateProcessor.processSync("").result;
    expect(slateTree).toMatchSnapshot();
    const slateTreeWithSpace = toSlateProcessor.processSync(" ").result;
    expect(slateTreeWithSpace).toMatchSnapshot();
  });
});

describe("slate to Golden slate", () => {
  const md = ` ## Overview

Phone.com is a company that specializes in providing VoIP, video conferencing, and [telecommunications](https://foo.com) services to small- and medium-sized enterprises [(15319178)](#industry) [(15319179)](#industry). Founded in 2007 by Ari Rabban and Michael Mann [(22888559)](#founded_date) [(74313877)](#founder) [(74313885)](#founder), the company is currently active and operates with a B2C business model [(73385379)](#is_a) [(14483190)](#company_operating_status) [(14536555)](#b2x).`;
  const slate = [
    {
      object: "block",
      type: "heading",
      nodes: [
        {
          object: "text",
          leaves: [
            {
              object: "leaf",
              text: "Overview",
              marks: [],
            },
          ],
        },
      ],
      data: {},
    },
    {
      object: "block",
      type: "paragraph",
      nodes: [
        {
          object: "text",
          leaves: [
            {
              object: "leaf",
              text: "Phone.com is a company that specializes in providing VoIP, video conferencing, and telecommunications services to small- and medium-sized enterprises ",
              marks: [],
            },
          ],
        },
        {
          object: "inline",
          type: "cite",
          nodes: [
            {
              object: "text",
              leaves: [
                {
                  object: "leaf",
                  text: "",
                  marks: [],
                },
              ],
            },
          ],
          data: {
            id: 15319178,
          },
        },
        {
          object: "text",
          leaves: [
            {
              object: "leaf",
              text: " ",
              marks: [],
            },
          ],
        },
        {
          object: "inline",
          type: "cite",
          nodes: [
            {
              object: "text",
              leaves: [
                {
                  object: "leaf",
                  text: "",
                  marks: [],
                },
              ],
            },
          ],
          data: {
            id: 15319179,
          },
        },
        {
          object: "text",
          leaves: [
            {
              object: "leaf",
              text: ". Founded in 2007 by Ari Rabban and Michael Mann ",
              marks: [],
            },
          ],
        },
        {
          object: "inline",
          type: "cite",
          nodes: [
            {
              object: "text",
              leaves: [
                {
                  object: "leaf",
                  text: "",
                  marks: [],
                },
              ],
            },
          ],
          data: {
            id: 22888559,
          },
        },
        {
          object: "text",
          leaves: [
            {
              object: "leaf",
              text: " ",
              marks: [],
            },
          ],
        },
        {
          object: "inline",
          type: "cite",
          nodes: [
            {
              object: "text",
              leaves: [
                {
                  object: "leaf",
                  text: "",
                  marks: [],
                },
              ],
            },
          ],
          data: {
            id: 74313877,
          },
        },
        {
          object: "text",
          leaves: [
            {
              object: "leaf",
              text: " ",
              marks: [],
            },
          ],
        },
        {
          object: "inline",
          type: "cite",
          nodes: [
            {
              object: "text",
              leaves: [
                {
                  object: "leaf",
                  text: "",
                  marks: [],
                },
              ],
            },
          ],
          data: {
            id: 74313885,
          },
        },
        {
          object: "text",
          leaves: [
            {
              object: "leaf",
              text: ", the company is currently active and operates with a B2C business model ",
              marks: [],
            },
          ],
        },
        {
          object: "inline",
          type: "cite",
          nodes: [
            {
              object: "text",
              leaves: [
                {
                  object: "leaf",
                  text: "",
                  marks: [],
                },
              ],
            },
          ],
          data: {
            id: 73385379,
          },
        },
        {
          object: "text",
          leaves: [
            {
              object: "leaf",
              text: " ",
              marks: [],
            },
          ],
        },
        {
          object: "inline",
          type: "cite",
          nodes: [
            {
              object: "text",
              leaves: [
                {
                  object: "leaf",
                  text: "",
                  marks: [],
                },
              ],
            },
          ],
          data: {
            id: 14483190,
          },
        },
        {
          object: "text",
          leaves: [
            {
              object: "leaf",
              text: " ",
              marks: [],
            },
          ],
        },
        {
          object: "inline",
          type: "cite",
          nodes: [
            {
              object: "text",
              leaves: [
                {
                  object: "leaf",
                  text: "",
                  marks: [],
                },
              ],
            },
          ],
          data: {
            id: 14536555,
          },
        },
        {
          object: "text",
          leaves: [
            {
              object: "leaf",
              text: ".",
              marks: [],
            },
          ],
        },
      ],
      data: {},
    },
    {
      object: "block",
      type: "paragraph",
      nodes: [
        {
          object: "text",
          leaves: [
            {
              object: "leaf",
              text: "",
              marks: [],
            },
          ],
        },
      ],
      data: {},
    },
  ];
  const slateWithMappedCites = [
    {
      object: "block",
      type: "heading",
      nodes: [
        {
          object: "text",
          leaves: [
            {
              object: "leaf",
              text: "Overview",
              marks: [],
            },
          ],
        },
      ],
      data: {},
    },
    {
      object: "block",
      type: "paragraph",
      nodes: [
        {
          object: "text",
          leaves: [
            {
              object: "leaf",
              text: "Phone.com is a company that specializes in providing VoIP, video conferencing, and telecommunications services to small- and medium-sized enterprises ",
              marks: [],
            },
          ],
        },
        {
          object: "inline",
          type: "cite",
          nodes: [
            {
              object: "text",
              leaves: [
                {
                  object: "leaf",
                  text: "",
                  marks: [],
                },
              ],
            },
          ],
          data: {
            id: 1,
          },
        },
        {
          object: "text",
          leaves: [
            {
              object: "leaf",
              text: " ",
              marks: [],
            },
          ],
        },
        {
          object: "inline",
          type: "cite",
          nodes: [
            {
              object: "text",
              leaves: [
                {
                  object: "leaf",
                  text: "",
                  marks: [],
                },
              ],
            },
          ],
          data: {
            id: 1,
          },
        },
        {
          object: "text",
          leaves: [
            {
              object: "leaf",
              text: ". Founded in 2007 by Ari Rabban and Michael Mann ",
              marks: [],
            },
          ],
        },
        {
          object: "inline",
          type: "cite",
          nodes: [
            {
              object: "text",
              leaves: [
                {
                  object: "leaf",
                  text: "",
                  marks: [],
                },
              ],
            },
          ],
          data: {
            id: 1,
          },
        },
        {
          object: "text",
          leaves: [
            {
              object: "leaf",
              text: " ",
              marks: [],
            },
          ],
        },
        {
          object: "inline",
          type: "cite",
          nodes: [
            {
              object: "text",
              leaves: [
                {
                  object: "leaf",
                  text: "",
                  marks: [],
                },
              ],
            },
          ],
          data: {
            id: 1,
          },
        },
        {
          object: "text",
          leaves: [
            {
              object: "leaf",
              text: " ",
              marks: [],
            },
          ],
        },
        {
          object: "inline",
          type: "cite",
          nodes: [
            {
              object: "text",
              leaves: [
                {
                  object: "leaf",
                  text: "",
                  marks: [],
                },
              ],
            },
          ],
          data: {
            id: 1,
          },
        },
        {
          object: "text",
          leaves: [
            {
              object: "leaf",
              text: ", the company is currently active and operates with a B2C business model ",
              marks: [],
            },
          ],
        },
        {
          object: "inline",
          type: "cite",
          nodes: [
            {
              object: "text",
              leaves: [
                {
                  object: "leaf",
                  text: "",
                  marks: [],
                },
              ],
            },
          ],
          data: {
            id: 1,
          },
        },
        {
          object: "text",
          leaves: [
            {
              object: "leaf",
              text: " ",
              marks: [],
            },
          ],
        },
        {
          object: "inline",
          type: "cite",
          nodes: [
            {
              object: "text",
              leaves: [
                {
                  object: "leaf",
                  text: "",
                  marks: [],
                },
              ],
            },
          ],
          data: {
            id: 1,
          },
        },
        {
          object: "text",
          leaves: [
            {
              object: "leaf",
              text: " ",
              marks: [],
            },
          ],
        },
        {
          object: "inline",
          type: "cite",
          nodes: [
            {
              object: "text",
              leaves: [
                {
                  object: "leaf",
                  text: "",
                  marks: [],
                },
              ],
            },
          ],
          data: {
            id: 1,
          },
        },
        {
          object: "text",
          leaves: [
            {
              object: "leaf",
              text: ".",
              marks: [],
            },
          ],
        },
      ],
      data: {},
    },
    {
      object: "block",
      type: "paragraph",
      nodes: [
        {
          object: "text",
          leaves: [
            {
              object: "leaf",
              text: "",
              marks: [],
            },
          ],
        },
      ],
      data: {},
    },
  ];
  const toSlateProcessor = unified().use(markdown).use(remarkToGoldenSlate);

  it("converts", () => {
    const slateNodes = toSlateProcessor.processSync(md).result;
    expect(slateNodes).toStrictEqual(slate);
  });

  it("mapGoldenSlateCiteIDs", async () => {
    const citeIdMapFunction = async (_id: number) => {
      return 1;
    };
    expect(
      await mapGoldenSlateCiteIDs(slate as GoldenNode[], citeIdMapFunction)
    ).toStrictEqual(slateWithMappedCites);
  });
});
