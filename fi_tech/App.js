import { View, Text, ImageComponent } from "react-native";
//import AICam from "./pages/aiCam";
import {NavigationContainer, createStaticNavigation} from "@react-navigation/native"; 
import { SafeAreaView } from "react-native-web";

export default function App() {
  return (
    <SafeAreaView
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "white"
      }}
    >
      <View>
      <Text>Hello Universe</Text>
      </View>
    </SafeAreaView>
  );
}
