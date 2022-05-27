const getSingleElement = (store, key) => {
    const elem = store.get(key);
    const globalAttributeScopes = elem.get("globalAttributeScopes");
    elem.unset("globalAttributeScopes");
    const globalAttributePath =
        `/web/${elem.scope}/${elem.type}/*.attributes`.toLowerCase();

    elem.attributes = {
        ...elem.attributes,
        ...store
            .get(globalAttributePath)
            .filter((element) => globalAttributeScopes.includes(element.scope)),
    };
    return elem;
};

export default getSingleElement;
