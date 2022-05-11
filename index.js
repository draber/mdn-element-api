import fs from "fs-extra";
import YAML from "yamljs";
import 'global-jsdom/register';
import groupData from './data/mdn-content/files/jsondata/GroupData.json' assert { type: "json" };
import htmlAttributes from "./html-attributes.js";
import getSvgAttributes from "./svg-attributes.js";

const svgInterfaceMap = new Map(groupData[0].SVG.interfaces.map(e => [e.toLowerCase(), e]));

const types = {
    html: {},
    svg: {}
};

const getProperties = (tag, type) => {
    let interfaceName;
    let attributes;
    if(type === 'html') {
        const element = document.createElement(tag);
        interfaceName = element.constructor.name;
        attributes = htmlAttributes[tag] || []
    }
    else {
        const guess = `svg${tag.toLowerCase()}element`;
        interfaceName = svgInterfaceMap.has(guess) ? svgInterfaceMap.get(guess) : 'SVGElement';
        attributes = getSvgAttributes(tag);
    }
    return {
        interface: interfaceName,
        attributes
    };
};

Object.keys(types).forEach((type) => {
    const directory = `./data/mdn-content/files/en-us/web/${type}/element`;
    fs.readdirSync(directory)
        .map((entry) => `${directory}/${entry}/index.md`)
        .forEach((entry) => {
            try {
                const meta = fs
                    .readFileSync(entry, { encoding: "utf8", flag: "r" })
                    .split("---")[1]
                    .trim();
                const data = YAML.parse(meta);
                let tag = data.title.match(/<([^>]+)>/);
                tag = tag ? tag[1] : data.title;
                if (!data.tags.includes("Deprecated")) {
                    types[type][tag] = getProperties(tag, type);
                    if(tag === 'h1') {
                        types[type][tag] = getProperties('h2', type);
                        types[type][tag] = getProperties('h3', type);
                        types[type][tag] = getProperties('h4', type);
                        types[type][tag] = getProperties('h5', type);
                        types[type][tag] = getProperties('h6', type);
                    }
                }
            } catch (e) {
                // console.error({e});
            }
        });
    fs.outputJsonSync(`./build/${type}.json`, types[type], { spaces: '\t' });
});
