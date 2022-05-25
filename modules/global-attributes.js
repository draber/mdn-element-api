import { parseMdLink, getSummary, getContentObj } from "./common/extractors.js";
import store from "./store.js";

import console from "a-nicer-console";

const getGlobalAttributes = (scope) => {
    let fragment;
    switch (true) {
        case scope.startsWith("html:global"):
            fragment = scope.includes("aria")
                ? "web/accessibility/aria/attributes"
                : "web/html/global_attributes";
            break;
        case scope.startsWith("svg:global"):
            fragment = `web/svg/attribute/${scope.substr(
                scope.lastIndexOf(":") + 1
            )}`;
            break;
    }

    const contentObj = getContentObj(fragment);
    let lineArr;
    if (scope === "html:global:generic") {
        lineArr = contentObj["list of global attributes"].split("\n");
    } else if (scope === "html:global:eventhandler") {
        lineArr = [...contentObj["summary"].matchAll(/\*\*`([^`]+)`\*\*/g)]
            .map((e) => e[1])
            .map((e) => `- [\`${e}\`](web/api/globaleventhandlers/${e})`);
    } else if (scope === "html:global:aria") {
        lineArr = contentObj["global aria attributes"].split("\n");
        lineArr.unshift("- [`role`](/en-US/docs/Web/Accessibility/ARIA/Roles)");
    } else if (scope.startsWith("svg:global")) {
        contentObj["attributes"] = contentObj["attributes"].replace(
            /- {{SVGAttr\('([^']+)'\)}}/g,
            "- [`$1`](/en-US/docs/Web/SVG/Attribute/$1)"
        );
        lineArr = contentObj["attributes"].split("\n");
    }

    lineArr = lineArr.filter((e) => !!e);

    lineArr.forEach((value, key) => {
        if (!value.startsWith("- [`")) {
            return;
        }
        const nextLine =
            lineArr[key + 1] && !lineArr[key + 1].startsWith("- [`")
                ? lineArr[key + 1]
                : "";
        let attributeData = {
            // healthy defaults
            ...{
                type: "attribute",
                scope,
                url: "",
                status: "",
                summary: nextLine ? getSummary(lineArr[key + 1]) : "",
            },
            ...parseMdLink(value),
        };

        const attrContentObj = getContentObj(attributeData.fragment);
        attributeData = attrContentObj.meta
            ? {
                  ...attributeData,
                  ...attrContentObj.meta,
              }
            : attributeData;
        attributeData.name = attributeData.name.replace(
            "GlobalEventHandlers.",
            ""
        );
        attributeData.name = attributeData.name.replace(
            "WAI-ARIA Roles",
            "role"
        );
        if (attrContentObj.summary) {
            attributeData.summary = getSummary(attrContentObj.summary);
        }

        // status data in the text seem to be more reliable
        if (value.toLowerCase().includes("deprecated")) {
            attributeData.status = "deprecated";
        } else if (value.toLowerCase().includes("experimental")) {
            attributeData.status = "experimental";
        } else if (value.toLowerCase().includes("obsolete")) {
            attributeData.status = "obsolete";
        }

        const fragment = attributeData.fragment;
        delete attributeData.fragment;
        delete attributeData.file;
        store.set(fragment, attributeData);
    });
};

export default getGlobalAttributes;
