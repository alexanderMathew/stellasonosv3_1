import { StatusBar } from 'expo-status-bar';
import { Text, View, TouchableOpacity, StyleSheet, Image} from 'react-native';
import React from 'react'

// Navigation-related imports
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Utils and other pages
import Intro from './pages/Intro';
import Home from './pages/Home';
// import Placeholder from './pages/Placeholder';
import ImagePage from './pages/ImagePage.js';
import VibrationPage from './pages/VibrationPage.js';
import SoundHome from './pages/SoundHome.js';
import SoundPage from './pages/SoundPage.js';
//import SynthPage from './pages/SynthPage.js';



const Stack = createNativeStackNavigator();

const SELECTED_IMAGE = 7
export default function App() {
  return (

    // <View>
    //   <Text>Hi</Text>
    // </View>
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Intro"
        screenOptions={{
          headerShown: false  // Hide the app header
        }}>
        <Stack.Screen name="Intro" component={Intro} />
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="ImagePage" component={ImagePage} />
        <Stack.Screen name="VibrationPage" component={VibrationPage} />        
        <Stack.Screen name="SoundHome" component={SoundHome} />        
       <Stack.Screen name="SoundPage" component={SoundPage} /> 

        {/* <Stack.Screen name="Placeholder" component={Placeholder} /> */}
      </Stack.Navigator>
    </NavigationContainer>
  );
    // <View style={styles.container}>
    //  <ImagePage selectedImageID = {SELECTED_IMAGE}></ImagePage>
    // </View>
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    
  },
});
