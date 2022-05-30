import getGlobalAttributes from "./modules/collect-global-attributes.js";
import getElements from "./modules/collect-elements.js";
import resource from "./modules/resource.js";
import store from "./modules/store.js";
import getSingleElement from "./modules/get-single-element.js";

/**
 * Build element listing
 */
["HTML", "SVG", "MathML"].forEach((type) => {
    getElements(type);
});

/**
 * Build global attributes
 */
[
    "HTML:global:generic",
    "HTML:global:eventhandler",
    "HTML:global:aria",
    "SVG:global:styling",
    "SVG:global:core",
].forEach((scope) => {
    getGlobalAttributes(scope);
});

/** 
 * Store an object with all elements.
 * Note that in this list, the elements don't have their global attributes
 */
resource.write("all-elements.json", store);

/**
 * Store individual objects for each element. These are complete with all relevant global attributes.
 */
store
    .keys()
    .filter((key) => !key.endsWith("*"))
    .forEach((key) => {
        const elem = getSingleElement(store, key);
        const file = `${elem.scope}-${elem.name}.json`;
        resource.write(file.toLowerCase(), elem);
    });