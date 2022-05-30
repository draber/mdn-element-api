/**
 * Pull the data for one element from the store, for instance `html/a`.
 * This will add all global attributes to the result.
 * @param {ElasticObject} store 
 * @param {String} key 
 * @returns 
 */
const getSingleElement = (store, key) => {
    const elem = store.get(key);
    const globalAttributeScopes = elem.get("globalAttributeScopes");
    elem.unset("globalAttributeScopes");
    const globalAttributePath = `${key.split('/').shift()}/*.attributes`;

    elem.attributes = {
        ...elem.attributes,
        ...store
            .get(globalAttributePath)
            .filter((element) => globalAttributeScopes.includes(element.scope)),
    };
    return elem;
};

export default getSingleElement;
