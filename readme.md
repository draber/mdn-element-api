# MDN Element API

Content parser for the [MDN content repository](https://github.com/mdn/content) that converts information about elements and attributes into JSON files.

Elements have this structure:

```json
{
    "html/a": {
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
            "href": {
                "name": "href",
                "status": "living",
                "summary": "The URL that the hyperlink points to. Links are not restricted to HTTP-based URLs — they can use any URL scheme supported by browsers.",
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
            // and so on, all other element specific attributes
            // after that, all relevant global attributes
        }
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
The JSON files will be created under _/api_.
