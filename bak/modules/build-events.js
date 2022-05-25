import fs from "fs-extra";

/**
 * Parse event listing from `/files/en-us/web/events/index.md` into an object.
 * @returns {Object}
 */
const buildEvents = () => {
    const content = fs
        .readFileSync(
            "./mdn-content/files/en-us/web/events/index.md",
            "utf-8"
        )
        .split("## Event listing")[1]
        .split("## Specifications")[0];
    const lookup = {};
    let category;
    content
        .split("\n")
        .filter((e) => e.trim().startsWith("- "))
        .filter((e) => !!e)
        .forEach((e) => {
            let event;
            const categoryGuess = [
                ...e.matchAll(/{{\s*DOMxRef\("([^"]+)"\)\s*}}/g),
            ];
            const eventGuess = [...e.matchAll(/  - \[([\w]+) event\]/g)];
            if (categoryGuess.length) {
                category = categoryGuess[0][1];
                lookup[category] = [];
                return true;
            } else if (eventGuess.length) {
                event = eventGuess[0][1];
                lookup[category].push(event);
            }
        });
        return lookup;
};

export default buildEvents;
