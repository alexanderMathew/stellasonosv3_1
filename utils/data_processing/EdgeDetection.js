import { Constants } from "./Constants";
import OpenCVLib from "./OpenCVLib";

/*
 * This class models edge detection using the OpenCV edge detector. 
 */
class EdgeDetection {
  constructor() {
    this.state = {
      cv: null,
      edgePixelsArray: [],
      openCVLib : new OpenCVLib(),
      loaded: false
    };
  }

  isLoaded = () => {
    return this.state.loaded;
  }

  /* Creates new mat for edge detection output. */
  showImageCanvas = (imageCanvasId) => {
    let imgElement = document.getElementById(imageCanvasId);
    // import because otherwise oftentimes Mat does not load
   window.cv['onRuntimeInitialized'] = () => {
     console.log("initialized in edge detetection")
      let src = window.cv.imread(imgElement);
      let dst = new window.cv.Mat();
      window.cv.cvtColor(src, src, window.cv.COLOR_RGB2GRAY, 0);

      // Canny edge detection
      window.cv.Canny(
        /* source image */ src,
        /* output edges destination */ dst,
        /* threshold1 */ Constants.EDGE_DETECTION_THRESHOLD_1,
        /* threshold2 */ Constants.EDGE_DETECTION_THRESHOLD_2,
        /* kernel size */ Constants.EDGE_DETECTION_KERNEL_SIZE,
        /* L2Gradient */ false
      );

      window.cv.imshow("edge-detection-output", dst);
      const edgePixelsArray = this.findEdgePixelsArray(dst);

      src.delete();
      dst.delete();

      this.state.edgePixelArray = edgePixelsArray; 
      this.state.loaded = true; 
    };
  };

  // Returns an array of indices of pixels that have non-zero RGB values.
  // These pixels are white on the mat.
  // Input: output mat from edge detection.
  findEdgePixelsArray = (dst) => {
    const edgeArray = dst.data;
    const edgePixelIndices = this.state.openCVLib.getBlackWhiteIndicesArray(edgeArray);
    return edgePixelIndices;
  };

  // Returns the dimension of a mat.
  getMatDimension = (mat) => {
    return {
      height: mat.size().height,
      width: mat.size().width,
    };
  };

  /* Converts a 1D array for pixels that are edges to an
     array of 2D coordinates [r,c] of these pixels on the image. */
  // convertEdgePixelArrayToCoordinates = (mat, edgePixelIndices) => {
  //   const matDimensions = this.getMatDimension(mat);
  //   const matHeight = matDimensions.height;
  //   let edgeCoordinates = [];

  //   // Converts the 1D pixel indices to 2D [row, col] coordinates on the result mat
  //   for (var i = 0; i < edgePixelIndices.length; i++) {
  //     const index = edgePixelIndices[i];
  //     const row = Math.floor(index / matHeight);
  //     const col = index % matHeight;
  //     edgeCoordinates.push([row, col]);
  //   }

  //   return edgeCoordinates;
  // }

  // Returns the edge coordinates array that's stored in state.
  getEdgeCoordinates = () => {
    return this.state.edgePixelsArray;
  };
}

export default EdgeDetection;
