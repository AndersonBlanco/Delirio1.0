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

const Root = createNativeStackNavigator({
  screenOptions: {headerShown: false, contentStyle:{alignItems: "center", justifyContent:"center", backgroundColor:"rgba(255, 255, 255, 1)"}},
  initialRouteName: "I_ntro", 
  screens:{
    I_ntro: Intro,
    Auth: AuthScreen, 
    H_ome: {
      screen: Home,
      
      options: {contentStyle:{backgroundColor:"rgba(0,0,0,1)", alignItems:"center", justifyContent:"flex-start"}}
    },
    S_ettings: Settings,
    S_hop: {
      screen: Shop,
      options:{
        contentStyle:{

        }
      }
    },



  }
}); 
const Navigation = createStaticNavigation(Root); 

export default function App() {
// const navState = useSelector(selectNavigation); 

  return (
 
    <Navigation/>
 
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    
  },
});
