(function () {
    'use strict';

    const cast = content => {
        if (typeof content === 'undefined') {
            return document.createDocumentFragment();
        }
        if (content instanceof Element || content instanceof DocumentFragment) {
            return content;
        }
        if (typeof content === 'number') {
            content = content.toString();
        }
        if (typeof content === 'string' ||
            content instanceof String
        ) {
            if (!(/<(.*)>/.test(content))) {
                return document.createTextNode(content);
            }
            let node;
            const mime = content.includes('<svg') ? 'image/svg+xml' : 'text/html';
            const doc = (new DOMParser()).parseFromString(content, mime);
            if (doc.body) {
                node = document.createDocumentFragment();
                const children = Array.from(doc.body.childNodes);
                children.forEach(elem => {
                    node.append(elem);
                });
                return node;
            }
            else {
                return doc.documentElement;
            }
        }
        console.error('Expected Element|DocumentFragment|String|HTMLCode|SVGCode, got', content);
    };
    const obj = {
        $: (selector, container = null) => {
            return typeof selector === 'string' ? (container || document).querySelector(selector) : selector || null;
        },
        $$: (selector, container = null) => {
            return [].slice.call((container || document).querySelectorAll(selector));
        },
        waitFor: function (selector, container = null) {
            return new Promise(resolve => {
                const getElement = () => {
                    const element = obj.$(selector, container);
                    if (element) {
                        resolve(element);
                    } else {
                        requestAnimationFrame(getElement);
                    }
                };
                getElement();
            })
        },
        toNode: content => {
            if (!content.forEach || typeof content.forEach !== 'function') {
                content = [content];
            }
            content = content.map(entry => cast(entry));
            if (content.length === 1) {
                return content[0]
            } else {
                const fragment = document.createDocumentFragment();
                content.forEach(entry => {
                    fragment.append(entry);
                });
                return fragment;
            }
        },
        empty: element => {
            while (element.lastChild) {
                element.lastChild.remove();
            }
            element.textContent = '';
            return element;
        }
    };
    const create = function ({
        tag,
        content,
        attributes = {},
        style = {},
        data = {},
        aria = {},
        events = {},
        classNames = [],
        isSvg = false
    }) {
        const el = isSvg ? document.createElementNS('http://www.w3.org/2000/svg', tag) : document.createElement(tag);
        new Map([
            ['class', 'className'],
            ['for', 'htmlFor'],
            ['tabindex', 'tabIndex'],
            ['nomodule', 'noModule'],
            ['contenteditable', 'contentEditable'],
            ['accesskey', 'accessKey']
        ]).forEach((right, wrong) => {
            if (typeof attributes[right] === 'undefined' && attributes[wrong]) {
                attributes[right] = attributes[wrong];
            }
            delete attributes[wrong];
        });
        if (attributes.style) {
            const styleAttr = {};
            attributes.style.split(';').forEach(rule => {
                const parts = rule.split(':').map(entry => entry.trim());
                styleAttr[parts[0]] = parts[1];
            });
            style = {
                ...styleAttr,
                ...style
            };
            delete attributes.style;
        }
        for (let [key, value] of Object.entries(attributes)) {
            if (isSvg) {
                el.setAttributeNS(null, key, value.toString());
            } else if (value !== false) {
                el[key] = value;
            }
        }
        for (let [key, value] of Object.entries(aria)) {
            key = key === 'role' ? key : 'aria-' + key;
            el.setAttribute(key.toLowerCase(), value);
        }
        for (let [key, value] of Object.entries(data)) {
            value = value.toString();
            el.dataset[key] = value;
        }
        for (const [event, fn] of Object.entries(events)) {
            el.addEventListener(event, fn, false);
        }
        Object.assign(el.style, style);
        if (classNames.length) {
            el.classList.add(...classNames);
        }
        if (typeof content !== 'undefined') {
            el.append(obj.toNode(content));
        }
        return el;
    };
    var src = new Proxy(obj, {
        get(target, prop) {
            return function () {
                const args = Array.from(arguments);
                if (Object.prototype.hasOwnProperty.call(target, prop) && target[prop] instanceof Function) {
                    target[prop].bind(target);
                    return target[prop].apply(null, args);
                }
                return create({
                    ...{
                        tag: prop
                    },
                    ...args.shift()
                });
            }
        }
    });

    const every = function (callbackFn, thisArg) {
        const entries = this.entries();
        for (let [path, value] of entries) {
            if (!callbackFn(value, path, entries, thisArg)) {
                return false;
            }
        }
        return true;
    };

    const filter = function (callbackFn, thisArg) {
        const filtered = this.create({});
        const entries = this.entries();
        for (let [path, value] of entries) {
            if (callbackFn(value, path, entries, thisArg)) {
                filtered.set(path, value);
            }
        }
        return filtered;
    };

    const getType = (value) => {
        if (typeof value === "undefined") {
            return "Undefined";
        }
        if (value === null) {
            return "Null";
        }
        if (value.constructor.name === "Object") {
            return "PlainObject";
        }
        if (
            value.constructor.name === "Function" &&
            /^class\s+([\w]+\s+)?{/.test(value.toString().replace(/\s+/gs, " "))
        ) {
            return "Class";
        }
        if (value.constructor.name === "Element" && value.namespaceURI.endsWith('MathML')) {
            return "MathMLElement";
        }
        if (typeof value.constructor.name === "function") {
            const match = value.constructor.toString().match(/[^\s]+\s+([\w]+)/);
            if (match && match.length > 0) {
                return match[1];
            }
            return "Object";
        }
        return value.constructor.name;
    };

    const isPlainObject = (value) => getType(value) === "PlainObject";

    const find = function (callbackFn, thisArg) {
        const entries = this.entries();
        for (let [path, value] of entries) {
            if (callbackFn(value, path, entries, thisArg)) {
                return isPlainObject(value) ? this.create(value) : value;
            }
        }
    };

    const forEach = function (callbackFn, thisArg) {
        const entries = this.entries();
        for (let [path, value] of entries) {
            callbackFn(value, path, entries, thisArg);
        }
    };

    const includes = function (searchElement) {
        return this.values().includes(searchElement);
    };

    const length = function () {
        return this.keys().length;
    };

    const map = function (callbackFn, thisArg) {
        const mapped = this.create({});
        const entries = this.entries();
        for (let [path, value] of entries) {
            mapped.set(path, callbackFn(value, path, entries, thisArg));
        }
        return mapped;
    };

    const reduce = function (callbackFn, initialValue, thisArg) {
        const entries = this.entries();
        let accumulator = initialValue;
        for (let [path, value] of entries) {
            accumulator = callbackFn(accumulator, value, path, entries, thisArg);
        }
        return isPlainObject(accumulator) ? this.create(accumulator) : accumulator;
    };

    const reduceRight = function (callbackFn, initialValue, thisArg) {
        const entries = this.entries();
        let accumulator = initialValue;
        for (let [path, value] of entries.reverse()) {
            accumulator = callbackFn(accumulator, value, path, entries, thisArg);
        }
        return isPlainObject(accumulator) ? this.create(accumulator) : accumulator;
    };

    const some = function (callbackFn, thisArg) {
        const entries = this.entries();
        for (let [path, value] of entries) {
            if (callbackFn(value, path, entries, thisArg)) {
                return true;
            }
        }
        return false;
    };

    const sort = function (compareFn) {
        compareFn = compareFn || ((a, b) => a - b);
        const sortedObj = this.create({});
        const entries = this.entries();
        const sorted = entries.sort(
            ([keyA, valueA], [keyB, valueB]) => {
                return compareFn(valueA, valueB);
            }
        );
        sorted.forEach(([key, value]) => {
            sortedObj.set(key, value);
        });
        return sortedObj;
    };

    var arrayPlugins = {
        every,
        filter,
        find,
        forEach,
        includes,
        length,
        map,
        reduce,
        reduceRight,
        some,
        sort
    };

    const assign = function (...sources) {
        return this.create(Object.assign(this, ...sources));
    };

    const clone = function () {
        return this.create(structuredClone(this));
    };

    const cloneProperty = function (path) {
        const value = structuredClone(this.get(path));
        return isPlainObject(value) ? this.create(value) : value;
    };

    const entries = function () {
        return Object.entries(this);
    };

    const findPath = function (callbackFn, thisArg) {
        const flat = this.flatten();
        for (let [path, value] of Object.entries(flat)) {
            if (callbackFn(value, path, flat, thisArg)) {
                return path;
            }
        }
    };

    const isArray = (value) => getType(value) === "Array";

    const isUndefined = (value) => getType(value) === "Undefined";

    const isNull = (value) => getType(value) === "Null";

    const flattenObject = (obj, flattened = {}, propStr = "") => {
        if (isUndefined(obj) || isNull(obj)) {
            return flattened;
        }
        Object.entries(obj).forEach(([key, val]) => {
            const nestedPropStr =
                propStr + (propStr ? "." : "") + key;
            if (isPlainObject(val) || isArray(val)) {
                flattened[nestedPropStr] = val;
                flattenObject(val, flattened, nestedPropStr);
            } else {
                flattened[nestedPropStr] = val;
            }
        });
        return flattened;
    };
    const flatten = function () {
        return this.create(flattenObject(this));
    };

    const fromEntries = function (iterable) {
        return this.create(Object.fromEntries(iterable));
    };

    const isObject = value => {
    	const type = typeof value;
    	return value !== null && (type === 'object' || type === 'function');
    };
    const disallowedKeys = new Set([
    	'__proto__',
    	'prototype',
    	'constructor',
    ]);
    const digits = new Set('0123456789');
    function getPathSegments(path) {
    	const parts = [];
    	let currentSegment = '';
    	let currentPart = 'start';
    	let isIgnoring = false;
    	for (const character of path) {
    		switch (character) {
    			case '\\':
    				if (currentPart === 'index') {
    					throw new Error('Invalid character in an index');
    				}
    				if (currentPart === 'indexEnd') {
    					throw new Error('Invalid character after an index');
    				}
    				if (isIgnoring) {
    					currentSegment += character;
    				}
    				currentPart = 'property';
    				isIgnoring = !isIgnoring;
    				break;
    			case '.':
    				if (currentPart === 'index') {
    					throw new Error('Invalid character in an index');
    				}
    				if (currentPart === 'indexEnd') {
    					currentPart = 'property';
    					break;
    				}
    				if (isIgnoring) {
    					isIgnoring = false;
    					currentSegment += character;
    					break;
    				}
    				if (disallowedKeys.has(currentSegment)) {
    					return [];
    				}
    				parts.push(currentSegment);
    				currentSegment = '';
    				currentPart = 'property';
    				break;
    			case '[':
    				if (currentPart === 'index') {
    					throw new Error('Invalid character in an index');
    				}
    				if (currentPart === 'indexEnd') {
    					currentPart = 'index';
    					break;
    				}
    				if (isIgnoring) {
    					isIgnoring = false;
    					currentSegment += character;
    					break;
    				}
    				if (currentPart === 'property') {
    					if (disallowedKeys.has(currentSegment)) {
    						return [];
    					}
    					parts.push(currentSegment);
    					currentSegment = '';
    				}
    				currentPart = 'index';
    				break;
    			case ']':
    				if (currentPart === 'index') {
    					parts.push(Number.parseInt(currentSegment, 10));
    					currentSegment = '';
    					currentPart = 'indexEnd';
    					break;
    				}
    				if (currentPart === 'indexEnd') {
    					throw new Error('Invalid character after an index');
    				}
    			default:
    				if (currentPart === 'index' && !digits.has(character)) {
    					throw new Error('Invalid character in an index');
    				}
    				if (currentPart === 'indexEnd') {
    					throw new Error('Invalid character after an index');
    				}
    				if (currentPart === 'start') {
    					currentPart = 'property';
    				}
    				if (isIgnoring) {
    					isIgnoring = false;
    					currentSegment += '\\';
    				}
    				currentSegment += character;
    		}
    	}
    	if (isIgnoring) {
    		currentSegment += '\\';
    	}
    	switch (currentPart) {
    		case 'property': {
    			if (disallowedKeys.has(currentSegment)) {
    				return [];
    			}
    			parts.push(currentSegment);
    			break;
    		}
    		case 'index': {
    			throw new Error('Index was not closed');
    		}
    		case 'start': {
    			parts.push('');
    			break;
    		}
    	}
    	return parts;
    }
    function isStringIndex(object, key) {
    	if (typeof key !== 'number' && Array.isArray(object)) {
    		const index = Number.parseInt(key, 10);
    		return Number.isInteger(index) && object[index] === object[key];
    	}
    	return false;
    }
    function assertNotStringIndex(object, key) {
    	if (isStringIndex(object, key)) {
    		throw new Error('Cannot use string index');
    	}
    }
    function getProperty(object, path, value) {
    	if (!isObject(object) || typeof path !== 'string') {
    		return value === undefined ? object : value;
    	}
    	const pathArray = getPathSegments(path);
    	if (pathArray.length === 0) {
    		return value;
    	}
    	for (let index = 0; index < pathArray.length; index++) {
    		const key = pathArray[index];
    		if (isStringIndex(object, key)) {
    			object = index === pathArray.length - 1 ? undefined : null;
    		} else {
    			object = object[key];
    		}
    		if (object === undefined || object === null) {
    			if (index !== pathArray.length - 1) {
    				return value;
    			}
    			break;
    		}
    	}
    	return object === undefined ? value : object;
    }
    function setProperty(object, path, value) {
    	if (!isObject(object) || typeof path !== 'string') {
    		return object;
    	}
    	const root = object;
    	const pathArray = getPathSegments(path);
    	for (let index = 0; index < pathArray.length; index++) {
    		const key = pathArray[index];
    		assertNotStringIndex(object, key);
    		if (index === pathArray.length - 1) {
    			object[key] = value;
    		} else if (!isObject(object[key])) {
    			object[key] = typeof pathArray[index + 1] === 'number' ? [] : {};
    		}
    		object = object[key];
    	}
    	return root;
    }
    function deleteProperty(object, path) {
    	if (!isObject(object) || typeof path !== 'string') {
    		return false;
    	}
    	const pathArray = getPathSegments(path);
    	for (let index = 0; index < pathArray.length; index++) {
    		const key = pathArray[index];
    		assertNotStringIndex(object, key);
    		if (index === pathArray.length - 1) {
    			delete object[key];
    			return true;
    		}
    		object = object[key];
    		if (!isObject(object)) {
    			return false;
    		}
    	}
    }
    function hasProperty(object, path) {
    	if (!isObject(object) || typeof path !== 'string') {
    		return false;
    	}
    	const pathArray = getPathSegments(path);
    	if (pathArray.length === 0) {
    		return false;
    	}
    	for (const key of pathArray) {
    		if (!isObject(object) || !(key in object) || isStringIndex(object, key)) {
    			return false;
    		}
    		object = object[key];
    	}
    	return true;
    }

    const get = function (path) {
        const value = getProperty(this, path);
        return isPlainObject(value) ? this.create(value) : value;
    };

    const has = function (path) {
        return hasProperty(this, path);
    };

    const keys = function () {
        return Object.keys(this);
    };

    const paths = function () {
        return Object.keys(this.flatten());
    };

    const set = function (path, value) {
        setProperty(this, path, value);
        return this;
    };

    const toJson = function (pretty = false) {
        return JSON.stringify(this, null, pretty ? "\t" : null);
    };

    const unset = function (path) {
        return deleteProperty(this, path);
    };

    const values = function () {
        return Object.values(this);
    };

    var nativePlugins = {
        assign,
        clone,
        cloneProperty,
        entries,
        findPath,
        flatten,
        fromEntries,
        get,
        has,
        keys,
        paths,
        set,
        toJson,
        unset,
        values
    };

    /*!
     * ElasticObject <https://github.com/draber/elastic-object>
     *
     * Copyright (c) 2022, Dieter Raber.
     * Released under the MIT License.
     */
    const defaultPlugins = {
        ...nativePlugins,
        ...arrayPlugins,
    };
    class ElasticObject extends Object {
        static assign(target, ...sources) {
            return Object.assign(new ElasticObject(target), ...sources);
        }
        static create(data, plugins = {}) {
            return new ElasticObject(data, plugins);
        }
        static fromEntries(entries, plugins = {}) {
            return new ElasticObject(Object.fromEntries(entries), plugins);
        }
        constructor(data = {}, plugins = {}) {
            super();
            ElasticObject.prototype.loadPlugins = function (plugins) {
                Object.entries(plugins).forEach(([name, plugin]) => {
                    if (typeof plugin === "function") {
                        ElasticObject.prototype[name] = plugin;
                    }
                });
            };
            this.loadPlugins({ ...defaultPlugins, ...plugins });
            ElasticObject.prototype.create = function (data = {}) {
                return ElasticObject.create(data, plugins);
            };
            Object.assign(this, data);
        }
    }

    const buildTagListing = (data) => {
        let scope;
        let scopeUl;
        const root = src.$("#tag-list");
        new ElasticObject(data)
            .values()
            .filter((entry) => !entry.name.endsWith("*"))
            .forEach((entry) => {
                if (scope !== entry.scope) {
                    scope = entry.scope;
                    scopeUl = src.ul();
                    root.append(
                        src.li({
                            content: [scope, scopeUl],
                        })
                    );
                }
                if(!scopeUl){
                    return;
                }
                const a = src.a({
                    attributes: {
                        href: `api/${entry.scope.toLowerCase()}-${entry.name}.json`,
                        target: "_blank",
                    }
                });
                a.textContent = `<${entry.name}>`;
                scopeUl.append(
                    src.li({
                        content: a,
                    })
                );
             });
    };
    fetch("api/data.json")
        .then((response) => response.json())
        .then((data) => {
            buildTagListing(data);
        });

})();
