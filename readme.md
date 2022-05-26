# MDN Element API

Content parser for the [MDN content repository](https://github.com/mdn/content) that converts information about elements and attributes into JSON.

Elements have this structure:

```json
{
    "/web/html/element/a": {
		"name": "a",
		"status": "living",
		"summary": "The `<a>` HTML element (or anchor element), with its `href` attribute, creates a hyperlink to web pages, files, email addresses, locations in the same page, or anything else a URL can address.",
		"url": "https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a",
		"type": "element",
		"scope": "HTML",
		"tags": [
			"Content",
			"HTML",
			"HTML text-level semantics",
			"HTML Flow content",
			"HTML Interactive content",
			"HTML Palpable Content",
			"HTML Phrasing content",
			"Inline element"
		],
		"interface": "HTMLAnchorElement",
		"attributes": {
			"download": {
				"name": "download",
				"status": "living",
				"summary": "Causes the browser to treat the linked URL as a download. Can be used with or without a value.",
				"url": "",
				"type": "attribute",
				"scope": "HTML:a",
				"tags": []
			},
			"href": {
				"name": "href",
				"status": "living",
				"summary": "The URL that the hyperlink points to. Links are not restricted to HTTP-based URLs — they can use any URL scheme supported by browsers.",
				"url": "",
				"type": "attribute",
				"scope": "HTML:a",
				"tags": []
			},
			"hreflang": {
				"name": "hreflang",
				"status": "living",
				"summary": "Hints at the human language of the linked URL. No built-in functionality. Allowed values are the same as the global `lang` attribute.",
				"url": "",
				"type": "attribute",
				"scope": "HTML:a",
				"tags": []
			},
			"ping": {
				"name": "ping",
				"status": "living",
				"summary": "A space-separated list of URLs. When the link is followed, the browser will send POST requests with the body `PING` to the URLs. Typically for tracking.",
				"url": "",
				"type": "attribute",
				"scope": "HTML:a",
				"tags": []
			},
			"referrerpolicy": {
				"name": "referrerpolicy",
				"status": "living",
				"summary": "How much of the referrer to send when following the link.",
				"url": "",
				"type": "attribute",
				"scope": "HTML:a",
				"tags": []
			},
			"rel": {
				"name": "rel",
				"status": "living",
				"summary": "The relationship of the linked URL as space-separated link types.",
				"url": "",
				"type": "attribute",
				"scope": "HTML:a",
				"tags": []
			},
			"target": {
				"name": "target",
				"status": "living",
				"summary": "Where to display the linked URL, as the name for a browsing context (a tab, window, or iframe). The following keywords have special meanings for where to load the URL.",
				"url": "",
				"type": "attribute",
				"scope": "HTML:a",
				"tags": []
			},
			"type": {
				"name": "type",
				"status": "living",
				"summary": "Hints at the linked URL's format with a MIME type. No built-in functionality.",
				"url": "",
				"type": "attribute",
				"scope": "HTML:a",
				"tags": []
			}
		},
		"globalAttributeScopes": [
			"HTML:global:generic",
			"HTML:global:eventhandler",
			"HTML:global:aria"
		]
	}
}
```

## A fair warning
This work has originally been written as a one-off. There isn't anything sophisticated about it. Error handling is minimal, there are no tests either.

## Installation

```bash
git clone --recursive https://github.com/draber/mdn-element-api.git # This might take a minute
npm install
```

## Usage
```javascript
node .
```
The JSON file will be created in _api_.
