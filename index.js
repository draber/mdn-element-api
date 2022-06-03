import getGlobalAttributes from "./modules/collect-global-attributes.js";
import getElements from "./modules/collect-elements.js";
import resource from "./modules/resource.js";

const elements = getElements();
const globalAttributes = getGlobalAttributes();

elements.forEach((elements, type) => {
    resource.write(`${type}/_elements.json`, elements);
    for(let [tagName, element] of Object.entries(elements)) {
        resource.write(`${type}/${tagName}.json`, element);
    }
});
resource.write("_elements.json", globalAttributes);

globalAttributes.forEach((attributes, type) => {
    resource.write(`${type}/_global-attributes.json`, attributes);
});

resource.write("_global-attributes.json", globalAttributes);