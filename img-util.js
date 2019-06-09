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
}
