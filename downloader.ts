import axios from 'axios'
import parse, { HTMLElement } from 'node-html-parser'
import fs from 'fs'

async function downloadCards() {
    for (let i = 24; i < 100; i++) {
        const url = `http://unstablegameswiki.com/index.php?title=File:UU-Base-${i.toString().padStart(3, '0')}-SE.png`;
        try {
            const res = await axios.get(url);
            const html = parse(res.data);
    
            const imgUrl = 'http://unstablegameswiki.com' + (html.querySelector('#file').firstChild as HTMLElement).getAttribute('href');
            console.log(imgUrl);
            const imgRes = await axios.get(imgUrl, {responseType: 'stream'});
            imgRes.data.pipe(fs.createWriteStream(`downloads/img-${i}.png`));
        }
        catch (ex) {
            console.log('Failed to get image ' + i);
        }

    }
}

downloadCards();