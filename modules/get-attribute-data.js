import { getSummary, getContentObj, parseMdLink } from "./extractors.js";
import { getPreset } from "./utils.js";

const format = (attr, linkPattern) => {
    return `- [\`${attr}\`](${linkPattern}/${attr})`;
};

/**
 * Convert the various attribute listings into an array of MD links
 * @param {String} attrString
 * @param {String} link
 * @returns {Array}
 */
const blockToLineArr = (attrString, link = "invalid") => {
    const finalLineArr = [];
    const lineArr = attrString
        .split(/\n/)
        .filter((line) => !!line)
        .filter((line) => line.trim().startsWith("- "));

    for (let i = 0; i < lineArr.length; i++) {
        let line = lineArr[i];

        // check for multiple attr per line
        // this style is mainly used in mathml/element/*/index.md
        // - attr1, attr2, attr3
        //   - : optional line with summary
        let attrs = line.match(/^- `?(?<attrList>([\w]+)\b`?(?=,)([\w` ,]+))/);

        // do other replacements and continue
        if (!attrs) {
            line = line
                // - {{ unimplemented_inline() }} rowspacing ( should be the other way around ),
                // .replace(/^- ({{[^_]+_inline[^}]+}})\s*`?([\w]+)`?/i, "$1 $2")
                .replace(
                    /^- ({{[^_]+_inline[^}]+}})\s*`?([\w]+)`?/i,
                    (full, a, b) => {
                        return `- ${b} ${a}`;
                    }
                )
                // - {{fn("attr")}} | - {{fn('attr')}}
                .replace(
                    /^- ({{[^\(]+)\(("|')(?<attr>[^'"]+)\2\)}}/,
                    (full, b, c, attr) => {
                        return format(attr, link);
                    }
                )
                // - `attr` | - attr
                .replace(/^- `?(?<attr>[a-z]+)\b`?(?!,)/, (full, attr) => {
                    return format(attr, link);
                });
            finalLineArr.push(line);
            continue;
        }
        // back to multientry
        else {
            let summary =
                lineArr[i + 1] && lineArr[i + 1].startsWith("  - :")
                    ? lineArr[i + 1]
                    : "";
            attrs = attrs.groups.attrList
                .replace(/[` ]/g, "")
                .split(",")
                .map((attr) => format(attr, link));

            attrs.forEach((attr, cnt) => {
                finalLineArr.push(attr);
                if (summary && cnt < attrs.length - 1) {
                    finalLineArr.push(summary);
                }
            });
        }
    }

    // this style is found in html/global_attributes/index.md
    // **`onabort`**, **`onautocomplete`**, **`onautocompleteerror`**...
    const fromBlock = [...attrString.matchAll(/\*\*`([^`]+)`\*\*/g)]
        .map((attr) => attr[1])
        .map((attr) => format(attr, link));

    return finalLineArr
        .concat(fromBlock)
        .filter((line) => !!line)
        .filter((line) => line.startsWith("- [") || line.startsWith("  - :"));
};

const getData = (line, index, lineArr, scope) => {
    const nextLine =
        lineArr[index + 1] && !lineArr[index + 1].startsWith("- [`")
            ? lineArr[index + 1]
            : "";

    const statusRe = /({{\s*(?<status>[\w]+)_(Header|Inline)[^}]*}})/i;
    let status = (
        line.match(statusRe)?.groups?.status ||
        nextLine.match(statusRe)?.groups?.status ||
        "living"
    ).toLowerCase();

    let data = {
        ...getPreset("attribute"),
        ...{
            summary: nextLine ? getSummary(lineArr[index + 1]) : "",
            scope,
            status,
        },
        ...parseMdLink(line),
    };

    const contentObj = getContentObj(data.fragment);
    data = contentObj.meta
        ? {
              ...data,
              ...contentObj.meta,
          }
        : data;
    if (contentObj.summary) {
        data.summary = getSummary(contentObj.summary);
    }

    delete data.fragment;
    delete data.file;

    return data;
};

export default {
    blockToLineArr,
    getData,
};
