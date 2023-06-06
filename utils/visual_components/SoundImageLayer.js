import { Constants } from "../data_processing/Constants";
import ImageSegmentation from "../data_processing/ImageSegmentation";
import { Dimensions, Image } from "react-native";
import RNFetchBlob from "rn-fetch-blob";

/** 
 * Models one layer of image for the main sound image.
 * Calls functions from Image Segmentation to construct a dictionary of image features for each pixel.
 */ 
export default class SoundImageLayer {
  constructor(layerName, soundEffects) {
    this.resolveAssetSource = require('react-native/Libraries/Image/resolveAssetSource');
    // this.downloadAssetSource = require('react-native-opencv3/downloadAssetSource');
    this.layerDisplayname = layerName;
    this.layerName = layerName;
    this.soundEffectsInfo = soundEffects;
    this.imageFeatureArray = [];
    this.objectFeatureMap = {};
    this.imageRenderedWidth = 0;
    this.imageRenderedHeight = 0;
  }

  build(src, image=null, canvas=null, displayResults=false, displayRef=null, altText) {
    this.displayRef = displayRef
    this.displayResults = displayResults
    if (image != null) {
      this.image = image
    } else {
      this.image = {};
      this.image.src = src;
    }
    this.image.crossOrigin = "anonymous";
    this.image.alt = altText;
    // if (canvas !== null) {
    //   this.canvas = canvas
    // } else {
    //   this.canvas = new Canvas()
    // }
    // this.canvas.style.backgroundImage = "url(" + src + ")";
    this.loadHelper();
  };

  /* Calls image segmentation and reconfigure the results into one image feature array. */ 
  loadHelper = async () => {
    // this.ctx = this.canvas.getContext("2d");
    // this.ctx.canvas.width = this.image.width;
    // this.ctx.canvas.height = this.image.height;

    // // Clear the canvas from previous layer.
    // this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    // // Image dimensions and canvas dimensions are based on the image's intrinsic size here.
    // this.ctx.drawImage(this.image, 0, 0, this.image.width, this.image.height);

    // const bgrDataArray = this.getResizedImageData();
    // Don't resize?
    // let imreadImage = RNCv.invokeMethod('imread', {"p1": this.image.src});
    // const bgrDataArray = imreadImage.data;

    // const imagesrc = Image.resolveAssetSource(this.image.src);
    // console.log(imagesrc);
    // const sourceuri = Image.resolveAssetSource(this.image.src).uri;

    // const sourceFile = await this.downloadAssetSource(this.image.src);
    // const srcMat = await RNCv.imageToMat(sourceFile);
    // let srcMat = await new Mat(864, 864, CvType.CV_8UC4).init();
    // const srcMat = await new Mat().init()
    // console.log(srcMat);
    // const bgrDataArray = await RNCv.getMatData(srcMat, 0, 0);
    // console.log("bgrDataArray length: " + bgrDataArray.length);

    // MISSION:
    // 1. Figure out what *Mat* is and how to use it to get the image data (bgrDataArray)
    // 2. If all else fails, find another way to get bgrDataArray from the image
    // 3. Does startImageSeg actually need bgrDataArray?

    // This data array is used in segmentation, so whichever dimension is used here 
    // needs to match the image that is used for segmentation
    // let [objectFeatureMap, objectColorIdArray] = 
    //   this.startImageSeg(bgrDataArray, this.imageRenderedWidth, this.imageRenderedHeight);
    // this.objectFeatureMap = objectFeatureMap
    // console.assert(objectColorIdArray.length * 4 === bgrDataArray.length);
    // console.assert(objectColorIdArray.length === this.imageRenderedWidth * this.imageRenderedHeight);

    let imagePath = null;
    RNFetchBlob.config({fileCache: true})
      .fetch("GET", this.image.src)
      .then(resp => {
        imagePath = resp.path();
        return resp.readFile("base64");
      })
      .then(imageAsBase64 => {
        console.log("Begin segmentation")
        const imageSegmentor = new ImageSegmentation();
        let [objectFeatureMap, objectColorIdArray] = imageSegmentor.segmentNew(imageAsBase64);
      });

    // For each pixel, create an image feature object.
    // This object contains the rgba values of the original pixel,
    // as well as image segmentation info such as object id number
    // and the average pixel value of this object.
    let objectArrayIndex = 0;
    for (let i = 0; i < bgrDataArray.length; i += 4) {
      let currentPixelFeature = {};
      const currentObjectId = objectColorIdArray[objectArrayIndex];
      currentPixelFeature[Constants.NAME_BLUE] = bgrDataArray[i];
      currentPixelFeature[Constants.NAME_GREEN] = bgrDataArray[i + 1];
      currentPixelFeature[Constants.NAME_RED] = bgrDataArray[i + 2];
      currentPixelFeature[Constants.NAME_ALPHA] = bgrDataArray[i + 3];
      currentPixelFeature[Constants.NAME_OBJECT_ID] = currentObjectId;
      objectArrayIndex += 1;
      this.imageFeatureArray.push(currentPixelFeature);
    }
    console.assert(objectArrayIndex === objectColorIdArray.length);
    console.assert(this.imageFeatureArray.length === this.imageRenderedWidth * this.imageRenderedHeight);
  };

  downloadImageAsBase64 = async (url) => {
    let imagePath = null;
    RNFetchBlob.config({fileCache: true})
      .fetch("GET", url)
      .then(resp => {
        imagePath = resp.path();
        return resp.readFile("base64");
      })
      .then(base64Data => {
        return base64Data;
      });
  };

  /*
   * The composite layer can either be called "composite" for images with sub-layers
   * or "composite-only" for images with only one layer in total.
   */ 
  isCompositeLayer() {
    return this.layerDisplayname === Constants.IMAGE_TYPE_COMPOSITE || this.layerDisplayname === Constants.IMAGE_TYPE_COMPOSITE_ONLY; 
  }

  /* Calls Image Segmentation and returns the segmentation result. */
  startImageSeg = (bgrDataArray, soundImageRenderedWidth, soundImageRenderedHeight) => {
    // Uncomment to display each layer's images as debugging step. 
    // if (this.displayRef && this.displayResults && ! this.isCompositeLayer()) {
    //   this.createDisplayCanvas();
    // }
    // console.log("Begin segmentation")
    // const imageSegmentor = new ImageSegmentation();
    // return imageSegmentor.segment(
    //   this.canvas, this.layerName, bgrDataArray, this.displayResults, this.layerDisplayname,
    //   soundImageRenderedWidth, soundImageRenderedHeight);
  };

  /* 
   * Resize the main image according to the image's rendered size on screen
   * and return the BGR array. 
   * The reason this resizing is necessary is because, when the image is drawn
   * on the canvas, the original image's intrinsic dimensions are stored as the 
   * canvas' data even though the rendered image could be of a different size. 
   * We need to get the resized image's data and use that data for object segmentation
   * and other manipulations.
   */ 
  getResizedImageData() {
    // Retrieve the sound image's rendered size on the screen.
    // This dimension is likely to be different from the image's intrinsic size,
    // because the rendered dimension depends on the current device's screen size.
    const soundImageRenderedWidth = Dimensions.get("window").width - 50;
    const soundImageRenderedHeight = Dimensions.get("window").height / 1.3;
    this.imageRenderedHeight = soundImageRenderedHeight;
    this.imageRenderedWidth = soundImageRenderedWidth;

    // Use OpenCV to resize original image to the rendered size 
    // Documentation says channels are stored in BGR order 
    // but there are 4 entries per pixel, so assuming it's BGRA for now
    // which seems like a reasonable guess when I print out some sample values.
    // let resizedImage = RNCv.invokeMethod('imread', {"p1": this.ctx.canvas});

    let resizedImage = RNCv.invokeMethod('imread', {"p1": this.image});
    // let resizedImage = window.cv.imread(this.ctx.canvas);
    const renderedSize = new CvSize(soundImageRenderedWidth, soundImageRenderedHeight);
    // const renderedSize = new window.cv.Size(soundImageRenderedWidth, soundImageRenderedHeight);

    RNCv.invokeMethod('resize', {"p1": resizedImage, "p2": resizedImage, "p3": renderedSize, "p4": 0, "p5": 0, "p6": Imgproc.INTER_AREA});
    // window.cv.resize(resizedImage, resizedImage, renderedSize, 0, 0, window.cv.INTER_AREA);
    console.assert(resizedImage.data.length === 4 * soundImageRenderedWidth * soundImageRenderedHeight);
    
    return resizedImage.data; 
  }

  getImageRenderedSize() {
    return [this.imageRenderedWidth, this.imageRenderedHeight];
  }

  /* Returns the data for pixel at (x,y) from imageFeatureArray. */
  getPixelData(x,y) {
    return this.imageFeatureArray[
      x + y * this.imageRenderedWidth
    ];
  }

  /* Retrieves the rgba values of a pixel given its x,y location */
  getRGBColorsOfPixelAt(x, y) {
    const data = this.getPixelData(x,y);
    if (data) {
      return [
        data[Constants.NAME_RED],
        data[Constants.NAME_GREEN],
        data[Constants.NAME_BLUE],
        data[Constants.NAME_ALPHA],
      ];
    } else {
      return null;
    }
  }

  /* Retrieves the object id number of a pixel given its x,y location */
  getObjectIdOfPixelAt(x, y) {
    const data = this.getPixelData(x,y);
    if (data) {
      return data[Constants.NAME_OBJECT_ID];
    } else {
      return null;
    }
  }

  /* Retrieves the object size of a pixel given its x,y location */
  getObjectSizeOfPixelAt(x, y) {
    const data = this.getPixelData(x,y);
    if (data) {
      return this.objectFeatureMap[data[Constants.NAME_OBJECT_ID]][
        Constants.NAME_OBJECT_SIZE
      ];
    } else {
      return null;
    }
  }

  /* Retrieves the average object pixel value of a pixel given its x,y location */
  getAverageColorAt(x, y) {
    const data = this.getPixelData(x,y);
    if (data) {
      return this.objectFeatureMap[data[Constants.NAME_OBJECT_ID]][
        Constants.NAME_AVG_PIXEL
      ];
    } else {
      return null;
    }
  }

  /* 
   * Returns the grayscale value according to an array of rgb values.
   * Using the formula from OpenCV documentation:
   * https://docs.opencv.org/3.4/de/d25/imgproc_color_conversions.html  
   */
  getGrayscaleValue(rgbColorArray) {
    const [red, green, blue, alpha] = rgbColorArray;
    return 0.299 * red + 0.587 * green + 0.114 * blue;
  }

  /*
    Checks if a pixel's grayscale value is above a threshold.
    This is used to determine whether this pixel should be a red or blue stripe.
  */
  isValidPixel(rgbColorArray) {
    const grayscaleValue = this.getGrayscaleValue(rgbColorArray);
    return grayscaleValue > 30;
  }

  /* Picks an instrument according to the pixel at location (x,y) for the given layer. */
  chooseInstrumentForPixel(x, y) {
    if (x < 0 || x >= this.imageRenderedWidth || y < 0 || y >= this.imageRenderedHeight) {
      return [0,0];
    }
    let chosenInstrumentId;
    let size = this.getObjectSizeOfPixelAt(x, y);
    let avgPixel = this.getAverageColorAt(x, y);
    if (size == null || avgPixel == null) {
      return [0,0];
    }
    if (0 < size && size < Constants.OBJECT_SIZE_STAR_THRESHOLD) {
      // Uses xylophone if small star-like object is found
      chosenInstrumentId = Constants.INSTRUMENT_ID_XYLOPHONE;
    } else if (avgPixel < 10) {
      chosenInstrumentId = Constants.INSTRUMENT_ID_BASS;
    } else if (!this.soundEffectsInfo["fullInstruments"]) {
      chosenInstrumentId = Constants.TEST_ONLY_INSTRUMENT_ID;
    } else {
      // Selects instrument by brightness
      // Each image type has a designated group of instrument IDs to choose from.
      // Calculate which range from this designated group the current pixel's brightness falls into,
      // and then use the INSTRUMENT_LIST to map this range into the actual instrument ID
      // (as arranged in instrumentList.js).
      let numInstrumentsForImageType = Object.keys(
        Constants.LAYER_INSTRUMENT_LIST[this.layerName]
      ).length;
      chosenInstrumentId =
        Constants.LAYER_INSTRUMENT_LIST[this.layerName][
          Math.ceil((avgPixel / 255) * numInstrumentsForImageType)
        ];
    }
    return [chosenInstrumentId, avgPixel];
  }

  /* Sets up containers and elements for the debugging images and layers. */ 
  createDisplayCanvas() {
    const displayLayerNameElement = document.createElement("div");
    displayLayerNameElement.innerHTML = this.layerDisplayname;
    const openCvDisplayCanvas = document.createElement("canvas");
    openCvDisplayCanvas.id = this.layerDisplayname;
    openCvDisplayCanvas.classList.add("segment-result-canvas");
    const displayImage = this.image.cloneNode(true)
    displayImage.id = "image-" + this.layerDisplayname;
    this.displayRef.appendChild(displayImage);
    this.displayRef.appendChild(displayLayerNameElement);
    this.displayRef.appendChild(openCvDisplayCanvas);
  }
}
