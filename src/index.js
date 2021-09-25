const pixelMatches = require("./delta");
module.exports = subImageMatch;

const defaultOptions = {
    threshold: 0.1,         // matching threshold (0 to 1); smaller is more sensitive
    // includeAA: false,       // whether to skip anti-aliasing detection. WIP (see pixelmatch package)
};

function subImageMatch(img, subImg, optionsParam) {

    const { data: imgData, width: imgWidth, height: imgHeight } = img;
    const { data: subImgData, width: subImgWidth } = subImg;

    if (!isPixelData(imgData) || !isPixelData(subImgData)) {
        throw new Error("Image data: Uint8Array, Uint8ClampedArray or Buffer expected.");
    }
    if (img.length < subImg.length) {
        throw new Error("Subimage is larger than base image");
    }
    const options = Object.assign({}, defaultOptions, optionsParam);
    const maxDelta = 35215 * options.threshold * options.threshold;

    let subImgPos = 0;
    let matchingTopRowStartX = 0;
    let matchingTopRowStartY = 0;

    for (let y = 0; y < imgHeight; y++) {

        let matchingTopRowX = 0; // restart finding top row mode when we hit a new row in the main img
        for (let x = 0; x < imgWidth; x++) {

            const imgPos = posFromCoordinates(y, x, imgWidth);

            const matches = pixelMatches(imgData, subImgData, imgPos, subImgPos, maxDelta);
            if (matches) {

                if (matchingTopRowX === 0) {
                    // This means this is a new matching row, save these coordinates in the matchingTopRowStartX and Y
                    matchingTopRowStartX = x;
                    matchingTopRowStartY = y;
                }

                matchingTopRowX++;
                if (matchingTopRowX === subImgWidth) {
                    if (subImageMatchOnCoordinates(img, subImg, matchingTopRowStartY, matchingTopRowStartX, maxDelta)) {
                        return true;
                    }
                    x = matchingTopRowStartX; // put our search position x back to where the matching row began
                    matchingTopRowX = 0;
                }
            } else {
                matchingTopRowX = 0; // restart finding top row mode when 2 pixels don't match
            }
        }
    }
    return false;
}

function subImageMatchOnCoordinates(img, subImg, matchY, matchX, maxDelta) {
    const { data: imgData, width: imgWidth } = img;
    const { data: subImgData, width: subImgWidth, height: subImgHeight } = subImg;
    let subImgX = 0;
    let subImgY = 0;
    for (let imgY = matchY; imgY < (matchY + subImgHeight); imgY++) {
        subImgX = 0;

        for (let imgX = matchX; imgX < (matchX + subImgWidth); imgX++) {

            const imgPos = posFromCoordinates(imgY, imgX, imgWidth);
            const subImgPos = posFromCoordinates(subImgY, subImgX, subImgWidth);
            const matches = pixelMatches(imgData, subImgData, imgPos, subImgPos, maxDelta, imgY === 5);
            if (!matches) {
                return false;
            }
            subImgX++;
        }
        subImgY++;
    }
    return true;
}

function isPixelData(arr) {
    // work around instanceof Uint8Array not working properly in some Jest environments
    return ArrayBuffer.isView(arr) && arr.constructor.BYTES_PER_ELEMENT === 1;
}

function posFromCoordinates(y, x, width) {
    return (y * width + x) * 4;
}