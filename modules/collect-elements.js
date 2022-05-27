import "global-jsdom/register";
import fs from "fs-extra";
import groupData from "../mdn-content/files/jsondata/GroupData.json" assert { type: "json" };
import path from "path";
import resource from "./resource.js";
import store from "./store.js";
import { getSummary, getContentObj } from "./extractors.js";
import { getPreset } from "./utils.js";
import attributes from "./get-attribute-data.js";

const svgInterfaceMap = new Map(
    groupData[0].SVG.interfaces.map((e) => [e.toLowerCase(), e])
);


/**
 * Container for global attributes
 * @param {String} type 
 * @returns {Object}
 */
const anyElement = (type) => {
    return {
        name: `${type}:*`,
        status: "virtual",
        summary: `Container to hold the global attributes of all ${type} elements.`,
        url: `https://developer.mozilla.org/en-US/docs/Web/${type}/Element`,
        type: "element",
        scope: type,
        tags: [type],
        interface: `${type}Element`,
        attributes: {},
    };
};

const getInterface = (tag, type) => {
    switch (type) {
        case "HTML":
            const element = document.createElement(tag);
            return element.constructor.name;
        case "SVG":
            const guess = `svg${tag.toLowerCase()}element`;
            return svgInterfaceMap.has(guess)
                ? svgInterfaceMap.get(guess)
                : "SVGElement";
        default:
            return "MathMLElement";
    }
};


const getAttributes = (attrContent, elemFragment, scope) => {
    if (!attrContent) {
        return [];
    }


    const attrObj = {};    
    let type = scope.slice(0, scope.indexOf(":"));
    let lastFolder = scope === 'HTML' ? 'attributes' : 'attribute';

    const lineArr = attributes.blockToLineArr(attrContent, `web/${type}/${lastFolder}`)


    lineArr.forEach((line, index) => {
        if (!line.startsWith("- [`")) {
            return;
        }
        const data = attributes.getData(line, index, lineArr, scope);
        attrObj[data.name] = data;
    });
    return attrObj;
};

const globalAttributeScopes = {
    HTML: [
        "HTML:global:generic",
        "HTML:global:eventhandler",
        "HTML:global:aria",
    ],
    SVG: ["SVG:global:styling", "SVG:global:core"],
    mathml: [],
};

const getElements = (type) => {
    // build an empty generic element to hold the global attributes
    store.set(`/web/${type.toLowerCase()}/element/*`, anyElement(type));
    
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

        const properties = {
            ...getPreset('element'),
            ...contentObj.meta,
            ...{
                interface: getInterface(contentObj.meta.name, type),
                summary: getSummary(contentObj.summary),
                scope: type,
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
