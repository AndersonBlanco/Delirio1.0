import { StatusBar } from 'expo-status-bar';
import { Dimensions, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import Intro from './Pages/Intro.js';

import { selectNavigation } from './redux/navigationSlice.js';
import { useDispatch, useSelector } from 'react-redux';
import AuthScreen from './Pages/Auth.js';
import { store } from './redux/store.js';
import Home from './Pages/home.js';
import Settings from './Pages/Settings.js';
import SideNav from './components/sideNav.js';
import Shop from './Pages/shop.js';

import {NavigationContainer} from "@react-navigation/native"; 
import { createStaticNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Advice from './Pages/advice.js';

//mediapipe api:
import * as poseDetection from '@tensorflow-models/pose-detection';
import '@tensorflow/tfjs-core';
// Register WebGL backend.
import '@tensorflow/tfjs-backend-webgl';
import '@mediapipe/pose';

const model = poseDetection.SupportedModels.BlazePose;
const detectorConfig = {
  runtime: 'mediapipe',
  solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/pose'
                // or 'base/node_modules/@mediapipe/pose' in npm.
};
detector = await poseDetection.createDetector(model, detectorConfig);

const estimationConfig = {enableSmoothing: true};
const poses = await detector.estimatePoses(image, estimationConfig);
//*//


const Stack = createNativeStackNavigator();
const colorScheme = {
  sixty: "rgba(29, 29, 29, 0.75)",
  thirty: "rgba(255, 255, 255,1)",
  ten: "rgba(252, 255,255, 1)"
}

console.log("reading json file: ")
const fileRead = new FileReader();
fileRead.readAsDataURL("../componen")

const TestScreen = () =>{
  
}
function App() {
  return (
    <NavigationContainer>
      <View style = {{flex: 1, paddingTop: 0}}>
      <Stack.Navigator 
      
        screenOptions={{
          animation:"none",
          headerShown: false,
          contentStyle: {
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: colorScheme.ten
          },
          
        }}
        initialRouteName="I_ntro"
      >
        <Stack.Screen name="I_ntro" component={Intro}  />
        <Stack.Screen name="Auth" component={AuthScreen} />
        <Stack.Screen 
          name="H_ome" 
          component={Home}
          options={{
            contentStyle: {
              backgroundColor: colorScheme.sixty,
              alignItems: "center",
              justifyContent: "flex-start"
            }
          }}
        />


          <Stack.Screen 
          name="Advice" 
          component={Advice}
          options={{
            contentStyle: {
              backgroundColor: colorScheme.ten,
              alignItems: "center",
              justifyContent: "flex-start"
            }
          }}
        />
        <Stack.Screen name="S_ettings" component={Settings} />

        <Stack.Screen 
        name="S_hop" 
        component={Shop} 
        options ={{
          contentStyle:{
            backgroundColor: colorScheme.sixty
          }
        }}/>
      </Stack.Navigator>
      </View>
    </NavigationContainer>
  );
}

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});