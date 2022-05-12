import fs from 'fs-extra';
import 'global-jsdom/register';

const getDescription = (type, tag) => {

    if(['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tag)) {
        tag = 'heading_elements'
    }

    return fs.readFileSync(
        `./data/mdn-content/files/en-us/web/${type}/element/${tag.toLowerCase()}/index.md`,
        "utf-8"
    )
    .split('---')[2]
    .trim()
    .split('\n')
    .slice(0, 3)
    .filter(e => !!e)
    .filter(e => !e.startsWith('{'))
    .map(e => e.replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1'))
    .map(e => e.replace(/{{\s*[\w]+\("([^"]+)"[^\}]*\)\s*}}/g, '$1'))
    .map(e => e.replace(/\*/g, ''))
    .pop();    
}

export default getDescription;
