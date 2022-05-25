// import getSvgAttributes from "./modules/svg-attributes.js";
// import htmlAttributes from "./modules/html-attributes.js";
import "global-jsdom/register";
import fs from "fs-extra";
import groupData from "../mdn-content/files/jsondata/GroupData.json" assert { type: "json" };
import path from "path";
import resource from "./common/resource.js";
import store from "./store.js";
import { getSummary, getContentObj } from "./common/extractors.js";

const svgInterfaceMap = new Map(
    groupData[0].SVG.interfaces.map((e) => [e.toLowerCase(), e])
);

const getInterface = (tag, type) => {
    switch (type) {
        case "html":
            const element = document.createElement(tag);
            return element.constructor.name;
        case "svg":
            const guess = `svg${tag.toLowerCase()}element`;
            return svgInterfaceMap.has(guess)
                ? svgInterfaceMap.get(guess)
                : "SVGElement";
        default:
            return "MathMLElement";
    }
};

/*web/html/global_attributes/contextmenu/*/
/*
mdn-content\files\en-us\web\html\attributes
mdn-content\files\en-us\web\svg\attribute\accent-height\index.md
*/
const getAttributes = (attrContent, elemFragment, scope) => {
    if (!attrContent) {
        return [];
    }

    const attributes = {};

    const attrContentArr = attrContent.split("\n").filter((e) => !!e);

    attrContentArr.forEach((line, index) => {
        let match = [
            ...line.matchAll(
                /- {{[^\(]+\(("|')?(?<attr>[^"'\)]+)\1\)\s*}}\s*({{(?<status>[^_]+)_Inline\s*}})?/gi
            ),
        ];
        if (!match.length) {
            return;
        }
        match = match.pop();
        const name = match.groups.attr;
        const fragment = `${elemFragment}/attributes/${name}`;
        const nextLine = attrContentArr[index + 1];
        let nextLineCheck = nextLine.match(/({{(?<status>[^_]+)_Header\s*}})/i);
        let status = (
            match.groups.status ||
            nextLineCheck?.groups?.status ||
            "living"
        ).toLowerCase();

        const summary = getSummary(nextLine);

        attributes[fragment] = {
            name,
            status,
            scope,
            summary
        };
    });
    return attributes;
};

const globalAttributeScopes = {
    html: [
        "html:global:generic",
        "html:global:eventhandler",
        "html:global:aria",
    ],
    svg: ["svg:global:styling", "svg:global:core"],
    mathml: [],
};

const getElements = (type) => {
    const directory = path.dirname(
        resource.normalizeLocalPath(`/web/${type}/element`)
    );
    const paths = fs
        .readdirSync(directory)
        .map((entry) => `${directory}/${entry}/index.md`)
        .filter((entry) => fs.existsSync(entry));

    paths.forEach((fragment) => {
        fragment = resource.normalizeFragment(fragment);
        const contentObj = getContentObj(fragment);
        contentObj.meta.name = contentObj.meta.name.match(/<([^>]+)>/)[1];
        contentObj.meta.tags = contentObj.meta.tags.filter(
            (e) => e.toLowerCase() !== contentObj.meta.name.toLowerCase()
        );

        const properties = {
            ...contentObj.meta,
            ...{
                interface: getInterface(contentObj.meta.name, type),
                summary: getSummary(contentObj.summary),
                type: "element",
                scope: type === "mathml" ? "MathML" : type.toUpperCase(),
            },
            globalAttributeScopes: globalAttributeScopes[type],
            attributes: getAttributes(
                contentObj.attributes,
                fragment,
                `${type}:${contentObj.meta.name}`
            ),
        };

        if (contentObj.meta.name === "h1") {
            ["h1", "h2", "h3", "h4", "h5", "h6"].forEach((name) => {
                fragment = fragment.replace(/(h[1-6]|heading_elements)/, name);
                properties.name = name;
                store.set(fragment, properties);
            });
        } else {
            store.set(fragment, properties);
        }
    });
};

export default getElements;
