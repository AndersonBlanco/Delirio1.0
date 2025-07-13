import {useState, useEffect, useCallback, useRef} from "react";
import {
    View,
    StyleSheet,
    Dimensions,
     Text,
     TextInput,
     TouchableOpacity
} from "react-native";
import { GiftedChatContext, GiftedAvatar, GiftedChat, InputToolbar, Avatar, utils, DEFAULT_PLACEHOLDER} from "react-native-gifted-chat";
import Logo from "../assets/fiTech_logo.png";
import { Icon } from "react-native-elements";
import { useSharedValue } from "react-native-worklets-core";
import { OpenAI } from "openai/client.js";
import ChatEnvironment from "../components/ChatEnvironment";
import SideNav from "../components/sideNav";
//import SideNav from "../components/sideNav";
//gluetsack-ui for dynamic alert chat prmopt pop ups offer after button click 
//react-native-reusable (rnr) - for <Avatar> consistent UI |  for aletr Aialog for animated prompt for text duirn gfeedback screen or others | for Accordian feature - collapseable and expandable list of items (vertical but maybe horizontal too) 
//Tamagui 
//react native windUI
//react native ui kitten - for Date Picker and for spinner loading icon maybe 



export default function AI_Chat({theme}){


    return(
        <View style={{backgroundColor:"rgba(0,0,0,.2)", flex: 1}} >
         <SideNav buttonColor={theme? "black": "white"} style = {{top: 70, left: -173, marginBottom: 50, position:"relative"}}/>
    
       <Text style = {{fontSize: 25, color:"rgba(256,256,256,.75)", position:"absolute", top: 100, left: Dimensions.get("screen").width/3.7}}>Hello Universe</Text>
        
        <ChatEnvironment isKeyboardInternallyHandled = {true} viewStyle={{flex: 1, paddingVertical: 0, paddingHorizontal: 2, paddingTop: 40, paddingBottom: 40}}/>
            
        </View>
    )
}