module.exports = pixelMatches;

// calculate color difference according to the paper "Measuring perceived color difference
// using YIQ NTSC transmission color space in mobile applications" by Y. Kotsarenko and F. Ramos
function pixelMatches(img1, img2, k, m, maxDelta, options, yOnly) {

    if ((k + 3) >= img1.length) {
        throw new Error(`Cannot get positions ${k} through ${k + 3} from img array of length ${img1.length}`);
    }
    if ((m + 3) >= img2.length) {
        throw new Error(`Cannot get positions ${m} through ${m + 3} from img array of length ${img2.length}`);
    }

    let r1 = img1[k + 0];
    let g1 = img1[k + 1];
    let b1 = img1[k + 2];
    let a1 = img1[k + 3];

    let r2 = img2[m + 0];
    let g2 = img2[m + 1];
    let b2 = img2[m + 2];
    let a2 = img2[m + 3];

    if (a1 === a2 && r1 === r2 && g1 === g2 && b1 === b2) return true;

    if (a1 < 255) {
        a1 /= 255;
        r1 = blend(r1, a1);
        g1 = blend(g1, a1);
        b1 = blend(b1, a1);
    }

    if (a2 < 255) {
        a2 /= 255;
        r2 = blend(r2, a2);
        g2 = blend(g2, a2);
        b2 = blend(b2, a2);
    }

    const y = rgb2y(r1, g1, b1) - rgb2y(r2, g2, b2);

    let delta;

    if (yOnly) { // brightness difference only
        delta = y;
    } else {
        const i = rgb2i(r1, g1, b1) - rgb2i(r2, g2, b2);
        const q = rgb2q(r1, g1, b1) - rgb2q(r2, g2, b2);
        delta = 0.5053 * y * y + 0.299 * i * i + 0.1957 * q * q;
    }
    return delta <= maxDelta;    
}

function rgb2y(r, g, b) { return r * 0.29889531 + g * 0.58662247 + b * 0.11448223; }
function rgb2i(r, g, b) { return r * 0.59597799 - g * 0.27417610 - b * 0.32180189; }
function rgb2q(r, g, b) { return r * 0.21147017 - g * 0.52261711 + b * 0.31114694; }

// blend semi-transparent color with white
function blend(c, a) {
    return 255 + (c - 255) * a;
}