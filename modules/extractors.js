import "global-jsdom/register";
import YAML from "yamljs";
import MarkdownIt from "markdown-it";
import { camel } from "./utils.js";

import resource from "./resource.js";
import ElasticObject from "elastic-object";

const md = new MarkdownIt();

/**
 * Parse and normalize the metadata of a file
 * @param {String} raw YML content
 * @returns
 */
const getMetaData = (raw) => {
    const meta = {
        ...{
            name: "",
            url: "",
            tags: [],
            title: "",
            status: "",
        },
        ...YAML.parse(raw),
    };

    // URL on MDN
    meta.url = meta.slug
        ? "https://developer.mozilla.org/en-US/docs/" + meta.slug
        : "";
    delete meta.slug;

    // element | attribute name
    meta.name = meta.title
        // needs to be filtered from attributes
        .replace("GlobalEventHandlers.", "")
        .replace("WAI-ARIA Roles", "role");
    // elements are listed as <tag>
    const elMatch = meta.title.match(/<([^>]+)>/);
    if (elMatch) {
        meta.name = elMatch[1];
    }
    delete meta.title;

    // status
    meta.status =
        meta.tags
            .map((e) => e.toLowerCase())
            .find((e) =>
                ["deprecated", "experimental", "obsolete"].includes(e)
            ) || "living";

    // tags
    meta.tags = meta.tags
        .map((e) => e.replace(/(\w+)\:/, "$1 "))
        .filter(
            (e) =>
                ![
                    "element",
                    "attribute",
                    "reference",
                    "global attributes",
                    "global attribute",
                    "web",
                    "html5",
                    "deprecated",
                    "experimental",
                    "obsolete",
                    meta.name,
                ].includes(e.toLowerCase())
        )
        .filter((e) => !e.startsWith("Needs"));

    delete meta["browser-compat"];
    return meta;
};

/**
 * Read the content of a file and return in an object structure.
 * @param {String} fragment
 * @returns {Object}
 */
export const getContentObj = (fragment) => {
    let contentObj = {
        meta: {},
    };
    let content = resource.read(fragment);
    if (!content) {
        return contentObj;
    }
    let contentArr = content.split("---").filter((e) => !!e);
    contentObj.meta = getMetaData(contentArr[0]);

    content =
        "## Summary" +
        contentArr[1]
            .split("\n")
            .filter(
                (e) => !(e.trim().startsWith("{{") && e.trim().endsWith("}}"))
            )
            .filter((e) => !e.trim().startsWith("?? ["))
            .filter((e) => e.trim() !== "## Summary")
            .join("\n");

    content.split(/## /).forEach((value) => {
        const heading = value.substring(0, value.indexOf("\n")).toLowerCase();

        let text = value.substring(value.indexOf("\n") + 1).trim();
        if (text) {
            contentObj[heading] = text;
        }
    });
    return contentObj;
};

export const parseMdLink = (link) => {
    document.body.innerHTML = md.render(link);
    const a = document.querySelector("a");
    const fragment = resource.normalizeFragment(a.getAttribute("href"));
    const file = resource.normalizeLocalPath(fragment);
    return {
        name: document.querySelector("a").textContent,
        fragment,
        file,
    };
};

const processStr = (text) => {
    return (
        text
            // extract text if possible
            // {{someText("the b argument")}}                  => `the b argument`
            // {{someText("the b argument","the d argument")}} => `the d argument`
            .replace(
                /{{\s*[\w]+\(("([^"]+)")(,"([^"]+)")?[^\}]*\)\s*}}/g,
                (m, a, b, c, d) => {
                    return d ? d : b;
                }
            )
            // special case RFC
            .replace(/\{\{(RFC)\(([^,]+),[^"]+"([^"]+)"\)\}\}/g, '$1 $2 "$3"')
            // discard the rest
            .replace(/{{[^\}]+}}/g, "")
            .replace(/^[^a-z0-9`]*/gi, "")
            .replace(/\n/gi, " ")
            // some md cleanup
            .replace(/\*{2,}/gi, "")
            .replace(/\s+/g, ' ')
            .trim()
    );
};

export const getSummary = (text) => {
    text = text
        // erroneous case where a line break is ???
        // made in the middle of a paragraph
        .replace(/\n([^\s\n\r])/g, " $1")
        .split("\n")
        .filter((e) => !!e.trim())
        .shift();
    text = processStr(text);
    let tmpTextArr = text.split(".");

    // remove the pattern 'foo has the following values:'
    if (
        tmpTextArr.length > 1 &&
        tmpTextArr[tmpTextArr.length - 1].trim().endsWith("values:")
    ) {
        tmpTextArr.pop();
    }
    text = tmpTextArr.join(".");
    // replace remaining ':' at the end by '.'
    if (text.endsWith(":")) {
        text = text.slice(0, -1) + ".";
    }

    if (!text) {
        return "";
    }

    document.body.innerHTML = md.render(text).replace(/<\/?code>/g, "`");
    return document.querySelector("p").textContent.trim();
};

/**
 * Retrieve data from the property tables on the element pages
 * @param {String} text
 * @returns
 */
export const getPropTblData = (fragment) => {

    const data = new ElasticObject();
    let content = resource.read(fragment);
    if (!content) {
        return data;
    }
    const re = /(<table class="properties">.*?<\/table>)/s;
    const table = content.match(re);
    if (!table) {
        return data;
    }
    document.body.innerHTML = table[1];

    document.querySelectorAll("table tr").forEach(row => {
        const cells = row.querySelectorAll("th, td");
        const key = camel(processStr(cells[0].textContent).toLowerCase().replace(/\s/g, "-"));
        let value = processStr(cells[1].textContent).replace(/ (<\/?[^>]+?>) /g, " `$1` ");
        if(key === 'domInterface') {
            return;
        }
        data.set(key, value);
    })
    return data;
};
