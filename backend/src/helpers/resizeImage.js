const path = require('path');
const sharp = require('sharp');

module.exports = (filePath,fileName,size = 850) => {
    return sharp(filePath)
                .resize(size)
                .toFile(path.resolve(`src/public/optimize/resize-${fileName}`));
};