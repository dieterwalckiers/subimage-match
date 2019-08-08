const test = require("tape");
const pngjs = require("pngjs");
const path = require("path");
const fs = require("fs");
const subImageMatch = require("../src");

// eslint-disable-next-line no-undef
const getTestImgPath = (filename) => path.join(__dirname, `testimages/${filename}.png`);

test("throws error if provided wrong image data format", (t) => {
    const err = "Image data: Uint8Array, Uint8ClampedArray or Buffer expected";
    const arr = new Uint8Array(4 * 20 * 20);
    const bad = new Array(arr.length).fill(0);
    t.throws(() => subImageMatch(bad, arr), err);
    t.throws(() => subImageMatch(arr, bad), err);
    t.end();
});


test("throws error sub image is larger than base image", (t) => {
    const err = "Subimage is larger than base image";
    const smallArr = new Uint8Array(4 * 10 * 10);
    const largeArr = new Uint8Array(4 * 20 * 20);
    t.throws(() => subImageMatch(smallArr, largeArr), err);
    t.end();
});

test("Matches on 2 identical images", (t) => {
    const img1 = readImage(getTestImgPath("1"));
    const img2 = readImage(getTestImgPath("1"));
    const matches = subImageMatch(img1, img2);
    t.ok(matches, "should find match");
    t.end();
});

test("Doesn't match on 2 different images", (t) => {
    const img1 = readImage(getTestImgPath("1-sub"));
    const img2 = readImage(getTestImgPath("2"));
    const matches = subImageMatch(img1, img2);
    t.notOk(matches, "shouldn't find match");
    t.end();
});

test("Find sub-image match within image", (t) => {
    const img = readImage(getTestImgPath("1"));
    const subImg = readImage(getTestImgPath("1-sub"));
    const matches = subImageMatch(img, subImg);
    t.ok(matches, "should find match");
    t.end();
});

test("Find sub-image match within image when first row matches in multiple places", (t) => {
    const img = readImage(getTestImgPath("1b"));
    const subImg = readImage(getTestImgPath("1-sub"));
    const matches = subImageMatch(img, subImg);
    t.ok(matches, "should find match");
    t.end();
});

test("Find sub-image match within image when first row matches in multiple places 2", (t) => {
    const img = readImage(getTestImgPath("1c"));
    const subImg = readImage(getTestImgPath("1-sub"));
    const matches = subImageMatch(img, subImg);
    t.ok(matches, "should find match");
    t.end();
});

test("Find sub-image match within image when first row matches in multiple places 3", (t) => {
    const img = readImage(getTestImgPath("1d"));
    const subImg = readImage(getTestImgPath("1-sub"));
    const matches = subImageMatch(img, subImg);
    t.ok(matches, "should find match");
    t.end();
});

const readImage = (path) => {
    // eslint-disable-next-line no-undef
    return pngjs.PNG.sync.read(fs.readFileSync(path));
};
