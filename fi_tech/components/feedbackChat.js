import {useState, useEffect} from "react";
import {
    View,
    StyleSheet,
    Dimensions,
    
} from "react-native";
import SideNav from "./sideNav";
//gluetsack-ui for dynamic alert chat prmopt pop ups offer after button click 
//react-native-reusable (rnr) - for <Avatar> consistent UI |  for aletr Aialog for animated prompt for text duirn gfeedback screen or others | for Accordian feature - collapseable and expandable list of items (vertical but maybe horizontal too) 
//Tamagui 
//react native windUI
//react native ui kitten - for Date Picker and for spinner loading icon maybe 
//Lottie - add animations 
//React native stream-chat - alternative to gifted-chat
import * as reanimated from "react-native-reanimated"; 
import {TextField} from "swiftui-react-native"; 
export default function FeedbackCHat(){
    return(
        <View style = {{backgroundColor: "rgba(0,0,0,.8", width: Dimensions.get("screen").width *.9, height: Dimensions.get("screen").height * .5}}>
           <SideNav/>
           
            <Text>Hello Universe</Text>


        </View>
    )
}