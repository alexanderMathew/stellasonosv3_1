import React from "react";
import {
  Animated,
  View,
  StyleSheet,
  PanResponder,
  Modal,
  Alert,
  Text,
  ImageBackground,
  Pressable,
  Dimensions
} from "react-native";

// import Synthesizer from "../sonic_components/Synthesizer";
import Haptic from "../sonic_components/Haptic";
import instrumentList from "../sonic_components/instrumentList";
import { Constants } from "../data_processing/Constants";
import SoundImageLayer from "./SoundImageLayer";

/**
 * This class models a sonified image. Some main functions:
 * - Constructs different Sound Image Layers that represent the main image and its sub-layers.
 * - Use the image features received from each layer to the Synthesizer to play sounds accordingly.
 * - Draws a circle following user's cursor location; uses red/blue to differentiate between bright/dark pixels.
 */


class SoundImage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentPixelObjectId: 0,
      horizontal: false,
      synthMap: {},
      layers: {}, // stores the SoundImageLayer object for each layer
      baseLayer: null,
      showSoundInfo: false,
      showLocation: false
    };
    this.cursorSize = Constants.CURSOR_NEIGHBOR_BOX_SIZE;
    // When the horizontal and vertical sizes are not the same,
    // the cursor can be made into an ellipse instead of a circle. 
    this.cursorSizeHorizontal = this.cursorSize;
    this.cursorSizeVertical = this.cursorSize;

    this.imageRef = React.createRef();
    this.canvasRef = React.createRef();
    this.openCvRef = React.createRef();
    this.currKeys = React.createRef();
    this.commandEntered = React.createRef();
    this.withinImage = React.createRef();
    this.currX = React.createRef();
    this.currY = React.createRef();
    this.currentlyScanning = React.createRef();
    this.currX.current = 0;
    this.currY.current = 0;
    this.commandEntered.current = false;
    this.withinImage.current = false;
    this.currentlyScanning.current = false;
    this.currKeys.current = "";
    this.isCursorOnEdge = false;
    this.hapticTools = {}; // Each image layer has its own haptic tool
  }

  componentDidMount() {
    const layers = {}
    for (const layer of this.props.layers) {
      // TODO: make this more general later. Right now there are only 4 possible
      // layer names.
      let layerName = layer["layer"];
      if (!["xray", "optical", "ir", "radio"].includes(layerName)) {
        continue; 
      }
      layers[layerName] = new SoundImageLayer(layerName, this.props.soundEffects);
      layers[layerName].build(layer.src, null, null, true, this.openCvRef.current, this.props.description);
      this.hapticTools[layerName] = new Haptic(this.props.soundEffects);
    }

    let baseLayer; 
    // If the image has no qualified sub-layers, pass in "composite-only" 
    // as the main layer's name so that the main composite layer 
    // is used to create sound output.
    if (Object.keys(layers).length === 0) {
      baseLayer = new SoundImageLayer(Constants.IMAGE_TYPE_COMPOSITE_ONLY, this.props.soundEffects);
      layers[Constants.IMAGE_TYPE_COMPOSITE_ONLY] = baseLayer;
      this.hapticTools[Constants.IMAGE_TYPE_COMPOSITE_ONLY] = new Haptic(this.props.soundEffects);
    } else {
      baseLayer = new SoundImageLayer(Constants.IMAGE_TYPE_COMPOSITE, this.props.soundEffects);
    }

    baseLayer.build(this.props.src, this.imageRef.current, this.canvasRef.current, true, this.openCvRef.current, this.props.description);
    this.setState({
      layers: layers,
      baseLayer: baseLayer
    });
  }

  scanImage = async () => {
    this.currX.current = 0;
    this.currY.current = 0;
    this.continueSound = true;
    // Long, thin cursor for horizontal scans
    if (!this.currentlyScanning.current) {
      // Only stretch the cursor size one time, regardless of how many
      // times the start scanning keystroke is pressed.
      this.updateCursorDimensions(Constants.IMAGE_SCAN_DIRECTION_HORIZONTAL);
    }
    this.currentlyScanning.current = true;
    await this.continueScan();
  }

  /*
   * Modify cursor's horizontal or vertical dimensions to sktretch or contract it. 
   */ 
  updateCursorDimensions(direction) {
    if (direction == Constants.IMAGE_SCAN_DIRECTION_VERTICAL) {
      this.cursorSizeHorizontal *= 3;
    } else if (direction == Constants.IMAGE_SCAN_DIRECTION_HORIZONTAL) {
      this.cursorSizeVertical *= 3;
    }
  }

  revertCursorDimension() {
    this.cursorSizeHorizontal = this.cursorSize;
    this.cursorSizeVertical = this.cursorSize;
  }

  /*
   * Plays sound based on the cursor's box of neighbors.
   * Loop through all the layers (exclusing the base layer "composite" layer,
   * because only the individual layers should determin what sounds get played.)
   */
  async soundFromCursorVicinity(x, y) {
    let synthsToPlay = {}; 
    const cursorHorizontalRatio = this.getCursorLocationHorizontalRatio(); 
    for (let [layerName, layer] of Object.entries(this.state.layers)) {
      // Accumulate the total number of pixels that belong to an object.
      let totalNumPixelWithObject = 0; 
      let instrumentsForThisLayer = new Set(); // stores instrument ids for this layer
      let triggerHaptic = false; // flag that decides whether haptic response is triggered for the current cursor's location
      for (let i = -this.cursorSizeHorizontal; i < this.cursorSizeHorizontal; i++) {
        for (let j = -this.cursorSizeVertical; j < this.cursorSizeVertical; j++) {       
          let [chosenInstrumentId, avgPixel] = layer.chooseInstrumentForPixel(
            x + i,
            y + j
          );
          // If chosenInstrumentId is returned to be 0,
          // then the (x+i, y+j) location is outside the image.
          if (chosenInstrumentId > 0) {
            instrumentsForThisLayer.add(chosenInstrumentId);
            const distance = Math.sqrt(i ** 2 + j ** 2);
            if (chosenInstrumentId != Constants.INSTRUMENT_ID_BASS) {
              totalNumPixelWithObject += 1;
            }
            synthsToPlay[chosenInstrumentId] = {
              avgPixel: avgPixel,
              distance: distance,
              horizontalRatio: cursorHorizontalRatio,
              onEdge: false // placeholder, updated below
            };
          }
          // Only trigger haptic feedback when cursor is on an object instead of in the background
          if (chosenInstrumentId != 0 && chosenInstrumentId != Constants.INSTRUMENT_ID_BASS) {
            triggerHaptic = true; 
          }
        }
      }

      if (triggerHaptic) {
        this.hapticTools[layerName].start(layerName);
      } else {
        await this.hapticTools[layerName].stop();
      }

      // If the total number of pixels that belong to any object is less than 50%
      // of the total number of pixels within the cursor, this cursor is considered
      // to be at an edge location. 
      // If isCursorOnEdge is being flipped, set the crossingEdge flag to true 
      // so that the synths currently playing will be stopped and get restarted to 
      // reflect the edge status. 
      const cursorArea = Math.PI * this.cursorSizeHorizontal * this.cursorSizeVertical;
      const objectPixelRatio = totalNumPixelWithObject / cursorArea;
      if (objectPixelRatio < 0.5 && objectPixelRatio > 0) {
        for (let instrumentId of instrumentsForThisLayer) {
          if (instrumentId !== Constants.INSTRUMENT_ID_XYLOPHONE) {
            synthsToPlay[instrumentId]['onEdge'] = true;
          }
        }
      }   
    }

    // Stops the other previously playing synths first.
    // Also, if the a synth is currently playing but the updated sound
    // requires a new note, stop this synth too. 
    for (let instrumentId in this.state.synthMap) {
      if (!synthsToPlay.hasOwnProperty(instrumentId) || 
        !this.state.synthMap[instrumentId].isSameNote(synthsToPlay[instrumentId])) {
        await this.state.synthMap[instrumentId].stopPlayer();
      }
    }

    // Begins playing the sound in a loop (this loop is ended separately)
    for (let instrumentId of Object.keys(synthsToPlay)) {
      const chosenInstrumentSynth = this.state.synthMap[
        instrumentId.toString()
      ];
      await chosenInstrumentSynth.startPlayer(synthsToPlay[instrumentId]);
    }
  }

  /*
   * Turn off haptic tool for each image layer.
   */ 
  async stopAllHapticResponse() {
    for (const [layerName, layerHapticTool] of Object.entries(this.hapticTools)) {
      await layerHapticTool.stop();
    }
  }

  /* 
   * Calculate what percentage is the cursor's location relative to left edge.
   * Adjust this ratio onto a [-1, 1] scale so that the ratio aligns with the 
   * scale that the panner uses in the synths. 
   */ 
  getCursorLocationHorizontalRatio() {
    const [imageRenderedWidth, imageRenderedHeight] = this.state.baseLayer.getImageRenderedSize(); 
    const ratio = (1.0) * this.currX.current / imageRenderedWidth; // this result is in [0, 1] range.
    const adjustedRatio = ratio * 2 - 1;
    return Math.max(-1, Math.min(1, adjustedRatio)); // making sure the range is [-1, 1]...
  }

  /*
   * Gets x and y, the coordinate location of the item within the canvas's context
   * (i.e., for the top left corner of the canvas, x = 0 and y = 0)
   */
  getXY(e) {
    let offsets = this.state.baseLayer.ctx.canvas.getBoundingClientRect();
    let x = e.clientX || e.screenX;
    let y = e.clientY || e.screenY;
    if (!x && e.changedTouches[0]) {
      x = e.changedTouches[0].pageX;
      y = e.changedTouches[0].pageY;
    }
    return [Math.floor(x - offsets.left), Math.floor(y - offsets.top)];
  }

  /*
   * Checks if the coordiante offset (i,j) leads to a point that
   * lies inside the boundary that is dictated by the
   * cursor dimensions. Check by the equation for an ellipse. 
   */ 
  isWithinCursorBoundary(i,j) {
    return (i ** 2 / (this.cursorSizeHorizontal ** 2)) +
      (j ** 2 / (this.cursorSizeVertical ** 2)) <= 1;
  }

  /* Draw a circle around the cursor. */
  drawCursorCircle(x, y) {
    if (this.state.baseLayer == null)
      return;
    this.currX.current = x;
    this.currY.current = y;
    this.state.baseLayer.ctx.clearRect(
      0,
      0,
      this.state.baseLayer.ctx.canvas.width,
      this.state.baseLayer.ctx.canvas.height
    );

    for (let i = -this.cursorSizeHorizontal; i < this.cursorSizeHorizontal; i++) {
      for (let j = -this.cursorSizeVertical; j < this.cursorSizeVertical; j++) {
        if (!this.isWithinCursorBoundary(i,j)) {
          continue;
        }
        let rgb = this.state.baseLayer.getRGBColorsOfPixelAt(x + i, y + j, this.state.baseLayer);
        if (rgb) {
          // Draw a blue vs. red stripe based on brightness of the current pixel.
          const isValidPixel = this.state.baseLayer.isValidPixel(rgb);
          const context = this.state.baseLayer.ctx;
          context.fillStyle = isValidPixel ? "red" : "blue";
          context.beginPath();
          context.fillRect(x + i, y + j, 1, 1);
          context.closePath();
          context.stroke();
        }
      }
    }
  }

  continueSound = true;
  /* The function that gets called whenever the cursor moves. */
  imageHover = async (e) => {
    this.currentlyScanning.current = false;
    if (!this.state.baseLayer.ctx) {
      return;
    }
    const [x, y] = this.getXY(e);
    // Revert cursor size into what is set by the cursor size picker
    // (or the default one), because the cursor size might have changed
    // during scan line overview.
    this.revertCursorDimension();
    this.drawCursorCircle(x, y);
    if (!this.continueSound) return;
    await this.soundFromCursorVicinity(x, y);
  };

  showLocation = () => {
    this.setState({
      showLocation: !this.state.showLocation
    })
  }

  render() {
    const xPadding = 45;

    // calculating actual width and height of touch area
    const xMax = Dimensions.get("window").width / 2 - xPadding;
    const yMax = Dimensions.get("window").height / 6 + 125;

    // update current x and y values in the state for later
    this.props.pan.x.addListener(({ value }) => {
      this.props.setCurrentX(value);
    });
    this.props.pan.y.addListener(({ value }) => {
      this.props.setCurrentY(value);
    });
    const handleX = (delta) => {
      var newX =
        this.props.currentX + delta > xMax
          ? xMax
          : this.props.currentX + delta < -xMax
          ? -xMax
          : this.props.currentX + delta;
      this.props.pan.setValue({ x: newX, y: this.props.currentY });
    };
    const handleY = (delta) => {
      var newY =
      this.props.currentY + delta > yMax
          ? yMax
          : this.props.currentY + delta < -yMax
          ? -yMax
          : this.props.currentY + delta;
      this.props.pan.setValue({ x: this.props.currentX, y: newY });
    };

    return (
      <View style={styles.container}>
        {/* Preventing the dot from going out of bounds       */}
        <Animated.View
          style={{
            transform: [
              {
                translateX: this.props.pan.x.interpolate({
                  inputRange: [-xMax, xMax],
                  outputRange: [-xMax, xMax],
                  extrapolate: "clamp",
                }),
              },
              {
                translateY: this.props.pan.y.interpolate({
                  inputRange: [-yMax, yMax],
                  outputRange: [-yMax, yMax],
                  extrapolate: "clamp",
                }),
              },
            ],
          }}
          {...this.props.panResponder.panHandlers}
        >
          <View style={styles.circle} />
        </Animated.View>
        <View
          style={styles.imageContainer}
          onStartShouldSetResponder={() => true}
          onResponderMove={(event) => {            
            this.props.pan.setValue({
              x: event.nativeEvent.locationX - xMax - 20,
              y: event.nativeEvent.locationY - yMax - 20,
            });
            console.log(event.nativeEvent.pageX, event.nativeEvent.pageY,
              event.nativeEvent.locationX, event.nativeEvent.locationY, yMax, xMax,  );
          }}
        >
          <ImageBackground
            style={styles.tinyLogo}
            source={{ uri: this.props.src }}
          ></ImageBackground>
        </View>
      </View>
    );
  }
}

export default SoundImage;


const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  titleText: {
    fontSize: 14,
    lineHeight: 24,
    fontWeight: "bold",
  },
  circle: {
    height: 40,
    width: 40,
    backgroundColor: "blue",
    borderRadius: 50
  },
  imageContainer: {
    width: Dimensions.get("window").width - 50,
    height: Dimensions.get("window").height / 1.3,
    backgroundColor: "#000",
    margin: 0,
    zIndex: -1,
    elevation: -1,
    position: "absolute",
  },
  tinyLogo: {
    flex: 1,
    width: null,
    height: null,
    margin: 0,
    maxHeight: "100%",
    maxWidth: "100%",
  },
  absolute: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },

  toolBar: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    width: 350,
    paddingBottom: 30,
  },

  modalView: {
    margin: 20,
    backgroundColor: "white",
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 2.5,
    shadowRadius: 10,
    elevation: 10,
  },
  button: {
    padding: 5,
    elevation: 2,
    marginTop: 0,
  },
  buttonClose: {
    backgroundColor: "black",
    backgroundColor: "rgba(11, 127, 171, 0.7)",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.5,
    shadowRadius: 5,
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
});