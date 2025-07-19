import { StatusBar } from 'expo-status-bar';
import {  Dimensions, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import Intro from './Pages/Intro.js';

import { selectNavigation } from './redux/navigationSlice.js';
import { useDispatch, useSelector } from 'react-redux';
import AuthScreen from './Pages/Auth.js';
import { store } from './redux/store.js';
import Home from './Pages/home.js';
import Settings from './Pages/Settings.js';
import SideNav from './components/sideNav.js';
import Shop from './Pages/shop.js';
import { Suspense } from 'react';
import { Spinner } from 'tamagui';
import {NavigationContainer} from "@react-navigation/native"; 
import { createStaticNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Advice from './Pages/advice.js';
import AICam from './Pages/aiCam.js';
import Lessons from './Pages/lessons.js';
import GenCam from './DataGeneration/cam.js';
import AI_Chat from './Pages/chat.js';
import LessonSummarry from './Pages/LessonSummarry.js';

const Stack = createNativeStackNavigator();
const colorScheme = {
  sixty: "rgba(22, 22, 22, 1)",
  thirty: "rgba(255, 255, 255,1)",
  ten: "rgba(252, 255,255, 1)"
}
 
 /*Each {<Stack.Screen >} tag is a tag dedicated to each page of the app.*/
function App() {
const LoadingActivity = () => (
    <View style = {{position:"absolute", alignItems:"center", justifyContent:"center", zIndex: 100, backgroundColor:"white", height:Dimensions.get('screen').height, width: Dimensions.get("screen").width}}>
            <Spinner color = "black"/>
    </View>
);

const AICam_with_loadingIndicatorScreen = () => (
  <Suspense fallback = {LoadingActivity}>
    <AICam/>
  </Suspense>
);


const Lessons_with_activity_indicator_screen = () => (
  <Suspense fallback = {LoadingActivity}>
    <Lessons/>
  </Suspense>
);


  return (
      <View style = {{flex: 1, paddingTop: 0}}>
    <NavigationContainer>
      
    
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
        initialRouteName="AI_Cam"
      >
        <Stack.Screen name="I_ntro" component={Intro}  /> 
        <Stack.Screen name="Auth" component={AuthScreen} />
        <Stack.Screen 
          name="H_ome" 
          component={Home}
          options={{
            contentStyle: {
              backgroundColor: colorScheme.ten,
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

        <Stack.Screen 
        name="Lessons" 
        component={Lessons_with_activity_indicator_screen} 
        options ={{
          contentStyle:{
            backgroundColor: colorScheme.sixty
          }
        }}/>

          <Stack.Screen 
        name="AI_Cam" 
        component={AICam_with_loadingIndicatorScreen} 
        options ={{
          contentStyle:{
            backgroundColor: colorScheme.sixty
          }
        }}/>

     <Stack.Screen 
        name="AI_Chat" 
        component={AI_Chat} 
        options ={{
          contentStyle:{
            backgroundColor: colorScheme.ten
          }
        }}/>

           <Stack.Screen 
        name="GenCam" 
        component={GenCam} 
        options ={{
          contentStyle:{
            backgroundColor: colorScheme.sixty
          }
        }}/>

        <Stack.Screen 
        name="LessonSummarry" 
        component={LessonSummarry} 
        options ={{
          contentStyle:{
            backgroundColor: colorScheme.ten
          }
        }}/>
      </Stack.Navigator>
    
    </NavigationContainer>
      </View>
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