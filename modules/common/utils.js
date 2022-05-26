const common = {
    name: "",
    status: "living",
    summary: "",
    url: "",
    type: "",
    scope: "",
    tags: [],
};

export const getPreset = (type) => {
    const typePreset =
        type === "element"
            ? {
                  interface: "",
                  attributes: {},
              }
            : {};
    return {
        ...common,
        ...typePreset,
        ...{ type },
    };
};

