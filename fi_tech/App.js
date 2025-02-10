import { StatusBar } from 'expo-status-bar';
import { Dimensions, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import Home from './Pages/home';

//import { selectNavigation } from './redux/navigationSlice.js';
import { useDispatch, useSelector } from 'react-redux';
import AuthScreen from './Pages/Auth.js';
export default function App() {
  //const navState = useSelector(selectNavigation); 
 
  let currentRoute = 0; //navState.routes[navState.currentRoute].id; 
  return (
    <SafeAreaView style = {styles.container}>
      {
        currentRoute == 0?
        <AuthScreen/>
        :
        currentRoute == 2?
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
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    
  },
});
