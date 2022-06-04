import "global-jsdom/register";
import fs from "fs-extra";
import groupData from "../mdn-content/files/jsondata/GroupData.json" assert { type: "json" };
import path from "path";
import resource from "./resource.js";
import { getSummary, getContentObj, getPropTblData } from "./extractors.js";
import { getElemPreset, scopeToType, getTypes } from "./utils.js";
import attributes from "./get-attribute-data.js";
import pkg from "../package.json" assert { type: "json" };

import ElasticObject from "elastic-object";

const elementStore = new ElasticObject();

const svgInterfaceMap = new Map(
    groupData[0].SVG.interfaces.map((e) => [e.toLowerCase(), e])
);

/**
 * Get the namespace for an element
 * @param {String} type
 * @returns {String}
 */
const getNamespaceUri = (type) => {
    switch (type) {
        case "HTML":
            return "http://www.w3.org/1999/xhtml";
        case "SVG":
            return "http://www.w3.org/2000/svg";
        case "MathML":
            return "http://www.w3.org/1998/Math/MathML";
        default:
            return "";
    }
};

/**
 * Get the Interfaces for an element
 * @param {String} tag
 * @param {String} type
 * @returns {Array}
 */
const getInterfaces = (tag, type) => {
    let interfaces = [];
    switch (type) {
        case "HTML":
            const element = document.createElement(tag);
            interfaces.push(element.constructor.name);
            if (interfaces[0] !== "HTMLElement") {
                interfaces.push("HTMLElement");
            }
            break;
        case "SVG":
            const guess = `svg${tag.toLowerCase()}element`;
            interfaces.push(
                svgInterfaceMap.has(guess)
                    ? svgInterfaceMap.get(guess)
                    : "SVGElement"
            );
            if (interfaces[0] !== "SVGElement") {
                interfaces.push("SVGElement");
            }
            break;
        default:
            interfaces.push(`${type}Element`);
    }
    interfaces.push(`Element`);
    return interfaces;
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
    let type = scopeToType(scope);
    let lastFolder = scope === "HTML" ? "attributes" : "attribute";

    const lineArr = attributes.blockToLineArr(
        attrContent,
        `web/${type}/${lastFolder}`
    );

    lineArr.forEach((line, index) => {
        if (!line.startsWith("- [`")) {
            return;
        }
        const data = attributes.getData(line, index, lineArr, scope);
        attrObj[data.name] = data;
    });
    return attrObj;
};

/**
 * Build the list of elements
 * @param {String} type
 */
const getElementsByType = (type) => {

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

        const attributes = new ElasticObject(
            getAttributes(
                contentObj.attributes,
                `${type}:${contentObj.meta.name}`
            )
        ).map((attr) => {
            attr.url = attr.url || contentObj.meta.url;
            if (contentObj.meta.status !== "living") {
                attr.status = "inherited";
            }
            return attr;
        });

        const elemData = {
            ...getElemPreset(),
            ...contentObj.meta,
            ...getPropTblData(fragment),
            ...{
                summary: getSummary(contentObj.summary),
                scope: type,
                namespace: getNamespaceUri(type),
                interfaces: getInterfaces(contentObj.meta.name, type)
            },
            globalAttributes: `${pkg.custom.domain}/${type.toLowerCase()}/_global-attributes.json`,
            attributes,
        };

        /**
         * Heading in MDN are all listed in one file ('heading_element.md')
         */
        if (contentObj.meta.name === "h1") {
            ["h1", "h2", "h3", "h4", "h5", "h6"].forEach((name) => {
                elemData.name = name;
                elementStore.set(`${type.toLowerCase()}.${elemData.name}`, elemData);
            });
        } else {
            elementStore.set(`${type}.${elemData.name}`, elemData);
        }
    });
};

const getElements = () => {
    getTypes().forEach((type) => {
        getElementsByType(type);
    });
    return elementStore;
};

export default getElements;
