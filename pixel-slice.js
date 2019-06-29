// https://github.com/scriptkittie/GlitchKernel/blob/master/src/io/laniakia/algo/PixelSlice.java
class PixelSlice {
  static glitch(img, distortion=1) {
    if (distortion < 0 || distortion > 10) return img.pixels;

    const destPixels = new Uint8ClampedArray(img.pixels);
    let yOffset = -1;

    // for each column
    for (let x = 0; x < img.width; x++) {
      // pick a random y offset based on distortion amount 5% of the time
      if (Math.random() > 0.95) {
        const dist = distortion / 10;
        yOffset = Math.floor(((1 - dist) * Math.random() + dist) * img.height);
      }

      // 5% of the time set the y offset to 0
      if (Math.random() > 0.95) yOffset = 0;

      // for each row
      for (let y = 0; y < img.height; y++) {
        const pixelIndex = ImgUtil.pixelIndex(x, y, img);
        // row distortion offset start
        let offsetStart = y + yOffset;
        if (offsetStart > img.height - 1) offsetStart -= img.height;
        // row distortion offset end
        const offsetEnd = ImgUtil.pixelIndex(x, offsetStart, img);

        for (let k = 0; k < 4; k++) {
          const pos = offsetEnd + k;
          if (pos < 0 || pos > destPixels.length) continue;
          destPixels[pos] = destPixels[pixelIndex + k];
        }
      }
    }

    return destPixels;
  }
}
