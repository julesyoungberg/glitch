// https://github.com/scriptkittie/GlitchKernel/blob/master/src/io/laniakia/algo/BitSort.java
// working but very slow
class BitSort {
  static glitch(img, { verticalInterval=1, horizontalInterval=1, distortion=1 }) {
    const destPixels = new Uint8ClampedArray(img.pixels);
    const offsetHeight = img.height - verticalInterval;
    const offsetWidth = img.width - horizontalInterval;

    for (let y = 0; y < offsetHeight; y++) {
      for (let x = 0; x < offsetWidth; x++) {
        if ( (x + horizontalInterval) < img.width
          && (y + verticalInterval)   < img.height
          && (y + verticalInterval)   >= 0
          && (x + horizontalInterval) >= 0
          &&  x < img.width && y < img.height
        ) {
          // get actual pixel array index and rgba indices
          const pixelIndex = ImgUtil.pixelIndex(x, y, img);
          const nextPixelIndex = ImgUtil.pixelIndex(
            x + horizontalInterval, y + verticalInterval, img
          );
          const rgba = ImgUtil.rgba(pixelIndex);
          const nextRgba = ImgUtil.rgba(nextPixelIndex);
          // array representation of the current pixel => [r, g, b, a]
          const currentPixel = rgba.map(i => img.pixels[i]);
          const nextPixel = nextRgba.map(i => img.pixels[i]);
          // get hue for pixels
          const hue = ImgUtil.getHue(currentPixel);
          const nextHue = ImgUtil.getHue(nextPixel);

          if (hue > (nextHue + distortion)) {
            nextRgba.forEach((i, idx) => destPixels[i] = currentPixel[idx]);
            rgba.forEach((i, idx) => destPixels[i] = nextPixel[idx]);
          }
        }
      }
    }

    return destPixels;
  }
}
