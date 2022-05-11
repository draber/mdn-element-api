import fs from "fs-extra";

const getSvgAttributes = (tag) => {
    const attributes = [];
    const content = fs.readFileSync(
        `./data/mdn-content/files/en-us/web/svg/element/${tag.toLowerCase()}/index.md`,
        "utf-8"
    );
    content
        .split("## Attributes")[1]
        .split("### Global attributes")[0]
        .split("\n")
        .filter((e) => e.startsWith("- {{"))
        .filter((e) => !e.includes("_inline"))
        .filter((e) => !e.includes("xlink:"))
        .forEach((e) => {
            const currentAttributes = [
                ...e.matchAll(
                    /({{\s*SVGAttr\("([^"]+)"\)\s*}}|{{\s*htmlattrxref\("([^"]+)",)/g
                ),
            ].pop();
            const currentAttribute =
                currentAttributes[2] || currentAttributes[3];
            if (currentAttribute) {
                attributes.push(currentAttribute);
            }
        });
    return attributes;
};

export default getSvgAttributes;
