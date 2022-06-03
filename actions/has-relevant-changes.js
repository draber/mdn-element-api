import fs from "fs-extra";
import escapeStringRegexp from "escape-string-regexp";

const relevantDirs = [
    "files/en-us/web/accessibility/aria",
    "files/en-us/web/api/globaleventhandlers",
    "files/en-us/web/html/element",
    "files/en-us/web/html/global_attributes",
    "files/en-us/web/math/element",
    "files/en-us/web/svg/attribute",
    "files/en-us/web/svg/element",
];

const re = new RegExp(`^${relevantDirs.map(escapeStringRegexp).join("|")}`);

const needsUpdate = () => {
    fs.readFileSync("./actions/changes.txt", "utf8")
        .split("\n")
        .some((line) => re.test(line));
};

export default needsUpdate;
