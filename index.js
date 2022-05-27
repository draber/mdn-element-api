import getGlobalAttributes from "./modules/collect-global-attributes.js";
import getElements from "./modules/collect-elements.js";
import resource from "./modules/resource.js";
import store from "./modules/store.js";
import getSingleElement from "./modules/get-single-element.js";

["HTML", "SVG", "MathML"].forEach((type) => {
    getElements(type);
});

[
    "HTML:global:generic",
    "HTML:global:eventhandler",
    "HTML:global:aria",
    "SVG:global:styling",
    "SVG:global:core",
].forEach((scope) => {
    getGlobalAttributes(scope);
});

resource.write("data.json", store);
store
    .keys()
    .filter((key) => !key.endsWith("*"))
    .forEach((key) => {
        const elem = getSingleElement(store, key);
        resource.write(`${elem.scope.toLowerCase()}-${elem.name}.json`, elem);
    });
