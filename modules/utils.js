import ElasticObject from "elastic-object";

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

const globAttrScopes = new ElasticObject({
    HTML: [
        "HTML:global:generic",
        "HTML:global:eventhandler",
        "HTML:global:aria",
    ],
    SVG: ["SVG:global:styling", "SVG:global:core"],
    MathML: [],
});

export const getTypes = () => {
    return globAttrScopes.keys();
};

export const getGlobAttrScopesByType = (type) => {
    return globAttrScopes.get(type);
}

export const getGlobAttrScopeArr = () => {
    let a1 = [];
    globAttrScopes.values().forEach(a2 => {
        a1 = a1.concat(a2);
    })
    return a1;
};



