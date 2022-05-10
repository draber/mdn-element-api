# MDN Tag Collector

Simple parser for the [MDN content repository](https://github.com/mdn/content) that pulls all non-deprecated tags from the repository and stores them in JSON files. The HTML and the SVG directory are parsed separately.

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