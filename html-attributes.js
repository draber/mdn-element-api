import fs from 'fs-extra';
import 'global-jsdom/register';

const content = fs.readFileSync('./data/mdn-content/files/en-us/web/html/attributes/index.md', 'utf-8');

document.body.innerHTML = content.match(/<table(.*)\/table>/gs)[0];

const attributeListing = {};

document.querySelectorAll('tbody tr').forEach((tr) => {
    const tds = tr.querySelectorAll('td');
    const attribute = tds[0].textContent.trim();
    if(attribute.includes('_inline')) {
        return false;
    }
    const elements = [...tds[1].textContent.matchAll(/{{\s*HTMLElement\("([^"]+)"\)\s*}}/g)].map(e => e[1]);
    if(!elements.length) {
        return false;
    }
    elements.forEach((element) => {
        if(!attributeListing[element]) {
            attributeListing[element] = [];
        }
        attributeListing[element].push(attribute);
    });
});

export default attributeListing;