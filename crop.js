const fs = require('fs');
const ConvertTiff = require('tiff-to-png');
const _ = require('lodash');
const helper = require('./helper');
var Jimp = require('jimp');
var rimraf = require("rimraf");

console.log("Start auto cropping script");

// Convert input to temp
const convertExePath = __dirname + `\\bin\\convert.exe`;
const inputPath = __dirname + `\\input`;
const tempPath = __dirname + `\\temp`;
const outputPath = __dirname + `\\output`;

var options = {
    logLevel: 0,
    commandPath: convertExePath,
};

var converter = new ConvertTiff(options);

const files = fs.readdirSync(inputPath).filter(file => {
    const ext = helper.fileExt(file);

    return _.includes(['png', 'tif', 'tiff'], ext);
});

let pngFiles = [];
let tiffFiles = [];

files.forEach(file => {
    const ext = helper.fileExt(file);
    const filePath = inputPath + `\\${file}`;

    if (ext === 'png') {
        pngFiles.push(filePath);
    } else {
        tiffFiles.push(filePath);
    }
});

pngFiles.forEach(path => {
    const fileName = helper.fileNameFromPath(path);
    const fileNameWithoutExtension = helper.fileNameWithoutExt(fileName);
    const fileTempFolderPath = tempPath + `\\${fileNameWithoutExtension}`;

    if (!fs.existsSync(fileTempFolderPath)) {
        fs.mkdirSync(fileTempFolderPath);
    }

    const destination = fileTempFolderPath + `\\0.png`;

    fs.copyFileSync(path, destination);

    console.log(`Copied ${path} to ${destination}`);
});

(async () => {
    const results = await converter.convertArray(tiffFiles, tempPath);

    results.converted.forEach(result => {
        const fileName = result.target.split("/")[1];
        console.log(`Tiff file converted to ${tempPath}\\${fileName}\\0.png`);
    });

    console.log("Start cropping images");

    const imageFolders = fs.readdirSync(tempPath).filter(folder => {
        const folderPath = tempPath + `\\${folder}`;

        return helper.isDir(folderPath);

    });

    const countImage = imageFolders.length;
    let processedCount = 0;

    imageFolders.forEach(folder => {
        const folderPath = tempPath + `\\${folder}`;

        if (!helper.isDir(folderPath)) {
            return;
        }

        const fileName = `${folder}.jpg`;
        const filePath = folderPath + `\\0.png`;
        const fileOutputPath = outputPath + `\\${fileName}`;

        Jimp.read(filePath, (err, image) => {
            if (err) throw err;
            image.autocrop({
                leaveBorder: 30
            }).quality(100).write(fileOutputPath);

            rimraf.sync(folderPath);

            console.log(`Saved ${fileOutputPath} and removed its temp file`);

            processedCount++;

            if(processedCount === countImage) {
                console.log("Removing input files");

                pngFiles.forEach(filePath => {
                    fs.unlinkSync(filePath);
                    console.log(`Deleted ${filePath}`)
                });
            
                tiffFiles.forEach(filePath => {
                    fs.unlinkSync(filePath);
                    console.log(`Deleted ${filePath}`)
                });

                console.log("Command is finished, thank you for using this script!");
            }
        });
    });

})();