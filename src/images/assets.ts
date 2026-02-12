import  Jimp  from "jimp"; // Import types
import x from "@jimp/types"

// Helper to safely crop within image bounds
const safeCrop = (image: any, x: number, y: number, w: number, h: number) => {
  // Check if image has getWidth method
  // if (typeof image.getWidth !== 'function') {
  //   console.error('safeCrop: image does not have getWidth method', image);
  //   return image;
  // }
  const width = image.bitmap.width;
  const height = image.bitmap.height;
  const safeX = Math.max(0, Math.min(x, width - 1));
  const safeY = Math.max(0, Math.min(y, height - 1));
  const safeW = Math.max(1, Math.min(w, width - safeX));
  const safeH = Math.max(1, Math.min(h, height - safeY));
  return image.crop(safeX, safeY, safeW, safeH);
};

// Each image has variants, each variant is a single transformation function
const assets: Record<string, Record<string, (image: Jimp.JimpInstance) => any>> = {
  "sancho.jpg": {
    optimized: (image) => {
      console.log('Transforming sancho.jpg, image type:', typeof image);
      const result = image
        .scale({
        f: 0.33,
        // mode: RESIZE_BEZIER
      });
      console.log('Result type:', typeof result);
      return result;
    }
  },
  "familyPortrait.jpg": {
    optimized: (image) => image.scale({f: 0.33,})
  },
  "headshot5.jpg": {
    optimized: (image) => {
      // First scale down to avoid large crop coordinates
      const scaled = image.scale({f: 0.33,});
      // Use safe crop with adjusted coordinates
      // Original coordinates were for full-size image, but we've scaled down
      // Adjust coordinates proportionally
      const scaleFactor = 0.33;
      const adjX = Math.floor(2300 * scaleFactor);
      const adjY = Math.floor(300 * scaleFactor);
      const adjW = Math.floor(3900 * scaleFactor);
      const adjH = Math.floor(2300 * scaleFactor);
      return safeCrop(scaled, adjX, adjY, adjW, adjH);
    }
  },
  "headshot3.jpg": {
    optimized: (image) => {
      const scaled = image.scale({f: 0.33,});
      const scaleFactor = 0.33;
      const adjX = Math.floor(2300 * scaleFactor);
      const adjY = Math.floor(300 * scaleFactor);
      const adjW = Math.floor(3900 * scaleFactor);
      const adjH = Math.floor(2300 * scaleFactor);
      return safeCrop(scaled, adjX, adjY, adjW, adjH);
    }
  },
  "headshot2.jpg": {
    optimized: (image) => {
      const scaled = image.scale({f: 0.33,});
      const scaleFactor = 0.33;
      const adjX = Math.floor(1200 * scaleFactor);
      const adjY = Math.floor(400 * scaleFactor);
      const adjW = Math.floor(2700 * scaleFactor);
      const adjH = Math.floor(1900 * scaleFactor);
      return safeCrop(scaled, adjX, adjY, adjW, adjH);
    }
  },
  "aboutMe.jpg": {
    optimized: (image) => image.scale({f: 0.33,})
  }
};

export default assets;
