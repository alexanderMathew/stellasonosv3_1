import { Constants } from "./Constants";

/*
  This class is a util/lib class for methods that might be common 
  to manipulate results from OpenCV tools. 
*/
class OpenCVLib {

    /*
     Takes in an output array from OpenCV image processing features.
     Returns an array that has 1 for a white pixel in the output,
     and 0 for a black pixel in the output.
    */ 
    getBlackWhiteIndicesArray(outputArray) {
        let pixelIndices = [];
        for (let i = 0; i < outputArray.length; i++) {
            const currentPixelValue = outputArray[i];
            if (currentPixelValue == Constants.PIXEL_VALUE_WHITE) {
                pixelIndices.push(Constants.OPEN_CV_LIB_WHITE_INDEX);
            } else if (currentPixelValue == Constants.PIXEL_VALUE_BLACK) {
                pixelIndices.push(Constants.OPEN_CV_LIB_BLACK_INDEX);
            }
        }
        return pixelIndices;
    }

    /* 
     Formula for weighted averaging rgb values of a pixel. 
     Source: https://www.tutorialspoint.com/dip/grayscale_to_rgb_conversion.htm
    */
    averageRGB(r,g,b){
        return (0.3 * r) + (0.59 * g) + (0.11 * b) 
    }
}

export default OpenCVLib;