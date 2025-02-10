import { StatusBar } from 'expo-status-bar';
import { Dimensions, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import Home from './Pages/home';

import { selectNavigation } from './redux/navigationSlice.js';
import { useDispatch, useSelector } from 'react-redux';
import AuthScreen from './Pages/Auth.js';
import { store } from './redux/store.js';
export default function App() {
 const navState = useSelector(selectNavigation); 
 
  let currentRoute = store.getState().nav.value.routes[store.getState().nav.value.currentRoute].id;
 
  return (
    <SafeAreaView style = {styles.container}>
      {
        currentRoute == 0?
        <AuthScreen/>
        :
        currentRoute == 1?
        <Home/>
        :
        <View><Text>No ROute found</Text></View>
      }
      </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    alignItems: 'center',
    justifyContent: 'center',
    
  },
});
