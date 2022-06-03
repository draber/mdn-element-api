import { getContentObj } from "./extractors.js";
import attributes from "./get-attribute-data.js";
import { scopeToType, getGlobAttrScopeArr } from "./utils.js";

import ElasticObject from "elastic-object";

const attrStore = new ElasticObject();

/**
 * Collect all global attributes for a given scope
 * @param {*} scope
 */
const getGlobalAttributesPerScope = (scope) => {
    let fragment;
    switch (true) {
        case scope.startsWith("HTML:global"):
            fragment = scope.includes("aria")
                ? "web/accessibility/aria/attributes"
                : "web/html/global_attributes";
            break;
        case scope.startsWith("SVG:global"):
            fragment = `web/svg/attribute/${scope.substr(
                scope.lastIndexOf(":") + 1
            )}`;
            break;
    }

    const contentObj = getContentObj(fragment);

    let lineArr;
    if (scope === "HTML:global:generic") {
        lineArr = attributes.blockToLineArr(
            contentObj["list of global attributes"]
        );
    } else if (scope === "HTML:global:eventhandler") {
        lineArr = attributes
            .blockToLineArr(
                contentObj["summary"],
                "web/api/globaleventhandlers"
            )
            .filter((line) => line.startsWith("- [`on"));
    } else if (scope === "HTML:global:aria") {
        lineArr = attributes.blockToLineArr(
            contentObj["global aria attributes"]
        );
        lineArr.unshift("- [`role`](web/accessibility/aria/roles)");
    } else if (scope.startsWith("SVG:global")) {
        lineArr = attributes.blockToLineArr(
            contentObj["attributes"],
            "web/svg/attribute"
        );
    }

    const type = scopeToType(scope);

    lineArr.forEach((line, index) => {
        if (!line.startsWith("- [`")) {
            return;
        }
        const data = attributes.getData(line, index, lineArr, scope);
        data.url = data.url || contentObj.meta.url;

        delete data.fragment;

        attrStore.set(`${type.toLowerCase()}.${data.name}`, data);
    });
};


const getGlobalAttributes = () => {
    getGlobAttrScopeArr().forEach((scope) => {
        getGlobalAttributesPerScope(scope);
    });
    return attrStore;
}


export default getGlobalAttributes;
