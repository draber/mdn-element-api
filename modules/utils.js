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
            interfaces: [],
            namespace: "",
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

/**
 * returns an arry of type, e.g. ["HTML", "SVG"]
 * @returns {Array}
 */
export const getTypes = () => {
    return globAttrScopes.keys();
};

/**
 * Get the global attribute scopes for a given type
 * @param {String} type  
 * @returns {Array}
 */
export const getGlobAttrScopesByType = (type) => {
    return globAttrScopes.get(type);
}

/**
 * Get the global attribute scopes as one array
 * @returns {Array}
 */
export const getGlobAttrScopeArr = () => {
    let a1 = [];
    globAttrScopes.values().forEach(a2 => {
        a1 = a1.concat(a2);
    })
    return a1;
};

/**
 * Get the type, e.g. "HTML" from the scope, e.g. "HTML:global:generic"
 * @param {String} scope 
 * @returns {String} 
 */
export const scopeToType = (scope) => {
    return scope.split(":")[0];
}
