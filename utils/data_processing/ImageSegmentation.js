import { Constants } from "./Constants";
import OpenCVLib from "./OpenCVLib";
import ls from "local-storage";

/**
 * This class models a image segmentation tool.
 * We first use the segmentation function from OpenCV, and then 
 * accumulate information about the different objects as labeled from the segmentor.
 * For each pixel, we give it an id number that reflects which object it belongs to.
 * An object id of 0 means this pixel is not part of any prominent object and is considered background.
 */
class ImageSegmentation {
  constructor() {
    this.state = {
      cv: null,
      openCVLib : new OpenCVLib(),
      loaded: false,
      imageRenderedHeight : 0, 
      imageRenderedWidth : 0
    };
  }
  
  isLoaded = () => {
    return this.state.loaded;
  }
  
  /* Applies image segmentation and calls function to find and label objects. */
  segment = (
    canvas, imageType, bgrDataArray, showSegmentation=false, displayId="",
    renderedWidth, renderedHeight) => {

    let src = window.cv.imread(canvas); //The decoded images will have the channels stored in B G R order.
    
    // Use the passed in rendered dimensions to resize the image
    // so that the image that gets segmented later is of the same size
    // as the sound image that is currently rendered on the page. 
    const renderedSize = new window.cv.Size(renderedWidth, renderedHeight);
    window.cv.resize(src, src, renderedSize, 0, 0, window.cv.INTER_AREA);
    console.assert(src.rows === renderedHeight);
    console.assert(src.cols === renderedWidth);

    let dst = window.cv.Mat.zeros(src.rows, src.cols, window.cv.CV_8UC3);

    this.state.imageRenderedWidth = src.rows; //checked
    this.state.imageRenderedHeight = src.cols; //checked
    
    // Apply thresholding on src image to differentiate fore vs. background
    window.cv.cvtColor(src, src, window.cv.COLOR_RGBA2GRAY, 0);
    let threshold = Constants.SEGMENTATION_THRESHOLD_DICT[imageType] || 20;
    window.cv.threshold(src, src, threshold, 255, window.cv.THRESH_BINARY); 
    // could try adding window.cv.THRESH_OTSU after thresh_binary too, 
    // but doesn't work well with thin objects (eg. lines)

    let contours = new window.cv.MatVector();
    let hierarchy = new window.cv.Mat();

    window.cv.findContours(src, contours, hierarchy, window.cv.RETR_CCOMP, window.cv.CHAIN_APPROX_SIMPLE);
    // draw contours with random Scalar
    for (let i = 0; i < contours.size(); ++i) {
        let color = new window.cv.Scalar(Math.round(Math.random() * 255), Math.round(Math.random() * 255),
                                  Math.round(Math.random() * 255));
        // The "-1" denotes the thickness of contour lines, 
        // and negative numbers make it so that the interiors are drawn.
        window.cv.drawContours(dst, contours, i, color, -1, window.cv.LINE_8, hierarchy, 100);
    }

    const objectResults = this.findObjects(bgrDataArray, dst.data);
    const objectFeatureMap= objectResults[0];
    const objectColorIdArray = objectResults[1];
    console.assert(objectColorIdArray.length = src.rows * src.cols);
    // Uncomment to display this layer's segmentation result as debugging step. 
    // if (showSegmentation && imageType !== 'composite') {
    //   window.cv.imshow(displayId, dst);
    // }
    src.delete(); dst.delete(); contours.delete(); hierarchy.delete();

    this.state.loaded = true; 
    
    return [objectFeatureMap, objectColorIdArray];
  }

  // Converts RGB values to a hex value string.
  // Source: FelipeC 's answer at https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
  rgb_to_hex = (pixelValues) => {
    const red = pixelValues[0];
    const green = pixelValues[1];
    const blue = pixelValues[2];
    const rgb = (red << 16) | (green << 8) | (blue << 0);
    return '#' + (0x1000000 + rgb).toString(16).slice(1);
  }

  /* Returns two objects:
  - a dictionary that maps each contour color to its number of pixel,
  - an array where each coordinate indicates the contour color of that pixel. 
   */
  getContourColorDicts = (imageSegOutput) => {
    let contourColorToCount = {}; // color name to number of pixels with this contour color
    let pixelColorArray = [];
    for (let i = 0; i < imageSegOutput.length; i+=3) {
      const pixelValues = imageSegOutput.slice(i, i+3);
      const hexValue = this.rgb_to_hex(pixelValues);
      if (! contourColorToCount.hasOwnProperty(hexValue)) {
        contourColorToCount[hexValue] = 0;
      }
      contourColorToCount[hexValue] += 1; 
      pixelColorArray.push(hexValue);
    }
    return [contourColorToCount, pixelColorArray];
  }

  /*
    Creates an array where each element stores a few additional features:
    - the average pixel value for all the pixels
    - the size of the object (ie. total count of pixels belonging to this object)
   Note: all of these features base on the original objects. The object ids that get
   added as a result of neighbor expansion are ignored here. 
  */ 
  mapPixelToOtherFeatures = (
    objectIdToColors, 
    objectColorIdArray, 
    objectTotalValueDict, 
    contourColorToCount) => {

    let objectFeatureMap = {};

    for (let i = 0; i < objectColorIdArray.length; i++)  {
      const currentPixelObjectId = objectColorIdArray[i];
      if (! objectFeatureMap.hasOwnProperty(currentPixelObjectId)) {
        // If the current pixel's object id is not in the objectIdToColors dictionary,
        // then the current pixel is in the background,
        // so assign the "black" hex value as this pixel's "object color".
        const currentPixelObjectColorHex = objectIdToColors[currentPixelObjectId] || Constants.PIXEL_HEX_VALUE_BLACK;
        const currentObjectTotalCount = contourColorToCount[currentPixelObjectColorHex];
        // Calculate average for r,g,b values.
        const objectAvgValueR = 
          objectTotalValueDict[currentPixelObjectColorHex]["r"] / currentObjectTotalCount;
        const objectAvgValueG = 
          objectTotalValueDict[currentPixelObjectColorHex]["g"] / currentObjectTotalCount;
        const objectAvgValueB = 
          objectTotalValueDict[currentPixelObjectColorHex]["b"] / currentObjectTotalCount;
        
        objectFeatureMap[currentPixelObjectId] = {};
        objectFeatureMap[currentPixelObjectId][Constants.NAME_AVG_PIXEL] = this.state.openCVLib.averageRGB(objectAvgValueR,objectAvgValueG,objectAvgValueB);
        objectFeatureMap[currentPixelObjectId][Constants.NAME_OBJECT_SIZE] = currentObjectTotalCount;
      }
    }
    return objectFeatureMap;
  }

  /* 
    Returns two arrays:
    - an array for all pixels where each element stores the average pixel value
    of all pixels of the same object.
    - an array for all pixels where each element of the array
    indicates the object that this pixel belongs to. 

    0 denotes that the pixel is not in any prominent object.

    Neighbor expansion is performed before returning.
  */ 
  findObjects = (inputBgrDataArray, imageSegOutput) => {
    const contourColorsDicts = this.getContourColorDicts(imageSegOutput);
    const contourColorToCount = contourColorsDicts[0];
    const pixelColorArray = contourColorsDicts[1]; // this is 1D array (length = src.rows * src.cols)

    // An array where each element indicates the number id of the object this pixel belongs to.
    let objectColorIdArray = []; 
    // A dictionary that maps contour color to its object number id 
    let objectColorsToId = {};
    // A dictionary that maps object number id to this object's hex color from segmentation result
    let objectIdToColors = {};
    // A dictionary that maps object number id to a list of accumulated r,g,b values
    let objectTotalValueDict = {};

    // A dictionary that maps object id to the four end points of this object. 
    // This dictionary is useful for finding the midpoint of small objects,
    // and the midpoint is used later to fill this small object's neighbors with the same object id 
    // instead of 0. 
    let smallObjectIdToEndPoints = {};

    for (let i = 0; i < pixelColorArray.length; i++) {
      const currentPixelColorHex = pixelColorArray[i];
      // If the count of this contour color is above the threshold,
      // then we say that all pixels with this contour color is an object in the image. 
      if (contourColorToCount[currentPixelColorHex] > Constants.IMAGE_SEGMENTATION_NUM_OBJECT_THRESHOLD) {
        // Create a new object id for a color that has not been seen before. 
        if (! objectColorsToId.hasOwnProperty(currentPixelColorHex)) {
          const newKey = Object.keys(objectColorsToId).length+1;
          objectColorsToId[currentPixelColorHex] = newKey;
          objectIdToColors[newKey] = currentPixelColorHex; 

          // Creates an entry in smallObjectIdToEndPoints if the current object's size is smaller than star threshold.
          if (contourColorToCount[currentPixelColorHex] < Constants.OBJECT_SIZE_STAR_THRESHOLD) {
            smallObjectIdToEndPoints[newKey] = {
                "left" : Number.POSITIVE_INFINITY,
                "right" : 0,
                "up" : Number.POSITIVE_INFINITY,
                "below" : 0
              };
            }
        }
        const currentObjectId = objectColorsToId[currentPixelColorHex];
        objectColorIdArray.push(currentObjectId);

        // Create an entry for a new object in the rgba value dictionary.
        if (! objectTotalValueDict.hasOwnProperty(currentPixelColorHex)) {
          objectTotalValueDict[currentPixelColorHex] = {
            "r" : 0.0,
            "g" : 0.0,
            "b" : 0.0,
            "a" : 0.0
          }
        }

        // Accumulate r,g,b,a value.
        // Note that inputBgrDataArray has BGRA order
        objectTotalValueDict[currentPixelColorHex]["r"] += inputBgrDataArray[i*4+2];
        objectTotalValueDict[currentPixelColorHex]["g"] += inputBgrDataArray[i*4+1];
        objectTotalValueDict[currentPixelColorHex]["b"] += inputBgrDataArray[i*4];
        objectTotalValueDict[currentPixelColorHex]["a"] += inputBgrDataArray[i*4+3];

        // If the new object is smaller than the star threshold, 
        // Update the end points if needed.. 
        if (contourColorToCount[currentPixelColorHex] < Constants.OBJECT_SIZE_STAR_THRESHOLD) {
          // Find the 2D equivalent of the current index i
          let [rowCoord, colCoord] = this.convertToRowColCoordinate(i);

          // Update the end points if needed.
          if (rowCoord < smallObjectIdToEndPoints[currentObjectId]["left"]) {
            smallObjectIdToEndPoints[currentObjectId]["left"] = rowCoord;
          } else if (rowCoord > smallObjectIdToEndPoints[currentObjectId]["right"]) {
            smallObjectIdToEndPoints[currentObjectId]["right"] = rowCoord;
          }

          if (colCoord < smallObjectIdToEndPoints[currentObjectId]["up"]) {
            smallObjectIdToEndPoints[currentObjectId]["up"] = colCoord;
          } else if (colCoord > smallObjectIdToEndPoints[currentObjectId]["below"]) {
            smallObjectIdToEndPoints[currentObjectId]["below"] = colCoord;
          } 
          
        }

      } else {
        // The pixels here are considered "background" or not belonging to any particular object.
        objectColorIdArray.push(0);
        if (! objectTotalValueDict.hasOwnProperty(currentPixelColorHex)) {
          objectTotalValueDict[currentPixelColorHex] = {
            "r" : 0.0,
            "g" : 0.0,
            "b" : 0.0,
            "a" : 0.0
          }; 
        }

      }
    }
    console.assert(objectColorIdArray.length === this.state.imageRenderedHeight * this.state.imageRenderedWidth);
    // Commented this out because this seems to be doing a similar thing as neighbor detection,
    // but we can add this back in later, eg. with a smaller expansion margin/radius.
    //this.expandSmallObjects(smallObjectIdToEndPoints, objectColorIdArray);

    const objectFeatureMap = this.mapPixelToOtherFeatures(objectIdToColors, objectColorIdArray, objectTotalValueDict, contourColorToCount);
    return [objectFeatureMap, objectColorIdArray];
  }

  /* Converts an index from the 1D image array to its 2D equivalent of x,y coordinate. */
  convertToRowColCoordinate(i) {
    const x = i % this.state.imageRenderedWidth;
    const y = Math.floor(i / this.state.imageRenderedWidth); 
    return [x,y];
  }

  /* 
    Uses smallObjectIdToEndPoints to expand neighbors for small objects. 
    We do this by overwriting a neighbor that has an object id of 0 to have the small object's id.
    Currently unused.
    */
  // expandSmallObjects(smallObjectIdToEndPoints, objectColorIdArray) {
  //   for (let objectId of Object.keys(smallObjectIdToEndPoints)) {
  //     let endPoints = smallObjectIdToEndPoints[objectId];
  //     let midX = Math.floor((endPoints["right"] + endPoints["left"]) / 2);
  //     let midY = Math.floor((endPoints["up"] + endPoints["below"]) / 2);

  //     const size = this.size = ls.get("cursor-size") || Constants.CURSOR_NEIGHBOR_BOX_SIZE;
  //     for (var i = -size; i < size; i++) {
  //       for (var j = -size; j < size; j++) {
  //         const currX = Math.min(Math.max(midX + i, 0), this.state.imageRenderedWidth);
  //         const currY = Math.min(Math.max(midY + j, 0), this.state.imageRenderedHeight);
  //         const currIn1D = this.convertTo1DCoordiante(currX, currY);

  //         // Only update this neighbor's object ID if the neighbor doesn't already have an id.
  //         if (objectColorIdArray[currIn1D] === 0) {
  //           objectColorIdArray[currIn1D] = objectId;
  //         }
          
  //       }
  //     }
  //   }
  // }

  /* Convert a 2D coordinate back to its equivalent index in an 1D image array. */ 
  convertTo1DCoordiante(x,y) {
    return x + y * this.state.imageRenderedWidth;
  }

}

export default ImageSegmentation;
