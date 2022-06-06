import { execSync } from "child_process";
import { chdir } from "process";
import escapeStringRegexp from "escape-string-regexp";

const root = process.cwd();

const relevantDirs = [
    "files/en-us/web/accessibility/aria",
    "files/en-us/web/api/globaleventhandlers",
    "files/en-us/web/html/element",
    "files/en-us/web/html/global_attributes",
    "files/en-us/web/math/element",
    "files/en-us/web/svg/attribute",
    "files/en-us/web/svg/element",
];

const relevantDirRegExp = new RegExp(
    `^${relevantDirs.map(escapeStringRegexp).join("|")}`
);

/**
 * Pull a commit hash from the result of a git command.
 * @param {String} stdout
 * @returns {String|Null}
 */
const stdoutToHash = (stdout) => {
    const match = stdout.match(/([0-9a-f]{40})/g);
    if (match && match.length) {
        return match[0].substring(0, 7);
    }
    return null;
};

/**
 * Sync remote mdn-content to local mdn-content
 */

const sync = () => {
    let sha = {
        old: "",
        new: "",
    };
    let stdout;

    stdout = execSync("git submodule status", { encoding: "utf8" });
    sha.old = stdoutToHash(stdout);

    stdout = execSync("git submodule update --remote", { encoding: "utf8" });
    sha.new = stdoutToHash(stdout);

    if (sha.new === null || sha.old === sha.new) {
        console.log("Everything already up-to-date");
        process.exit();
    }

    chdir("./mdn-content");

    stdout = execSync(`git diff --name-only ${sha.old}^ ${sha.new}`, {
        encoding: "utf8",
    });

    if (!stdout.split("\n").some((line) => relevantDirRegExp.test(line))) {
        console.log("No relevant files changed");
        process.exit();
    }

    chdir(root);
};


export default sync;