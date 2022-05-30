import "global-jsdom/register";
import fs from "fs-extra";
import groupData from "../mdn-content/files/jsondata/GroupData.json" assert { type: "json" };
import path from "path";
import resource from "./resource.js";
import store from "./store.js";
import { getSummary, getContentObj } from "./extractors.js";
import { getElemPreset } from "./utils.js";
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

/**
 * Get the Interface for an element
 * @param {String} tag 
 * @param {String} type 
 * @returns 
 */
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

/**
 * Collect attributes for a specific element
 * @param {Object} attrContent 
 * @param {String} scope 
 * @returns 
 */
const getAttributes = (attrContent, scope) => {
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

/**
 * Build the list of elements
 * @param {String} type 
 */
const getElements = (type) => {
    // build an empty generic element to hold the global attributes
    store.set(`${type.toLowerCase()}/*`, anyElement(type));
    
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

        const attrData = {
            ...getElemPreset(),
            ...contentObj.meta,
            ...{
                interface: getInterface(contentObj.meta.name, type),
                summary: getSummary(contentObj.summary),
                scope: type,
            },
            globalAttributeScopes: globalAttributeScopes[type],
            attributes: getAttributes(
                contentObj.attributes,
                `${type}:${contentObj.meta.name}`
            ),
        };

        attrData.url = attrData.url || contentObj.meta.url;

        /**
         * Heading in MDN are all listed in one file ('heading_element.md')
         */
        if (contentObj.meta.name === "h1") {
            ["h1", "h2", "h3", "h4", "h5", "h6"].forEach((name) => {
                attrData.name = name;
                store.set(`${type.toLowerCase()}/${attrData.name}`, attrData);
            });
        } else {
            store.set(`${type.toLowerCase()}/${attrData.name}`, attrData);
        }
    });
};

export default getElements;
