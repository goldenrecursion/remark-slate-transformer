/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

function __rest(s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
}

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

const unreachable = (_) => {
    throw new Error("unreachable");
};
const mapGoldenNodeCiteID = (node, mapFunction) => __awaiter(void 0, void 0, void 0, function* () {
    if (node.type === "cite" && node.data.id) {
        return Object.assign(Object.assign({}, node), { data: Object.assign(Object.assign({}, node.data), { id: yield mapFunction(node.data.id) }) });
    }
    if (node.nodes) {
        return Object.assign(Object.assign({}, node), { nodes: yield mapGoldenSlateCiteIDs(node.nodes, mapFunction) });
    }
    return node;
});
const mapGoldenSlateCiteIDs = (nodes, mapFunction) => __awaiter(void 0, void 0, void 0, function* () {
    return yield Promise.all(nodes.map((node) => __awaiter(void 0, void 0, void 0, function* () { return yield mapGoldenNodeCiteID(node, mapFunction); })));
});

const mdastToSlate = (node, overrides) => {
    return buildSlateRoot$1(node, overrides);
};
const buildSlateRoot$1 = (root, overrides) => {
    return convertNodes$4(root.children, {}, overrides);
};
const convertNodes$4 = (nodes, deco, overrides) => {
    return nodes.reduce((acc, node) => {
        acc.push(...buildSlateNode$1(node, deco, overrides));
        return acc;
    }, []);
};
const buildSlateNode$1 = (node, deco, overrides) => {
    var _a;
    const customNode = (_a = overrides[node.type]) === null || _a === void 0 ? void 0 : _a.call(overrides, node, (children) => convertNodes$4(children, deco, overrides));
    if (customNode != null) {
        return [customNode];
    }
    switch (node.type) {
        case "paragraph":
            return [buildParagraph$2(node, deco, overrides)];
        case "heading":
            return [buildHeading$2(node, deco, overrides)];
        case "thematicBreak":
            return [buildThematicBreak$1(node)];
        case "blockquote":
            return [buildBlockquote$1(node, deco, overrides)];
        case "list":
            return [buildList$1(node, deco, overrides)];
        case "listItem":
            return [buildListItem$1(node, deco, overrides)];
        case "table":
            return [buildTable$1(node, deco, overrides)];
        case "tableRow":
            return [buildTableRow$1(node, deco, overrides)];
        case "tableCell":
            return [buildTableCell$1(node, deco, overrides)];
        case "html":
            return [buildHtml$1(node)];
        case "code":
            return [buildCode$1(node)];
        case "yaml":
            return [buildYaml$1(node)];
        case "toml":
            return [buildToml$1(node)];
        case "definition":
            return [buildDefinition$1(node)];
        case "footnoteDefinition":
            return [buildFootnoteDefinition$1(node, deco, overrides)];
        case "text":
            return [buildText$1(node.value, deco)];
        case "emphasis":
        case "strong":
        case "delete": {
            const { type, children } = node;
            return children.reduce((acc, n) => {
                acc.push(...buildSlateNode$1(n, Object.assign(Object.assign({}, deco), { [type]: true }), overrides));
                return acc;
            }, []);
        }
        case "inlineCode": {
            const { type, value } = node;
            return [buildText$1(value, Object.assign(Object.assign({}, deco), { [type]: true }))];
        }
        case "break":
            return [buildBreak$1(node)];
        case "link":
            return [buildLink$2(node, deco, overrides)];
        case "image":
            return [buildImage$1(node)];
        case "linkReference":
            return [buildLinkReference$1(node, deco, overrides)];
        case "imageReference":
            return [buildImageReference$1(node)];
        case "footnote":
            return [buildFootnote$1(node, deco, overrides)];
        case "footnoteReference":
            return [buildFootnoteReference(node)];
        case "math":
            return [buildMath$1(node)];
        case "inlineMath":
            return [buildInlineMath$1(node)];
        default:
            unreachable();
            break;
    }
    return [];
};
const buildParagraph$2 = ({ type, children }, deco, overrides) => {
    return {
        type,
        children: convertNodes$4(children, deco, overrides),
    };
};
const buildHeading$2 = ({ type, children, depth }, deco, overrides) => {
    return {
        type,
        depth,
        children: convertNodes$4(children, deco, overrides),
    };
};
const buildThematicBreak$1 = ({ type }) => {
    return {
        type,
        children: [{ text: "" }],
    };
};
const buildBlockquote$1 = ({ type, children }, deco, overrides) => {
    return {
        type,
        children: convertNodes$4(children, deco, overrides),
    };
};
const buildList$1 = ({ type, children, ordered, start, spread }, deco, overrides) => {
    return {
        type,
        children: convertNodes$4(children, deco, overrides),
        ordered,
        start,
        spread,
    };
};
const buildListItem$1 = ({ type, children, checked, spread }, deco, overrides) => {
    return {
        type,
        children: 
        // https://github.com/inokawa/remark-slate-transformer/issues/42
        // https://github.com/inokawa/remark-slate-transformer/issues/129
        children.length === 0
            ? [{ text: "" }]
            : convertNodes$4(children, deco, overrides),
        checked,
        spread,
    };
};
const buildTable$1 = ({ type, children, align }, deco, overrides) => {
    return {
        type,
        children: convertNodes$4(children, deco, overrides),
        align,
    };
};
const buildTableRow$1 = ({ type, children }, deco, overrides) => {
    return {
        type,
        children: convertNodes$4(children, deco, overrides),
    };
};
const buildTableCell$1 = ({ type, children }, deco, overrides) => {
    return {
        type,
        children: convertNodes$4(children, deco, overrides),
    };
};
const buildHtml$1 = ({ type, value }) => {
    return {
        type,
        children: [{ text: value }],
    };
};
const buildCode$1 = ({ type, value, lang, meta }) => {
    return {
        type,
        lang,
        meta,
        children: [{ text: value }],
    };
};
const buildYaml$1 = ({ type, value }) => {
    return {
        type,
        children: [{ text: value }],
    };
};
const buildToml$1 = ({ type, value }) => {
    return {
        type,
        children: [{ text: value }],
    };
};
const buildMath$1 = ({ type, value }) => {
    return {
        type,
        children: [{ text: value }],
    };
};
const buildInlineMath$1 = ({ type, value }) => {
    return {
        type,
        children: [{ text: value }],
    };
};
const buildDefinition$1 = ({ type, identifier, label, url, title, }) => {
    return {
        type,
        identifier,
        label,
        url,
        title,
        children: [{ text: "" }],
    };
};
const buildFootnoteDefinition$1 = ({ type, children, identifier, label }, deco, overrides) => {
    return {
        type,
        children: convertNodes$4(children, deco, overrides),
        identifier,
        label,
    };
};
const buildText$1 = (text, deco) => {
    return Object.assign(Object.assign({}, deco), { text });
};
const buildBreak$1 = ({ type }) => {
    return {
        type,
        children: [{ text: "" }],
    };
};
const buildLink$2 = ({ type, children, url, title }, deco, overrides) => {
    return {
        type,
        children: convertNodes$4(children, deco, overrides),
        url,
        title,
    };
};
const buildImage$1 = ({ type, url, title, alt }) => {
    return {
        type,
        url,
        title,
        alt,
        children: [{ text: "" }],
    };
};
const buildLinkReference$1 = ({ type, children, referenceType, identifier, label }, deco, overrides) => {
    return {
        type,
        children: convertNodes$4(children, deco, overrides),
        referenceType,
        identifier,
        label,
    };
};
const buildImageReference$1 = ({ type, alt, referenceType, identifier, label, }) => {
    return {
        type,
        alt,
        referenceType,
        identifier,
        label,
        children: [{ text: "" }],
    };
};
const buildFootnote$1 = ({ type, children }, deco, overrides) => {
    return {
        type,
        children: convertNodes$4(children, deco, overrides),
    };
};
const buildFootnoteReference = ({ type, identifier, label, }) => {
    return {
        type,
        identifier,
        label,
        children: [{ text: "" }],
    };
};

const plugin$4 = function ({ overrides = {}, } = {}) {
    this.Compiler = function (node) {
        return mdastToSlate(node, overrides);
    };
};

const slateToMdast = (node, overrides) => {
    return buildMdastRoot(node, overrides);
};
const buildMdastRoot = (node, overrides) => {
    return {
        type: "root",
        children: convertNodes$3(node.children, overrides),
    };
};
const convertNodes$3 = (nodes, overrides) => {
    const mdastNodes = [];
    let textQueue = [];
    for (let i = 0; i <= nodes.length; i++) {
        const n = nodes[i];
        if (n && isText(n)) {
            textQueue.push(n);
        }
        else {
            const mdastTexts = [];
            const starts = [];
            let ends = [];
            let textTemp = "";
            for (let j = 0; j < textQueue.length; j++) {
                const cur = textQueue[j];
                textTemp += cur.text;
                const prevStarts = starts.slice();
                const prevEnds = ends.slice();
                const prev = textQueue[j - 1];
                const next = textQueue[j + 1];
                ends = [];
                ["inlineCode", "emphasis", "strong", "delete"].forEach((k) => {
                    if (cur[k]) {
                        if (!prev || !prev[k]) {
                            starts.push(k);
                        }
                        if (!next || !next[k]) {
                            ends.push(k);
                        }
                    }
                });
                const endsToRemove = starts.reduce((acc, k, kIndex) => {
                    if (ends.includes(k)) {
                        acc.push({ key: k, index: kIndex });
                    }
                    return acc;
                }, []);
                if (starts.length > 0) {
                    let bef = "";
                    let aft = "";
                    if (endsToRemove.length === 1 &&
                        (prevStarts.toString() !== starts.toString() ||
                            // https://github.com/inokawa/remark-slate-transformer/issues/90
                            (prevEnds.includes("emphasis") && ends.includes("strong"))) &&
                        starts.length - endsToRemove.length === 0) {
                        while (textTemp.startsWith(" ")) {
                            bef += " ";
                            textTemp = textTemp.slice(1);
                        }
                        while (textTemp.endsWith(" ")) {
                            aft += " ";
                            textTemp = textTemp.slice(0, -1);
                        }
                    }
                    let res = {
                        type: "text",
                        value: textTemp,
                    };
                    textTemp = "";
                    const startsReversed = starts.slice().reverse();
                    startsReversed.forEach((k) => {
                        switch (k) {
                            case "inlineCode":
                                res = {
                                    type: k,
                                    value: res.value,
                                };
                                break;
                            case "strong":
                            case "emphasis":
                            case "delete":
                                res = {
                                    type: k,
                                    children: [res],
                                };
                                break;
                            default:
                                unreachable();
                                break;
                        }
                    });
                    const arr = [];
                    if (bef.length > 0) {
                        arr.push({ type: "text", value: bef });
                    }
                    arr.push(res);
                    if (aft.length > 0) {
                        arr.push({ type: "text", value: aft });
                    }
                    mdastTexts.push(...arr);
                }
                if (endsToRemove.length > 0) {
                    endsToRemove.reverse().forEach((e) => {
                        starts.splice(e.index, 1);
                    });
                }
                else {
                    mdastTexts.push({ type: "text", value: textTemp });
                    textTemp = "";
                }
            }
            if (textTemp) {
                mdastTexts.push({ type: "text", value: textTemp });
                textTemp = "";
            }
            mdastNodes.push(...mergeTexts(mdastTexts));
            textQueue = [];
            if (!n)
                continue;
            const node = buildMdastNode(n, overrides);
            if (node) {
                mdastNodes.push(node);
            }
        }
    }
    return mdastNodes;
};
const buildMdastNode = (node, overrides) => {
    var _a;
    const customNode = (_a = overrides[node.type]) === null || _a === void 0 ? void 0 : _a.call(overrides, node, (children) => convertNodes$3(children, overrides));
    if (customNode != null) {
        return customNode;
    }
    switch (node.type) {
        case "paragraph":
            return buildParagraph$1(node, overrides);
        case "heading":
            return buildHeading$1(node, overrides);
        case "thematicBreak":
            return buildThematicBreak(node);
        case "blockquote":
            return buildBlockquote(node, overrides);
        case "list":
            return buildList(node, overrides);
        case "listItem":
            return buildListItem(node, overrides);
        case "table":
            return buildTable(node, overrides);
        case "tableRow":
            return buildTableRow(node, overrides);
        case "tableCell":
            return buildTableCell(node, overrides);
        case "html":
            return buildHtml(node);
        case "code":
            return buildCode(node);
        case "yaml":
            return buildYaml(node);
        case "toml":
            return buildToml(node);
        case "definition":
            return buildDefinition(node);
        case "footnoteDefinition":
            return buildFootnoteDefinition(node, overrides);
        case "break":
            return buildBreak(node);
        case "link":
            return buildLink$1(node, overrides);
        case "image":
            return buildImage(node);
        case "linkReference":
            return buildLinkReference(node, overrides);
        case "imageReference":
            return buildImageReference(node);
        case "footnote":
            return buildFootnote(node, overrides);
        case "footnoteReference":
            return creatFootnoteReference(node);
        case "math":
            return buildMath(node);
        case "inlineMath":
            return buildInlineMath(node);
        default:
            unreachable();
            break;
    }
    return null;
};
const isText = (node) => {
    return "text" in node;
};
const mergeTexts = (nodes) => {
    const res = [];
    for (const cur of nodes) {
        const last = res[res.length - 1];
        if (last && last.type === cur.type) {
            if (last.type === "text") {
                last.value += cur.value;
            }
            else if (last.type === "inlineCode") {
                last.value += cur.value;
            }
            else {
                last.children = mergeTexts(last.children.concat(cur.children));
            }
        }
        else {
            if (cur.type === "text" && cur.value === "")
                continue;
            res.push(cur);
        }
    }
    return res;
};
const buildParagraph$1 = ({ type, children }, overrides) => {
    return {
        type,
        children: convertNodes$3(children, overrides),
    };
};
const buildHeading$1 = ({ type, depth, children }, overrides) => {
    return {
        type,
        depth,
        children: convertNodes$3(children, overrides),
    };
};
const buildThematicBreak = ({ type, }) => {
    return {
        type,
    };
};
const buildBlockquote = ({ type, children }, overrides) => {
    return {
        type,
        children: convertNodes$3(children, overrides),
    };
};
const buildList = ({ type, ordered, start, spread, children }, overrides) => {
    return {
        type,
        ordered,
        start,
        spread,
        children: convertNodes$3(children, overrides),
    };
};
const buildListItem = ({ type, checked, spread, children }, overrides) => {
    return {
        type,
        checked,
        spread,
        children: convertNodes$3(children, overrides),
    };
};
const buildTable = ({ type, align, children }, overrides) => {
    return {
        type,
        align,
        children: convertNodes$3(children, overrides),
    };
};
const buildTableRow = ({ type, children }, overrides) => {
    return {
        type,
        children: convertNodes$3(children, overrides),
    };
};
const buildTableCell = ({ type, children }, overrides) => {
    return {
        type,
        children: convertNodes$3(children, overrides),
    };
};
const buildHtml = ({ type, children }) => {
    return {
        type,
        value: children[0].text,
    };
};
const buildCode = ({ type, lang, meta, children, }) => {
    return {
        type,
        lang,
        meta,
        value: children[0].text,
    };
};
const buildYaml = ({ type, children }) => {
    return {
        type,
        value: children[0].text,
    };
};
const buildToml = ({ type, children }) => {
    return {
        type,
        value: children[0].text,
    };
};
const buildDefinition = ({ type, identifier, label, url, title, }) => {
    return {
        type,
        identifier,
        label,
        url,
        title,
    };
};
const buildFootnoteDefinition = ({ type, identifier, label, children }, overrides) => {
    return {
        type,
        identifier,
        label,
        children: convertNodes$3(children, overrides),
    };
};
const buildBreak = ({ type }) => {
    return {
        type,
    };
};
const buildLink$1 = ({ type, url, title, children }, overrides) => {
    return {
        type,
        url,
        title,
        children: convertNodes$3(children, overrides),
    };
};
const buildImage = ({ type, url, title, alt, }) => {
    return {
        type,
        url,
        title,
        alt,
    };
};
const buildLinkReference = ({ type, identifier, label, referenceType, children, }, overrides) => {
    return {
        type,
        identifier,
        label,
        referenceType,
        children: convertNodes$3(children, overrides),
    };
};
const buildImageReference = ({ type, identifier, label, alt, referenceType, }) => {
    return {
        type,
        identifier,
        label,
        alt,
        referenceType,
    };
};
const buildFootnote = ({ type, children }, overrides) => {
    return {
        type,
        children: convertNodes$3(children, overrides),
    };
};
const creatFootnoteReference = ({ type, identifier, label, }) => {
    return {
        type,
        identifier,
        label,
    };
};
const buildMath = ({ type, children }) => {
    return {
        type,
        value: children[0].text,
    };
};
const buildInlineMath = ({ type, children, }) => {
    return {
        type,
        value: children[0].text,
    };
};

const plugin$3 = ({ overrides = {}, } = {}) => {
    return function (node) {
        return slateToMdast(node, overrides);
    };
};

const slate047ToSlate = (nodes) => {
    return convertNodes$2(nodes);
};
const convertNodes$2 = (nodes) => {
    return nodes.reduce((acc, n) => {
        const node = convert$1(n);
        if (node) {
            acc.push(node);
        }
        return acc;
    }, []);
};
const convert$1 = (node) => {
    switch (node.object) {
        case "block": {
            const { type, nodes, data } = node;
            return Object.assign({ type, children: convertNodes$2(nodes) }, data);
        }
        case "inline": {
            const { type, nodes, data } = node;
            return Object.assign({ type, children: convertNodes$2(nodes) }, data);
        }
        case "text": {
            const { text = "", marks } = node;
            return Object.assign({ text }, marks === null || marks === void 0 ? void 0 : marks.reduce((acc, m) => {
                acc[m.type] = true;
                return acc;
            }, {}));
        }
    }
    return null;
};

const plugin$2 = function () {
    return function (node) {
        return slateToMdast({
            type: "root",
            children: slate047ToSlate(node.children),
        }, {});
    };
};

const slateToSlate047 = (nodes) => {
    return {
        object: "value",
        document: {
            object: "document",
            nodes: convertNodes$1(nodes),
        },
    };
};
const convertNodes$1 = (nodes) => {
    return nodes.reduce((acc, n) => {
        const node = convert(n);
        if (node) {
            acc.push(node);
        }
        return acc;
    }, []);
};
const convert = (node) => {
    if ("text" in node) {
        const { text } = node, rest = __rest(node, ["text"]);
        const marks = Object.keys(rest).reduce((acc, type) => {
            if (!rest[type])
                return acc;
            acc.push({
                object: "mark",
                type,
            });
            return acc;
        }, []);
        const res = {
            object: "text",
            text,
            marks,
        };
        return res;
    }
    switch (node.type) {
        case "paragraph":
        case "heading":
        case "blockquote":
        case "list":
        case "listItem":
        case "table":
        case "tableRow":
        case "tableCell":
        case "html":
        case "code":
        case "yaml":
        case "toml":
        case "thematicBreak":
        case "definition":
        case "break":
        case "math": {
            const { type, children } = node, rest = __rest(node, ["type", "children"]);
            const res = {
                object: "block",
                type,
                nodes: convertNodes$1(children),
                data: Object.assign({}, rest),
            };
            return res;
        }
        case "footnoteDefinition":
        case "link":
        case "linkReference":
        case "image":
        case "imageReference":
        case "footnote":
        case "footnoteReference":
        case "inlineMath": {
            const { type, children } = node, rest = __rest(node, ["type", "children"]);
            const res = {
                object: "inline",
                type,
                nodes: convertNodes$1(children),
                data: Object.assign({}, rest),
            };
            return res;
        }
    }
    return null;
};

const plugin$1 = function () {
    this.Compiler = function (node) {
        return slateToSlate047(mdastToSlate(node, {}));
    };
};

const mdastToGoldenSlate = (node, overrides) => {
    return buildSlateRoot(node, overrides);
};
const buildSlateRoot = (root, overrides) => {
    return convertNodes(root.children, {}, overrides);
};
const convertNodes = (nodes, deco, overrides) => {
    return nodes.reduce((acc, node) => {
        acc.push(...buildSlateNode(node, deco, overrides));
        return acc;
    }, []);
};
const emptyParagraph = {
    type: "paragraph",
    children: [{ text: "" }],
};
const buildSlateNode = (node, deco, overrides) => {
    var _a;
    const customNode = (_a = overrides[node.type]) === null || _a === void 0 ? void 0 : _a.call(overrides, node, (children) => convertNodes(children, deco, overrides));
    if (customNode != null) {
        return [customNode];
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
const buildParagraph = ({ type, children }, deco, overrides) => {
    return {
        type,
        children: convertNodes(children, deco, overrides),
    };
};
const buildHeading = ({ children, depth }, deco, overrides) => {
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
const buildText = (text, deco) => {
    return Object.assign(Object.assign({}, deco), { text });
};
const getTextFromNode = (node) => {
    if ("text" in node) {
        return node.text;
    }
    return node.children.reduce((text, child) => {
        return (text +
            getTextFromNode(child));
    }, "");
};
const buildLink = (mdNode, deco, overrides) => {
    var _a, _b;
    const children = convertNodes(mdNode.children, deco, overrides);
    const text = getTextFromNode({ children });
    const match = /^\((?<id>\d+)\)$/g.exec(text);
    if ((_a = match === null || match === void 0 ? void 0 : match.groups) === null || _a === void 0 ? void 0 : _a["id"]) {
        return [{
                type: "cite",
                children: [{ text: "" }],
                id: Number.parseInt((_b = match === null || match === void 0 ? void 0 : match.groups) === null || _b === void 0 ? void 0 : _b["id"]),
            }];
    }
    else {
        return children;
    }
};

const BLOCK = {
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
};
const INLINE = {
    a: "link",
    internalLink: "internal-link",
    cite: "cite",
    mathInline: "math-inline",
};
const BLOCK_TYPES = Object.values(BLOCK);
const INLINE_TYPES = Object.values(INLINE);
[...BLOCK_TYPES, ...INLINE_TYPES];
const childToGolden = (node) => {
    const { type, children } = node, data = __rest(node, ["type", "children"]);
    const newNode = {
        object: BLOCK_TYPES.includes(type) ? "block" : "inline",
        type,
        nodes: (children || []).reduce((arr, child) => {
            if ("children" in child) {
                arr.push(childToGolden(child));
            }
            else {
                const lastNode = arr[arr.length - 1];
                const { text } = child;
                const leaves = [
                    {
                        object: "leaf",
                        text,
                        marks: []
                    },
                ];
                if (lastNode && "leaves" in lastNode) {
                    // merge neighboring text nodes
                    const lastLeave = lastNode.leaves.at(-1);
                    if (!lastLeave) {
                        lastNode.leaves.push(...leaves);
                    }
                    else {
                        lastLeave.text += text;
                    }
                }
                else {
                    arr.push({
                        object: "text",
                        leaves,
                    });
                }
            }
            return arr;
        }, []),
        data,
    };
    return newNode;
};
const plugin = function () {
    this.Compiler = function (node) {
        return mdastToGoldenSlate(node, {}).map((child) => childToGolden(child));
    };
};

export { mapGoldenSlateCiteIDs, mdastToSlate, plugin as remarkToGoldenSlate, plugin$4 as remarkToSlate, plugin$1 as remarkToSlateLegacy, slateToMdast, plugin$3 as slateToRemark, plugin$2 as slateToRemarkLegacy };
//# sourceMappingURL=index.mjs.map
