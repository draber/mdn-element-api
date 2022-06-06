import fs from "fs-extra";

const mdnRoot = "./mdn-content/files/en-us";

/**
 * Get the path to a file independently from the input format.
 * Code from the modules will most likely be the correct fragment, but everything from within the .md files will have `mdnDocs` as a prefix
 * @param {String} fragment
 * @returns {String}
 */
const normalizeLocalPath = (fragment) => {
    fragment = normalizeFragment(fragment)
        .replace("*", "_star_")
        .replace(":", "_colon_");
    return (`${mdnRoot}/${fragment}/index.md`).replace(/\/+/g, "/").toLowerCase();
};

/**
 * Normalize the fragment to a file path
 *
 * Possible input formats:
 * site map:   https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/contextmenu
 * md link:    /en-US/docs/Web/HTML/Global_attributes/contextmenu
 * md meta:    Web/HTML/Global_attributes/contextmenu
 * js code:    web/html/global_attributes/contextmenu
 * file path:  ./mdn-content/files/en-us/web/html/global_attributes/contextmenu/index.md
 *
 * Expected output: /web/html/global_attributes/contextmenu
 *
 * @param {String} fragment
 * @returns {String}
 */
const normalizeFragment = (fragment) => {
    fragment = fragment
        .toLowerCase()
        .replace(/\/index\.md$/, "")

    const mdnDomain = "https://developer.mozilla.org";
    const enDocs = "/en-us/docs";
    if (fragment.startsWith(mdnDomain)) {
        fragment = fragment.substring(mdnDomain.length);
    }
    if (fragment.startsWith(enDocs)) {
        fragment = fragment.substring(enDocs.length);
    }
    if (fragment.startsWith(mdnRoot)) {
        fragment = fragment.substring(mdnRoot.length);
    }
    return ('/' + fragment).replace(/\/+/g, "/")
};

/**
 * Read a file from the MDN directory and return its contents.
 * @param {String} fragment The file path minus the MDN directory.
 * @returns {String} The contents of the file
 */
const readMd = (fragment) => {
    const path = normalizeLocalPath(fragment);
    if (!fs.existsSync(path)) {
        return "";
    }
    return fs.readFileSync(path, "utf-8");
};

export default {
    readMd,
    normalizeLocalPath,
    normalizeFragment,
};
