import React from "react";
import { Text, Vibration, View, SafeAreaView, StyleSheet, TouchableOpacity } from "react-native";
//import * as Haptics from "expo-haptics";

export default function VibrationPage({ navigation }) {
  const ONE_SECOND_IN_MS = 1000;

  const PATTERN1 = [100, 10, 100, 10, 100, 10, 100, 10, 100];
  const PATTERN2 = [550, 550];
  const PATTERN3 = [10, 0.1, 10, 0.1, 10,0.1, 10, 0.1, 10, 0.1, 10, 0.1, 10, 0.1];
  const PATTERN = [
    1 * 1000,
    2 * 1000,
    3 * 1000
  ];

  function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // async function wiggle(pattern, type, style) {
  //   for (let i = 0; i < pattern.length; i++) {
  //     if (style === "selection") {
  //       await Haptics.selectionAsync();
  //       await delay(pattern[i]);
  //     }
  //     if (style === "impact") {
  //       await Haptics.impactAsync(type);
  //       await delay(pattern[i]);
  //     }

  //     if (style === "notification") {
  //       await Haptics.notificationAsync(type);
  //       await delay(pattern[i]);
  //     }
  //   }
  // }

  // //wiggle([1, 1, 3], h, notification, type)
  // const { trigger, stop } = useHaptics();
  // React.useEffect(() => {
  //   // stops the haptic pattern on cleanup
  //   return () => stop();
  // }, []);

  return (
    <View>
     <Text>Hi</Text>
    </View>
    
    // <SafeAreaView style={styles.container}>
    //   <Text style={[styles.header, styles.paragraph]}>Cool Vibes!</Text>
    //   <View style={{ flexDirection: "row", alignItems: "center" }}>
    //     <View style={{ flex: 1, height: 1, backgroundColor: "black" }} />
    //     <View style={{ padding: 5 }}>
    //       <Text style={{ width: 75, textAlign: "center" }}>PATTERN 1</Text>
    //     </View>
    //     <View style={{ flex: 1, height: 1, backgroundColor: "black" }} />
    //   </View>
    //   <View style={styles.impactRow}>
    //     <TouchableOpacity
    //       style={styles.centered}
    //       title="Vibrate with heavy impact pattern"
    //       onPress={() =>
    //         wiggle(PATTERN1, Haptics.ImpactFeedbackStyle.Heavy, "impact")
    //       }
    //     >
    //       <View style={styles.squareHI} />
    //       <Text style={{ fontSize: 10 }}>Heavy Impact</Text>
    //     </TouchableOpacity>

    //     <TouchableOpacity
    //       style={styles.centered}
    //       title="Vibrate with trigger"
    //       onPress={() =>
    //         wiggle(PATTERN1, Haptics.ImpactFeedbackStyle.Medium, "impact")
    //       }
    //     >
    //       <View style={styles.squareMI} />
    //       <Text style={{ fontSize: 10 }}>Medium Impact</Text>
    //     </TouchableOpacity>

    //     <TouchableOpacity
    //       style={styles.centered}
    //       title="Vibrate with trigger"
    //       onPress={() =>
    //         wiggle(PATTERN1, Haptics.ImpactFeedbackStyle.Light, "impact")
    //       }
    //     >
    //       <View style={styles.squareLI} />
    //       <Text style={{ fontSize: 10 }}>Light Impact</Text>
    //     </TouchableOpacity>

    //     <TouchableOpacity
    //       style={styles.centered}
    //       onPress={() =>
    //         wiggle(
    //           PATTERN1,
    //           Haptics.NotificationFeedbackType.Warning,
    //           "selection"
    //         )
    //       }
    //     >
    //       <View style={styles.squareSP} />
    //       <Text style={{ fontSize: 10 }}>Selection Pattern</Text>
    //     </TouchableOpacity>
    //   </View>

    //   {/* ----------------------------------------------------------------------- */}

    //   <View style={styles.impactRow2}>
    //     <TouchableOpacity
    //       style={styles.centered}
    //       onPress={() =>
    //         wiggle(
    //           PATTERN1,
    //           Haptics.NotificationFeedbackType.Success,
    //           "notification"
    //         )
    //       }
    //     >
    //       <View style={styles.squareSN} />
    //       <Text style={{ fontSize: 10 }}>Sucess Notif.</Text>
    //     </TouchableOpacity>

    //     <TouchableOpacity
    //       style={styles.centered}
    //       onPress={() =>
    //         wiggle(
    //           PATTERN1,
    //           Haptics.NotificationFeedbackType.Warning,
    //           "notification"
    //         )
    //       }
    //     >
    //       <View style={styles.squareWN} />
    //       <Text style={{ fontSize: 10 }}>Warning Notif.</Text>
    //     </TouchableOpacity>

    //     <TouchableOpacity
    //       style={styles.centered}
    //       onPress={() =>
    //         wiggle(
    //           PATTERN1,
    //           Haptics.NotificationFeedbackType.Error,
    //           "notification"
    //         )
    //       }
    //     >
    //       <View style={styles.squareEN} />
    //       <Text style={{ fontSize: 10 }}>Error Notif.</Text>
    //     </TouchableOpacity>

    //     <TouchableOpacity
    //       style={styles.centered}
    //       title="Vibrate with trigger"
    //       onPress={() => {
    //         Vibration.vibrate(PATTERN1);
    //       }}
    //     >
    //       <View style={styles.squareV} />
    //       <Text style={{ fontSize: 10 }}>Vibrate</Text>
    //     </TouchableOpacity>
    //   </View>
    //   {/* ----------------------------------------------------------------------- */}

    //   <View style={{ flexDirection: "row", alignItems: "center" }}>
    //     <View style={{ flex: 1, height: 1, backgroundColor: "black" }} />
    //     <View style={{ padding: 5 }}>
    //       <Text style={{ width: 75, textAlign: "center" }}>PATTERN 2</Text>
    //     </View>
    //     <View style={{ flex: 1, height: 1, backgroundColor: "black" }} />
    //   </View>
    //   <View style={styles.impactRow2}>
    //     <TouchableOpacity
    //       style={styles.centered}
    //       title="Vibrate with heavy impact pattern"
    //       onPress={() =>
    //         wiggle(PATTERN2, Haptics.ImpactFeedbackStyle.Heavy, "impact")
    //       }
    //     >
    //       <View style={styles.squareHI} />
    //       <Text style={{ fontSize: 10 }}>Heavy Impact</Text>
    //     </TouchableOpacity>

    //     <TouchableOpacity
    //       style={styles.centered}
    //       title="Vibrate with trigger"
    //       onPress={() =>
    //         wiggle(PATTERN2, Haptics.ImpactFeedbackStyle.Medium, "impact")
    //       }
    //     >
    //       <View style={styles.squareMI} />
    //       <Text style={{ fontSize: 10 }}>Medium Impact</Text>
    //     </TouchableOpacity>

    //     <TouchableOpacity
    //       style={styles.centered}
    //       title="Vibrate with trigger"
    //       onPress={() =>
    //         wiggle(PATTERN2, Haptics.ImpactFeedbackStyle.Light, "impact")
    //       }
    //     >
    //       <View style={styles.squareLI} />
    //       <Text style={{ fontSize: 10 }}>Light Impact</Text>
    //     </TouchableOpacity>

    //     <TouchableOpacity
    //       style={styles.centered}
    //       onPress={() =>
    //         wiggle(
    //           PATTERN2,
    //           Haptics.NotificationFeedbackType.Warning,
    //           "selection"
    //         )
    //       }
    //     >
    //       <View style={styles.squareSP} />
    //       <Text style={{ fontSize: 10 }}>Selection Pattern</Text>
    //     </TouchableOpacity>
    //   </View>

    //   {/* ----------------------------------------------------------------------- */}

    //   <View style={styles.impactRow2}>
    //     <TouchableOpacity
    //       style={styles.centered}
    //       onPress={() =>
    //         wiggle(
    //           PATTERN2,
    //           Haptics.NotificationFeedbackType.Success,
    //           "notification"
    //         )
    //       }
    //     >
    //       <View style={styles.squareSN} />
    //       <Text style={{ fontSize: 10 }}>Sucess Notif.</Text>
    //     </TouchableOpacity>

    //     <TouchableOpacity
    //       style={styles.centered}
    //       onPress={() =>
    //         wiggle(
    //           PATTERN2,
    //           Haptics.NotificationFeedbackType.Warning,
    //           "notification"
    //         )
    //       }
    //     >
    //       <View style={styles.squareWN} />
    //       <Text style={{ fontSize: 10 }}>Warning Notif.</Text>
    //     </TouchableOpacity>

    //     <TouchableOpacity
    //       style={styles.centered}
    //       onPress={() =>
    //         wiggle(
    //           PATTERN2,
    //           Haptics.NotificationFeedbackType.Error,
    //           "notification"
    //         )
    //       }
    //     >
    //       <View style={styles.squareEN} />
    //       <Text style={{ fontSize: 10 }}>Error Notif.</Text>
    //     </TouchableOpacity>

    //     <TouchableOpacity
    //       style={styles.centered}
    //       title="Vibrate with trigger"
    //       onPress={() => {
    //         Vibration.vibrate(PATTERN2);
    //       }}
    //     >
    //       <View style={styles.squareV} />
    //       <Text style={{ fontSize: 10 }}>Vibrate</Text>
    //     </TouchableOpacity>
    //   </View>
    //   {/* ----------------------------------------------------------------------- */}
    //   {/* ----------------------------------------------------------------------- */}



    //   <View style={{ flexDirection: "row", alignItems: "center" }}>
    //     <View style={{ flex: 1, height: 1, backgroundColor: "black" }} />
    //     <View style={{ padding: 5 }}>
    //       <Text style={{ width: 75, textAlign: "center" }}>PATTERN 3</Text>
    //     </View>
    //     <View style={{ flex: 1, height: 1, backgroundColor: "black" }} />
    //   </View>
    //   <View style={styles.impactRow2}>
    //     <TouchableOpacity
    //       style={styles.centered}
    //       title="Vibrate with heavy impact pattern"
    //       onPress={() =>
    //         wiggle(PATTERN3, Haptics.ImpactFeedbackStyle.Heavy, "impact")
    //       }
    //     >
    //       <View style={styles.squareHI} />
    //       <Text style={{ fontSize: 10 }}>Heavy Impact</Text>
    //     </TouchableOpacity>

    //     <TouchableOpacity
    //       style={styles.centered}
    //       title="Vibrate with trigger"
    //       onPress={() =>
    //         wiggle(PATTERN3, Haptics.ImpactFeedbackStyle.Medium, "impact")
    //       }
    //     >
    //       <View style={styles.squareMI} />
    //       <Text style={{ fontSize: 10 }}>Medium Impact</Text>
    //     </TouchableOpacity>

    //     <TouchableOpacity
    //       style={styles.centered}
    //       title="Vibrate with trigger"
    //       onPress={() =>
    //         wiggle(PATTERN3, Haptics.ImpactFeedbackStyle.Light, "impact")
    //       }
    //     >
    //       <View style={styles.squareLI} />
    //       <Text style={{ fontSize: 10 }}>Light Impact</Text>
    //     </TouchableOpacity>

    //     <TouchableOpacity
    //       style={styles.centered}
    //       onPress={() =>
    //         wiggle(
    //           PATTERN3,
    //           Haptics.NotificationFeedbackType.Warning,
    //           "selection"
    //         )
    //       }
    //     >
    //       <View style={styles.squareSP} />
    //       <Text style={{ fontSize: 10 }}>Selection Pattern</Text>
    //     </TouchableOpacity>
    //   </View>

    //   {/* ----------------------------------------------------------------------- */}

    //   <View style={styles.impactRow2}>
    //     <TouchableOpacity
    //       style={styles.centered}
    //       onPress={() =>
    //         wiggle(
    //           PATTERN3,
    //           Haptics.NotificationFeedbackType.Success,
    //           "notification"
    //         )
    //       }
    //     >
    //       <View style={styles.squareSN} />
    //       <Text style={{ fontSize: 10 }}>Sucess Notif.</Text>
    //     </TouchableOpacity>

    //     <TouchableOpacity
    //       style={styles.centered}
    //       onPress={() =>
    //         wiggle(
    //           PATTERN3,
    //           Haptics.NotificationFeedbackType.Warning,
    //           "notification"
    //         )
    //       }
    //     >
    //       <View style={styles.squareWN} />
    //       <Text style={{ fontSize: 10 }}>Warning Notif.</Text>
    //     </TouchableOpacity>

    //     <TouchableOpacity
    //       style={styles.centered}
    //       onPress={() =>
    //         wiggle(
    //           PATTERN3,
    //           Haptics.NotificationFeedbackType.Error,
    //           "notification"
    //         )
    //       }
    //     >
    //       <View style={styles.squareEN} />
    //       <Text style={{ fontSize: 10 }}>Error Notif.</Text>
    //     </TouchableOpacity>

    //     <TouchableOpacity
    //       style={styles.centered}
    //       title="Vibrate with trigger"
    //       onPress={() => {
    //         Vibration.vibrate(PATTERN3);
    //       }}
    //     >
    //       <View style={styles.squareV} />
    //       <Text style={{ fontSize: 10 }}>Vibrate</Text>
    //     </TouchableOpacity>
    //   </View>
    //   {/* ----------------------------------------------------------------------- */}

    //   {/* <TouchableOpacity
    //       style={styles.centered}
    //       title="Vibrate with trigger"
    //       onPress={() => {
    //         const interval = setInterval(
    //           () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.light),
    //           500
    //         );
    //         // it will vibrate for 5 seconds
    //         setTimeout(() => clearInterval(interval), 5000);
    //       }}
    //     >
    //       <View style={styles.square2} />
    //       <Text>light impact </Text>
    //     </TouchableOpacity> */}
    //   {/* 
    //     <TouchableOpacity
    //       style={styles.centered}
    //       title="Vibrate with trigger"
    //       onPress={() => {
    //         const interval = setInterval(
    //           () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium),
    //           500
    //         );
    //         // it will vibrate for 5 seconds
    //         setTimeout(() => clearInterval(interval), 5000);
    //       }}
    //     >
    //       <View style={styles.square3} />
    //       <Text>medium impact</Text>
    //     </TouchableOpacity> */}

    //   {/* VIBRATE
    //   <View style={styles.vibrateRow}>
    //     <TouchableOpacity
    //       style={styles.centered}
    //       title="Vibrate with trigger"
    //       onPress={() => {
    //         Vibration.vibrate();
    //       }}
    //     >
    //       <View style={styles.square4} />
    //       <Text>vibrate once </Text>
    //     </TouchableOpacity>

    //     <HapticsProvider>
    //       <View>
    //       <Button
    //         style={styles.centered}
    //         title="impacts with pattern"
    //         onPress={() => trigger(SUCCESS_PATTERN, true)}
    //       ></Button>
    //       </View>
    //       </HapticsProvider>



    //   </View> */}

    //   {/*       
    //   <TouchableOpacity 
    //     style = {styles.centered}
    //     title="Vibrate with pattern with trigger" onPress=
    //     {() => {ReactNativeHapticFeedback.trigger("impactLight", )}}
    //     ><View style= {styles.square}/>
    //   </TouchableOpacity> */}
    //   {/* <Separator />
    //     {Platform.OS == "android"
    //       ? [
    //           <View>
    //             <Button
    //               title="Vibrate for 10 seconds"
    //               onPress={
    //                 () => {
    //                     const interval = setInterval(() => Vibration.vibrate(), 1000);
    //   // it will vibrate for 5 seconds
    //   setTimeout(() => clearInterval(interval), 5000);
    //                 }
    //               }
    //             />
    //           </View>,
    //           <Separator />
    //         ]
    //       : null} */}
    //   {/* <Text style={styles.paragraph}>Pattern: {PATTERN_DESC}</Text> */}
    //   {/* <Button
    //     title="Vibrate with pattern"
    //     onPress={() => {
    //       const interval = setInterval(() => Vibration.vibrate(), 100);
    //       // it will vibrate for 5 seconds
    //       setTimeout(() => clearInterval(interval), 10000);
    //     }}
    //   />*/}

    //   {/* <Separator /> 
    //   <Button
    //     title="selection haptic"
    //     onPress={() => Haptics.selectionAsync()}
    //   /> */}
    //   {/* <Separator /> */}
    //   {/* <Button
    //     title="impact haptic"
    //     onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
    //     color="#FF0000"
    //   /> 
    //   */}
    // </SafeAreaView>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    // // paddingTop: 44,
    // padding: 8,
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  headerForTitle: {
    fontSize: 15,
    fontWeight: "bold",
    textAlign: "center",
  },
  paragraph: {
    marginTop: 40,
    marginBottom: 20,
    textAlign: "center",
  },
  separator: {
    marginVertical: 10,
    borderBottomColor: "#737373",
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  squareHI: {
    height: 40,
    width: 50,
    backgroundColor: "darkgreen",
    justifyContent: "center",
    borderRadius: 15,
  },
  squareSN: {
    height: 40,
    width: 50,
    backgroundColor: "black",
    justifyContent: "center",
    borderRadius: 15,
  },
  squareMI: {
    height: 40,
    width: 50,
    backgroundColor: "yellowgreen",
    justifyContent: "center",
    borderRadius: 15,
  },
  squareWN: {
    height: 40,
    width: 50,
    backgroundColor: "slategray",
    justifyContent: "center",
    borderRadius: 15,
  },
  squareLI: {
    height: 40,
    width: 50,
    backgroundColor: "darkseagreen",
    justifyContent: "center",
    borderRadius: 15,
  },
  squareEN: {
    height: 40,
    width: 50,
    backgroundColor: "lightgray",
    justifyContent: "center",
    borderRadius: 15,
  },

  squareSP: {
    height: 40,
    width: 50,
    backgroundColor: "pink",
    justifyContent: "center",
    borderRadius: 15,
  },
  squareV: {
    height: 40,
    width: 50,
    backgroundColor: "purple",
    justifyContent: "center",
    borderRadius: 15,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
    alignContent: "stretch",

    // if you want to fill rows left to right
  },
  impactRow: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignContent: "stretch",
    flexWrap: "wrap",
    position: "relative",
    paddingBottom: 15,
    width: 400,
  },
  impactRow2: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignContent: "stretch",
    flexWrap: "wrap",
    position: "relative",
    paddingBottom: 15,
    width: 400,
  },
  impactRow3: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignContent: "stretch",
    flexWrap: "wrap",
    position: "relative",
    paddingBottom: 15,
  },
  vibrateRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignContent: "stretch",
    flexWrap: "wrap",
    position: "relative",
  },
});
