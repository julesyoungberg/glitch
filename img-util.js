"use strict";

class ImgUtil {
  // converts a 2D pixel coord to a 1D pixel array index
  // assumes each pixel has 4 channels (rgba)
  static pixelIndex(x, y, img) {
    return (y * img.width + x) * 4;
  }

  // converts a pixel array index to an array of channel indexs (rgba)
  static rgba(i) {
    return [ i, i + 1, i + 2, i + 3 ];
  }

  static getPixel(x, y, img) {
    return ImgUtil.rgba(ImgUtil.pixelIndex(x, y, img));
  }

  // for each pixel in the given image run fn on the pixel's channel indices
  // yCondition allows for skipping rows based on the y value
  static forEachPixel(img, fn, yCondition) {
    for (let y = 0; y < img.height; y++) {
      if (!yCondition || yCondition(y)) {
        for (let x = 0; x < img.width; x++) {
          fn(ImgUtil.rgba(ImgUtil.pixelIndex(x, y, img)));
        }
      }
    }
  }

  // copies all data from srcPixels to destImg.pixels
  static copyPixels(srcPixels, destImg) {
    ImgUtil.forEachPixel(destImg, rgba => rgba.forEach(i => {
      destImg.pixels[i] = srcPixels[i];
    }));
    destImg.updatePixels();
  }

  // gets a random rectangle from the image
  static getRandomRectImg(srcImg) {
    const x = floor(random(0, srcImg.width - 30));
    const y = floor(random(0, srcImg.height - 50));
    const w = floor(random(30, srcImg.width - x));
    const h = floor(random(1, 50));
    const destImg = srcImg.get(x, y, w, h);
    destImg.loadPixels();
    return destImg;
  }

  // Takes a 4 element array representation of a pixel and returns brightness
  static getBrightness(pixel) {
    const [r, g, b] = pixel.map(i => i / 255);
    let max = r, min = r;
    if (g > max) max = g;
    if (b > max) max = b;
    if (g < min) min = g;
    if (b < min) min = b;
    return (max + min) / 2;
  }

  // Takes a 4 element array representation of a pixel and returns the hue
  static getHue(pixel) {
    const [r, g, b] = pixel.map(i => i / 255);
    if (r === g && g === b) return 0;

    let max = r, min = r;
    let delta, hue = 0;

    if (g > max) max = g;
    if (b > max) max = b;
    if (g < min) min = g;
    if (b < min) min = b;

    delta = max - min;

    if (r === max) hue = (g - b) / delta;
    else if (g === max) hue = 2 + (b - r) / delta;
    else if (b === max) hue = 4 + (r - g) / delta;

    hue *= 60;
    if (hue < 0) hue += 360;
    return hue;
  }

  static compareBrightness(a, b) {
    return ImgUtil.getBrightness(a) - ImgUtil.getBrightness(b);
  }
}
