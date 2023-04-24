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
  Dimensions
} from "react-native";

//import { AntDesign } from "@expo/vector-icons";
import SoundImage from "../utils/visual_components/SoundImage";

export default function ImagePage({ route, navigation }) {
  const { image, name } = route.params;

  const pan = useRef(new Animated.ValueXY()).current;
  const [currentX, setCurrentX] = useState(0);
  const [currentY, setCurrentY] = useState(0);

  const xPadding = 45;

  // calculating actual width and height of touch area
  const xMax = Dimensions.get("window").width / 2 - xPadding;
  const yMax = Dimensions.get("window").height / 6 + 125;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => true,
      onPanResponderGrant: (e, r) => {
        // prevent the dot from moving out of bounds with simple ternary operators

        pan.setOffset({
          x:
            pan.x._value > xMax
              ? xMax
              : pan.x._value < -xMax
              ? -xMax
              : pan.x._value,
          y:
            pan.y._value > yMax
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
          console.log(event);
        },
      }),

      onPanResponderRelease: (e, r) => {
        pan.flattenOffset();
        setCurrentY(pan.y._value);
        setCurrentX(pan.x._value);
      },
    })
  ).current;

  const [modalVisible, setModalVisible] = useState(false);
  return (
    <View style={styles.container}>
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
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

      {/* <Canvas ref={this.handleCanvas} /> */}
      {/* <Canvas style={{ width: '10%', height: '10%', backgroundColor: 'black' }} ref={ref} /> */}
      {image.id
        ? (<SoundImage
          src={image.src}
          title={image.title}
          description={image.description}
          id={image.id}
          layers={image.layers}
          soundEffects={image.soundEffects}
          pan={pan}
          currentX={currentX}
          currentY={currentY}
          setCurrentX={setCurrentX}
          setCurrentY={setCurrentY}
          panResponder={panResponder}
        />)
        : null}

      {/* <View style={styles.toolBar}>
        <AntDesign
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
        />
      </View> */}
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
