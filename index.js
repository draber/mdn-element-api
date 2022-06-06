import getGlobalAttributes from "./modules/collect-global-attributes.js";
import getElements from "./modules/collect-elements.js";
import fs from 'fs-extra';
import { env, jsonOptions } from "./modules/bootstrap.js";
import sync from "./modules/sync-mdn-content.js";

if(env === 'auto') {
    sync();
}


const elements = getElements();
const globalAttributes = getGlobalAttributes();

elements.forEach((collection, type) => {
    fs.outputJson(`api/${type}/_elements.json`, collection, jsonOptions);
    for(let [tagName, element] of Object.entries(collection)) {
        fs.outputJson(`api/${type}/${tagName}.json`, element, jsonOptions);
    }
});
fs.outputJson(`api/_elements.json`, elements);

globalAttributes.forEach((attributes, type) => {
    fs.outputJson(`api/${type}/_global-attributes.json`, attributes, jsonOptions);
});

fs.outputJson(`api/_global-attributes.json`, globalAttributes, jsonOptions);