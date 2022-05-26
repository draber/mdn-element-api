import getGlobalAttributes from "./modules/global-attributes.js";
import getElements from "./modules/elements.js";
import resource from "./modules/common/resource.js";
import store from "./modules/store.js";


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
