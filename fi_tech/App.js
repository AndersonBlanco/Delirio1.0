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
export default function App() {
 const navState = useSelector(selectNavigation); 
 
  let currentRoute = store.getState().nav.value.routes[store.getState().nav.value.currentRoute];
 let id = currentRoute.id;
 let background_color = currentRoute.style.backColor; 
 let uiColor = currentRoute.style.uiColor; 

  return (
    <SafeAreaView style = {[styles.container, {backgroundColor: background_color}]}>
      {
        id == 0?
        <Intro/>
        :
        id == 1?
        <AuthScreen/>
        :
        id == 2?
        <>
        <Home/>
        </>
        :
        id == 3?
        <>
        <Settings txtColor = {uiColor}/>
        </>
    
        :
        <View><Text>No ROute found</Text></View>
      }
  
      </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    
  },
});
