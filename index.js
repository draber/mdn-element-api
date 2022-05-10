import fs from "fs-extra";
import YAML from "yamljs";

const types = {
    html: [],
    svg: [],
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
                let title = data.title.match(/<([^>]+)>/);
                title = title ? title[1] : data.title;
                if (!data.tags.includes("Deprecated")) {
                    types[type].push(title);
                    if(title === 'h1') {
                        types[type].push('h2');
                        types[type].push('h3');
                        types[type].push('h4');
                        types[type].push('h5');
                        types[type].push('h6');
                    }
                }
            } catch (e) {
                // console.error({e});
            }
        });
    fs.outputJsonSync(`./build/${type}.json`, types[type], { spaces: '\t' });
});
