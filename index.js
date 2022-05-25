import getGlobalAttributes from "./modules/global-attributes.js";
import getElements from "./modules/elements.js";
import resource from "./modules/common/resource.js";
import store from "./modules/store.js";

[
    "html:global:generic",
    "html:global:eventhandler",
    "html:global:aria",
    "svg:global:styling",
    "svg:global:core",
].forEach((scope) => {
    getGlobalAttributes(scope);
});

["html", "svg", "mathml"].forEach((type) => {
    getElements(type);
});

resource.write("data.json", store);
