// Find out the user session's OS
// Source: https://stackoverflow.com/questions/9514179/how-to-find-the-operating-system-details-using-javascript 
let userAgent = window.navigator.userAgent,
    platform = window.navigator.platform,
    macosPlatforms = ['Macintosh', 'MacIntel', 'MacPPC', 'Mac68K'],
    windowsPlatforms = ['Win32', 'Win64', 'Windows', 'WinCE'],
    iosPlatforms = ['iPhone', 'iPad', 'iPod'],
    osName = null;
if (macosPlatforms.indexOf(platform) !== -1) {
  osName = 'Mac OS';
} else if (iosPlatforms.indexOf(platform) !== -1) {
  osName = 'iOS';
} else if (windowsPlatforms.indexOf(platform) !== -1) {
  osName = 'Windows';
} else if (/Android/.test(userAgent)) {
  osName = 'Android';
} else if (/Linux/.test(platform)) {
  osName = 'Linux';
}

/*
 * This file contains all constants used for all the js files
 */
export const Constants = {
  
  NOTE_ATTACK_DURATION_SECONDS: 0.2, // time in seconds for the length of each note attack
  STAR_NOTE_ATTACK_DURATION_SECONDS: 0.5, // time in seconds for the length of a note attack for a small star
  EDGE_NOTE_ATTACK_DURATION_SECONDS: 0.2, // time in seconds for the length of each note attack for edges

  SOUND_DISTANCE_OFFSET_MILLIS: 1000, // time in milliseconds for the distance between two note attacks
  EDGE_SOUND_DISTANCE_OFFSET_MILLIS: 400, // time in milliseconds for the distance between two edge note attacks

  // Playback rate to set a Tone.Player to to play a note at a certain distance above the base URL.
  // Reference: https://www.math.uwaterloo.ca/~mrubinst/tuning/12.html
  PlAYBACK_RATE_MAJOR_SECOND: 9/8,  // eg. the playback rate to play a major second above the base URL's note. 
  PlAYBACK_RATE_MINOR_SECOND: 16/15,
  PlAYBACK_RATE_MINOR_THIRD: 6/5,
  PlAYBACK_RATE_MAJOR_THIRD: 5/4,
  PlAYBACK_RATE_TRITONE: 7/5,
  PlAYBACK_RATE_PERFECT_FOURTH: 4/3,
  PlAYBACK_RATE_PERFECT_FIFTH: 3/2,
  PlAYBACK_RATE_MINOR_SIXTH: 8/5,
  PlAYBACK_RATE_MAJOR_SIXTH: 5/3,
  PlAYBACK_RATE_MAJOR_SEVENTH: 15/8,
  PlAYBACK_RATE_OCTAVE: 2,
  PlAYBACK_RATE_UNISON: 1, // play the note from the base URL

  VOLUME_RANGE: 20, // Range for potential note volume

  // Parameters used in OpenCV edge detector
  EDGE_DETECTION_KERNEL_SIZE: 3,
  EDGE_DETECTION_THRESHOLD_1: 60,
  EDGE_DETECTION_THRESHOLD_2: 250,

  OPEN_CV_LIB_WHITE_INDEX : 1,
  OPEN_CV_LIB_BLACK_INDEX : 0,
   
  PIXEL_VALUE_WHITE : 255, // A pixel value of 255 is white.
  PIXEL_VALUE_BLACK : 0, // A pixel value of 0 is black. 

  // Hex value for black, this is the object color for all background pixels
  // ie. pixels that don't belong to a prominent object. 
  PIXEL_HEX_VALUE_BLACK : "#000000", 

  // Threshold for the number of pixels an object needs to have to be 
  // recognized as an actual object instead of noise from the segmentor. 
  IMAGE_SEGMENTATION_NUM_OBJECT_THRESHOLD : 10,

  NUM_INSTRUMENTS : 15, // Total number of instruments that we use in instrumentList,
  STAR_INSTRUMENT_NAME: "xylophone", // the name of the instrument that is assigned to play the sound for small stars
  BACKGROUND_INSTRUMENT_NAME: "contrabass", // the name of the instrument that is assigned for the image's black background
  INSTRUMENT_ID_PIANO : 15, // The id for piano in instrumentList
  INSTRUMENT_ID_XYLOPHONE : 14, // The id for xylophone in instrumentList
  INSTRUMENT_ID_BASS : 1, // The id for contrabass in instrumentList

  // Names of keys in objectFeatureMap, returned from ImageSegmentation
  NAME_RED : "rValue",
  NAME_GREEN :"gValue",
  NAME_BLUE : "bValue",
  NAME_ALPHA : "aValue",
  NAME_AVG_PIXEL : "avgObjectPixelValue",
  NAME_OBJECT_ID : "objectId",
  NAME_EDGE : "isEdge",
  NAME_OBJECT_SIZE : "objectSize",

  OBJECT_SIZE_STAR_THRESHOLD : 100,

  // number of pixel neighbors that are checked to see if the current pixel contains an edge in its neighbors.
  EDGE_DETECTION_BOX_SIZE: 5,
  STAR_NEIGHBOR_BOX_SIZE: 5,
  CURSOR_NEIGHBOR_BOX_SIZE: 5,

  IMAGE_SCAN_DIRECTION_HORIZONTAL: "horizontal",
  IMAGE_SCAN_DIRECTION_VERTICAL: "vertical",

  // Names of different image layer types. 
  IMAGE_TYPE_XRAY : 'xray',
  IMAGE_TYPE_OPTICAL : 'opt' || 'optical',
  IMAGE_TYPE_INFRARED : 'ir',
  IMAGE_TYPE_COMPOSITE: 'composite',
  IMAGE_TYPE_COMPOSITE_ONLY: 'composite-only',

  // Maps each image layer type to the threshold parameter for image segmentation.
  // TODO: these values should be investigated more after experimentation
  SEGMENTATION_THRESHOLD_DICT: {
    'xray' : 40,
    'optical' : 40,
    'ir': 40,
    'radio': 40
  },

  // For each image layer type, provide a group of selected instruments
  // that are used to portray this image layer type. 
  // TODO: these values should be investigated more after experimentation
  LAYER_INSTRUMENT_LIST : {
    // For example, we can decide to only use string instruments to represent x-ray layers.
    // Here, the least bright pixels in x-ray layer are mapped to instrument id 1, which is contrabass.
    // Similarly, the middle bright pixels are mapped to cello, and brightest pixels in x-ray layers
    // are mapped to violin. 
    'xray' : {
      1 : 3, // cello
      2 : 11, // violin
    },
    'optical' : {
      1 : 5, // bassoon
      2 : 9, // clarinet
      3 : 12, // flute 
    },
    'ir': {
      1 : 3, // cello
      2 : 11, // violin
    },
    'radio': {
      1 : 4, // trombone
      2 : 6, // french horn
      3: 7 // trumpet
    },
    'composite-only': {
      // this is for images with no sub-layers
      1 : 8, // saxophone
      2 : 9 // clarinet
    }
  },
  TEST_ONLY_INSTRUMENT_NAME: "harmonium", // the name of instrument used when testing on an image with only one instrument
  TEST_ONLY_INSTRUMENT_ID: 10,

  CREATE_HAPTIC_RESPONSE_FLAG: osName === 'Android', 
  IS_MOBILE_SESSION: osName === 'iOS' || osName === 'Android',

  HOME_PAGE_INITIAL_PROMPT: `
    Please use left and right arrow keys to browse images,
    and press Tab key to listen to the selected image's title.
    Press Enter key to enter the selected image's page.
  `,
  IMAGE_PAGE_START_INSTRUCTION: `
    Welcome. When you are ready to enter the image page, please click the
    Start Exploring button.
    After that, you can either use keyboard or the mouse to move around in the image.
    When the cursor is inside the image, you will begin to hear sounds.
  `
  ,
  IMAGE_PAGE_START_INSTRUCTION_MOBILE: `
    Welcome. When you are ready to enter the image page, please tap the
    Start Exploring button. After that, you can move around in the image using
    your finger. When your finger is inside the image, you will begin to hear sounds.
    Be sure to unmute your device!
  `, 
  IMAGE_PAGE_START_CONFIRMATION: `
    You are all set to start exploring. 
    Press Tab to listen to the image description.
    Press g key for a guide on keyboard commands.
  `,
  IMAGE_PAGE_START_CONFIRMATION_MOBILE: `You are all set to start exploring.`,
  IMAGE_PAGE_KEYBOARD_GUIDE:`
    Guide for keyboard commands:
    Command-B / Control-B: place cursor at the center of the image.
    Tab: listen to image description.
    Four arrow keys: move the cursor around in the image.
    Command-I / Control-I: listen to an overview of the image.
    g key: listen to this keyboard command guide.`,
  ENTER_IMAGE_CENTER_COMMAND: "b",
  SCAN_IMAGE_COMMAND: "i"
};
