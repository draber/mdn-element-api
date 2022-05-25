# MDN Element API

Content parser for the [MDN content repository](https://github.com/mdn/content) that converts information about elements and attributes into JSON.

Global attributes have this structure:

```json
"/web/html/global_attributes/autofocus": {
    "type": "attribute",
    "scope": "html:global:generic",
    "url": "https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/autofocus",
    "status": "living",
    "summary": "The `autofocus` global attribute is a Boolean attribute indicating that an element should be focused on page load, or when the dialog that it is part of is displayed.",
    "name": "autofocus",
    "tags": [
        "Autofocus",
        "Global attributes",
        "HTML",
        "Reference"
    ]
}
```

Elements are stored in the same tree and look like this:

```json
	"/web/html/element/optgroup": {
		"tags": [
			"Element",
			"Forms",
			"HTML",
			"HTML forms",
			"Reference",
			"Web"
		],
		"url": "https://developer.mozilla.org/en-US/docs/Web/HTML/Element/optgroup",
		"name": "optgroup",
		"status": "living",
		"interface": "HTMLOptGroupElement",
		"summary": "The `<optgroup>` HTML element creates a grouping of options within a select element.",
		"type": "element",
		"scope": "HTML",
		"globalAttributeScopes": [
			"html:global:generic",
			"html:global:eventhandler",
			"html:global:aria"
		],
		"attributes": {
			"/web/html/element/optgroup/attributes/disabled": {
				"name": "disabled",
				"status": "living",
				"scope": "html:optgroup",
				"summary": "If this Boolean attribute is set, none of the items in this option group is selectable. Often browsers grey out such control and it won't receive any browsing events, like mouse clicks or focus-related ones."
			},
			"/web/html/element/optgroup/attributes/label": {
				"name": "label",
				"status": "living",
				"scope": "html:optgroup",
				"summary": "The name of the group of options, which the browser can use when labeling the options in the user interface. This attribute is mandatory if this element is used."
			}
		}
	}
```

## A fair warning
This work has been written as a one-off. There isn't anything sophisticated about it. Error handling is minimal, there are no tests either.

## Installation

```bash
git clone --recursive https://github.com/draber/mdn-element-api.git # This might take a minute
npm install
```

## Usage
```javascript
node .
```
The two files will be created in _build_.
