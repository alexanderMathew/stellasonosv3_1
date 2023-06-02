import React, { useRef, useState } from "react";
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
} from "react-native";

import { Dimensions } from "react-native";
//import { AntDesign } from "@expo/vector-icons";
import { Button } from "@rneui/base";
import { Player } from '@react-native-community/audio-toolkit';

export default function SoundPage({ route, navigation }) {
    const { image, name } = route.params;

    const pan = useRef(new Animated.ValueXY()).current;
    const [currentX, setCurrentX] = useState(0);
    const [currentY, setCurrentY] = useState(0);
    const [sound, setSound] = useState(null);

    const xPadding = 45;

    // The native looping in the audio toolkit is inadequate because
    // it leaves a dead air gap, so we set looping to false and do our
    // own looping.
    const playerOne =
	  new Player("https://stellasonos-files.vercel.app/samples/bassoon/G1.mp3",
		     {autoDestroy: false,
		      mixWithOthers: true}).prepare((err) => {
			  if (err) {
			      console.log("error 1:");
			      console.log(err);
			  } else {
			      playerOne.looping = false;
			  }
		      });

    // Same as above for the second player.
    const playerTwo =
	  new Player("https://stellasonos-files.vercel.app/samples/bassoon/G1.mp3",
		     {autoDestroy: false,
		      mixWithOthers: true}).prepare((err) => {
			  if (err) {
			      console.log("error 2:");
			      console.log(err);
			  } else {
			      playerTwo.looping = false;
			  }
		      });
			  
    // Start two overlapping looped players.
    async function playReal() {
	playSteppedSound(playerOne, "one", 1.0);
	console.log("waiting", playerOne.duration/2, "ms to play two");
	playerID["two"] =
	    setTimeout(() => { playSteppedSound(playerTwo, "two", 1.0); },
		       playerOne.duration / 2);
    }

    // Use this to stop the two players.
    var playerID = {one: 0, two: 0};

    // We can vary this to control the volume. It will be a little
    // rough given the fading in and out, but could work.
    var playerVol = 1.0;

    // Loop a sound so that it plays over and over. Also fades in.
    async function playSteppedSound(player, id) {

	player.play((err) => {
	    if (err) {
		console.log("error playing:", id, "volume", playerVol,
			    "state", player.state);
		console.log(err);
	    } else {
		console.log("playing", id, "volume", playerVol,
			    "state", player.state);
	    }});
	// Start playing low.
	player.volume = 0.125*playerVol;

	// Arrange a series of volume increases over a second's time.
	setTimeout(() => { player.volume = 0.25*playerVol; }, 125);
	setTimeout(() => { player.volume = 0.375*playerVol;}, 250);
	setTimeout(() => { player.volume = 0.5*playerVol;}, 500);
	setTimeout(() => { player.volume = 0.625*playerVol;}, 625);
	setTimeout(() => { player.volume = 0.75*playerVol;}, 750);
	setTimeout(() => { player.volume = 0.875*playerVol;}, 875);
	setTimeout(() => { player.volume = playerVol;}, 1000);

	// Save the id of the looped player, so it can be stopped
	// when necessary.  Also note that we stop the player at
	// its duration. I don't know why, but this seems to make
	// the restart happen without dead air.
	playerID[id] =
	    setTimeout(() => { player.stop();
			       console.log("restart", id, player.duration);
			       playSteppedSound(player, id); },
		       player.duration);
    }

    // Set the player volume, in all the places it should be set.
    async function setPlayerVolume(newVolume) {
	console.log("set volume to", newVolume);
	playerVol = newVolume;
	playerOne.volume = newVolume;
	playerTwo.volume = newVolume;
    }
    
    async function playSoundToolkit() {
	try {
	    playerOne.play();
	    console.log("playing playerOne");
	    // Start a second sound to play, but it only plays if
	    // playerOne lasts more than 5s.
	    setTimeout(() => { if (playerOne.isPlaying) {
		playerTwo.play();
		console.log("playing playerTwo");} },
		       5000);
	} catch (e) {
	    console.log(`cannot play the sound file`, e)
	}
    }

    // When stopping, we not only have to stop the players from
    // playing, but we also have to stop the asynchronous (setTimeout)
    // requests to restart the players.
    async function stopSoundToolkit() {
	console.log("stopping everything, including",
		    playerID["one"], "and", playerID["two"]);
	playerOne.stop();
	playerTwo.stop();
	clearTimeout(playerID["one"]);
	playerID["one"] = 0;
	clearTimeout(playerID["two"]);
	playerID["two"] = 0;
    }
  
    // calculating actual width and height of touch area
    const xMax = Dimensions.get("window").width / 2 - xPadding;
    const yMax = Dimensions.get("window").height / 6 + 125;

    const panResponder = useRef(
	PanResponder.create({
	    onMoveShouldSetPanResponder: () => true,
	    onStartShouldSetPanResponderCapture: () => true,
	    onPanResponderGrant: (e, r) => {
		// prevent the dot from moving out of bounds
		pan.setOffset({
		    x: pan.x._value > xMax
			? xMax
			: pan.x._value < -xMax
			? -xMax
			: pan.x._value,
		    y: pan.y._value > yMax
			? yMax
			: pan.y._value < -yMax
			? -yMax
			: pan.y._value,
		});
	    },
	    onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
      
		useNativeDriver: false,
		onPanResponderRelease: (event, gestureState) => {
		    //After the change in the location
		},
	    }),
	    onPanResponderRelease: (e, r) => {
		pan.flattenOffset();
		setCurrentY(pan.y._value);
		setCurrentX(pan.x._value);
	    },
	})
    ).current;

    // update current x and y values in the state for later
    pan.x.addListener(({ value }) => { setCurrentX(value); });
    pan.y.addListener(({ value }) => { setCurrentY(value); });

    const handleX = (delta) => {
	var newX =
	    currentX + delta > xMax
            ? xMax
            : currentX + delta < -xMax
            ? -xMax
            : currentX + delta;
	pan.setValue({ x: newX, y: currentY });
    };
    const handleY = (delta) => {
	var newY =
	    currentY + delta > yMax
            ? yMax
            : currentY + delta < -yMax
            ? -yMax
            : currentY + delta;
	pan.setValue({ x: currentX, y: newY });
    };

    const [modalVisible, setModalVisible] = useState(false);

    return (
	    <View style={styles.container}>
	    <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
	    playerOne.destroy();
            Alert.alert("Modal has been closed.");
            setModalVisible(!modalVisible);
        }}
	    >
            <View style={styles.centeredView}>
            <View style={styles.modalView}>
            <Text style={styles.modalText}>
            {image.title}: {"\n"}
        {image.description}
        </Text>
            <Pressable
        style={[styles.button, styles.buttonClose]}
        onPress={() => setModalVisible(!modalVisible)}
            >
            <Text style={styles.textStyle}>CLOSE</Text>
            </Pressable>
            </View>
            </View>
	    </Modal>
	    <View style={styles.container}>
            {/* Preventing the dot from going out of bounds       */}
            <Animated.View
        style={{
            transform: [
		{
                    translateX: pan.x.interpolate({
			inputRange: [-xMax, xMax],
			outputRange: [-xMax, xMax],
			extrapolate: "clamp",
                    }),
		},
		{
                    translateY: pan.y.interpolate({
			inputRange: [-yMax, yMax],
			outputRange: [-yMax, yMax],
			extrapolate: "clamp",
                    }),
		},
            ],
        }}
        {...panResponder.panHandlers}
            >
            <View style={styles.circle} />
            </Animated.View>
            <View
        style={styles.imageContainer}
        onStartShouldSetResponder={() => true}
        onResponderMove={(event) => {        
            pan.setValue({
		x: event.nativeEvent.locationX - xMax - 20,
		y: event.nativeEvent.locationY - yMax - 20,
            });

	    setPlayerVolume(event.nativeEvent.locationX / 150);
	    

            /*

            Where the actual motion is taking place

            */
           //playSoundToolkit()
        }}
 
        
            >
            <ImageBackground
        style={styles.tinyLogo}
        source={{ uri: image.src }}
            ></ImageBackground>
            </View>
	    </View>


      {<View style={styles.toolBar}>
        {/* <AntDesign
          onPress={() => handleX(-10)}
          name="leftcircleo"
          size={30}
          color="black"
        />
        <AntDesign
          onPress={() => handleX(10)}
          name="rightcircleo"
          size={30}
          color="black"
        />
        <AntDesign
          onPress={() => handleY(-10)}
          name="upcircleo"
          size={30}
          color="black"
        />
        <AntDesign
          onPress={() => handleY(10)}
          name="downcircleo"
          size={30}
          color="black"
        />
        <AntDesign
          onPress={() => setModalVisible(true)}
          name="infocirlceo"
          size={30}
          color="black"
        /> */}
      {/* <View>
        <Button onPress={playSoundToolkit}>Play Sound</Button>
      </View>
      <View>
        <Button onPress={stopSoundToolkit}>Stop Sound</Button>
      </View> */}
       <Button onPress={playReal} >Play Sound</Button>
      <Button onPress={playSoundToolkit} >Play other Sound</Button>
      <Button onPress={stopSoundToolkit} >Stop Sound</Button>
       </View> }
	</View>
    );
}


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
	backgroundColor: "red",
	borderRadius: 40,
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
