import { promises as fs, createWriteStream, existsSync } from "fs";
import PDFDocument from 'pdfkit';
import { join } from 'path';

const cardHeight = 88;
const cardWidth = 62.5;

const a4Width = 210;
const a4Height = 297;

const pixelPerMM = 2.834666666;

const rows = 3;
const columns = 3;

const printMargin = 5;

const calibVerticalOffset = 0;
const calibHorizOffset = -1;

async function generateFrontside(doc: PDFKit.PDFDocument, path: string, files: string[]) {
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < columns; col++) {
            var imageIndex = row * columns + col;
            if (imageIndex >= files.length) {
                console.log('Reached last image');
                return true;
            }

            var imageName = files[imageIndex];
            var imgPath =  join(path, imageName)
            //var imgPath = `cards/Dragon/${imageName}`;

            doc.image(
                imgPath,
                (printMargin + col * cardWidth) * pixelPerMM, (printMargin + row * cardHeight) * pixelPerMM,
                {width: cardWidth * pixelPerMM, height: cardHeight * pixelPerMM}
            );
        }  
    }

    console.log('Done generating frontside');
    return (columns * rows) >= files.length;
}

async function generateBackside(doc: PDFKit.PDFDocument) {
    var xOffset = a4Width - cardWidth * columns - printMargin - calibHorizOffset;
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < columns; col++) {
            doc.image(
                `cards/backside.png`,
                (xOffset + col * cardWidth) * pixelPerMM, (printMargin + calibVerticalOffset + row * cardHeight) * pixelPerMM,
                {width: cardWidth * pixelPerMM, height: cardHeight * pixelPerMM}
            );
        }  
    } 

    console.log('Done generating backside');
}


async function generatePdf(path: string) {
    var folderEntries = await fs.readdir(path, {withFileTypes: true});
    var files = folderEntries.filter(f => f.isFile()).map(f => f.name);
    
    for (let i = 0; !noMoreImages; i++) {
        var doc = new PDFDocument({size: 'A4'});
        doc.pipe(createWriteStream(`output-${i}.pdf`));
        
        var currentFiles = files.slice(i * rows * columns)
        var noMoreImages = await generateFrontside(doc, path, currentFiles);

        var page2 = doc.addPage({size: 'A4'});
        await generateBackside(page2);

        doc.end();
        console.log('Done generating pdf');
    }

    console.log('Finished!');
}

//generateFrontside();
//generateBackside();

var args = process.argv.slice(2);
if (!args.length || !args[0]) {
    console.log('Input card directory as first parameter');
}
else {
    generatePdf(args[0]);
}

