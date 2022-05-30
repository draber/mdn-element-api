import { getContentObj } from "./extractors.js";
import store from "./store.js";
import attributes from "./get-attribute-data.js";

const getGlobalAttributes = (scope) => {
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
        lineArr = attributes.blockToLineArr(
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

    

    const elemFragment = `${scope.slice(
        0,
        scope.indexOf(":")
    ).toLowerCase()}/*`;

    lineArr.forEach((line, index) => {
        if (!line.startsWith("- [`")) {
            return;
        }
        const data = attributes.getData(line, index, lineArr, scope);
        
        const fragment = `${elemFragment}.attributes.${data.name}`;
        delete data.fragment;

        store.set(fragment, data)
    });
};

export default getGlobalAttributes;
