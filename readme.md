# MDN Tag Collector

Simple parser for the [MDN content repository](https://github.com/mdn/content) that pulls all non-deprecated tags from the repository and stores them in JSON files. The HTML and the SVG directory are parsed separately.

A single entry has the following structure:
```json
{
    "audio": {
        "interface": "HTMLAudioElement",
        "attributes": [
            "autoplay",
            "buffered",
            "controls",
            "crossorigin",
            "loop",
            "muted",
            "preload",
            "src"
        ],
        "description": "The `<audio>` HTML element is used to embed sound content in documents. It may contain one or more audio sources, represented using the `src` attribute or the source element: the browser will choose the most suitable one. It can also be the destination for streamed media, using a MediaStream."
    }
}
```

## A fair warning
This work has been written as a one-off. There isn't anything sophisticated about it. Error handling is minimal, there are no tests either.

## Installation

```bash
git clone --recursive https://github.com/draber/mdn-tag-collector.git # This might take a minute
npm install
```

## Usage
```javascript
node .
```
The two files will be created in _build_.
