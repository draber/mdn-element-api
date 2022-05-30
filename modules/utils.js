const common = {
    name: "",
    status: "living",
    summary: "",
    url: "",
    type: "",
    scope: "",
    tags: [],
};

export const getAttrPreset = () => {
    return {
        ...common,
        ...{ type: "attribute" },
    };
};

export const getElemPreset = () => {
    return {
        ...common,
        ...{
            interface: "",
            attributes: {},
        },
        ...{ type: "element" },
    };
};

export const getGlobalAttrNs = () => {
    return [
        "HTML:global:generic",
        "HTML:global:eventhandler",
        "HTML:global:aria",
        "SVG:global:styling",
        "SVG:global:core",
    ];
};

export const getTypes = () => {
    return ["HTML", "SVG", "MathML"];
};
