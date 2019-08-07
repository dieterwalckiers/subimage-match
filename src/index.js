const pixelMatches = require("./delta");
module.exports = subImageFoundInImage;

const defaultOptions = {
    threshold: 0.1,         // matching threshold (0 to 1); smaller is more sensitive
    // includeAA: false,       // whether to skip anti-aliasing detection. WIP (see pixelmatch package)
};

function subImageFoundInImage(img, subImg, optionsParam) {

    const { data: imgData, width: imgWidth, height: imgHeight } = img;
    const { data: subImgData, width: subImgWidth, height: subImgHeight } = subImg;

    console.log(`img is ${imgWidth} x ${imgHeight}`);
    console.log(`subImg is ${subImgWidth} x ${subImgHeight}`);


    if (!isPixelData(imgData) || !isPixelData(subImgData)) {
        throw new Error("Image data: Uint8Array, Uint8ClampedArray or Buffer expected.");
    }
    if (img.length < subImg.length) {
        throw new Error("Subimage is larger than base image");
    }
    const options = Object.assign({}, defaultOptions, optionsParam);
    const maxDelta = 35215 * options.threshold * options.threshold;

    console.log("max delta", maxDelta);

    let subImgPos = 0;
    let matchingTopRowStartX = 0;
    let matchingTopRowStartY = 0;

    for (let y = 0; y < imgHeight; y++) {

        matchingTopRowX = 0; // restart finding top row mode when we hit a new row in the main img
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
                    // console.log(`rowmatch on ${matchingTopRowStartY}-${matchingTopRowStartX}, now checking the rows below!`);
                    if (subImageFoundOnCoordinates(img, subImg, matchingTopRowStartY, matchingTopRowStartX, maxDelta)) {
                        return true;
                    }
                    matchingTopRowX = 0;
                }
            } else {
                matchingTopRowX = 0; // restart finding top row mode when 2 pixels don't match
            }
        }
    }
    return false;
}

function subImageFoundOnCoordinates(img, subImg, matchY, matchX, maxDelta) {
    const { data: imgData, width: imgWidth } = img;
    const { data: subImgData, width: subImgWidth, height: subImgHeight } = subImg;
    let subImgX = 0;
    let subImgY = 0;
    for (let imgY = matchY; imgY < (matchY + subImgHeight); imgY++) {
        subImgX = 0;
        console.log(`checking row ${imgY} (${subImgY} in subImg), from ${matchX} to ${matchX + subImgWidth - 1}`);

        for (let imgX = matchX; imgX < (matchX + subImgWidth); imgX++) {

            const imgPos = posFromCoordinates(imgY, imgX, imgWidth);
            const subImgPos = posFromCoordinates(subImgY, subImgX, subImgWidth);
            const matches = pixelMatches(imgData, subImgData, imgPos, subImgPos, maxDelta);
            if (!matches) {
                console.log(`matches is ${matches}, so nope for coords ${imgY}-${imgX} (${subImgY}-${subImgX} on subImg)`);
                return false;
            }
            subImgX++;
        }
        subImgY >= 0 && console.log(`row ${subImgY} matches`);
        subImgY++;
    }
    console.log(`complete match on ${matchY}-${matchX}`);
    return true;
}

function isPixelData(arr) {
    // work around instanceof Uint8Array not working properly in some Jest environments
    return ArrayBuffer.isView(arr) && arr.constructor.BYTES_PER_ELEMENT === 1;
}

function posFromCoordinates(y, x, width) {
    return (y * width + x) * 4;
}