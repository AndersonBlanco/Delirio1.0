import {View, Text, Image, SafeAreaView, StyleSheet, ImageBackground, TextInput, TouchableOpacity} from "react-native";
import { Dimensions } from "react-native";
 
import AppleLogo from "../assets/apple_logo.png";
import GoogleLogo from "../assets/google_logo.png";
import { useState } from "react";

import User from "../assets/user.png"; 
import RightArrowSVG from "../assets/rightArrow";
import SideNav from "../components/sideNav";
import { useDispatch } from "react-redux";
const width = Dimensions.get("screen").width,
      height = Dimensions.get("screen").height; 

export default function Settings({txtColor}){
    //  <TouchableOpacity style = {styles.pressable}><Text style = {[styles.pressablmeTex, {color: "red"}]}>Delete Account</Text><GArrow style ={styles.gArrow} fill = "red" /></TouchableOpacity>
    const [localSettingsCurrentPage, setLocalSettingsCurrentPage] = useState(0);
  
    /**
     * 0 =  
     * 1 = Permissions 
     * 2 = Privacy 
     * 3 = Terms & Services 
     * 4 = Feedback
     * 5 = Software Details
     */
 
//  <TouchableOpacity style = {styles.settingButtonContainer}><View style = {styles.row}><Text  style = {styles.settingName}>Feedback</Text><RightArrowSVG style = {styles.arrowRight} fill = "rgba(0,0,0,.4)"/></View></TouchableOpacity>
    return(
        <>
          <SideNav style = {{top: 18, position: "relative", left: -170, marginBottom: 50}} buttonColor={"black"} initState = {false} />
            <View style = {styles.settingButtonsGroup}>
            <TouchableOpacity onPress={() =>{}} style = {styles.settingButtonContainer}><View style = {styles.row}><Text  style = {styles.settingName}>Permissions</Text><RightArrowSVG style = {styles.arrowRight} fill = "rgba(0,0,0,.4)"/></View></TouchableOpacity>
            <TouchableOpacity style = {styles.settingButtonContainer}><View style = {styles.row}><Text  style = {styles.settingName}>Privacy</Text><RightArrowSVG style = {styles.arrowRight} fill = "rgba(0,0,0,.4)"/></View></TouchableOpacity>
            <TouchableOpacity style = {styles.settingButtonContainer}><View style = {styles.row}><Text  style = {styles.settingName}>Terms & Services</Text><RightArrowSVG style = {styles.arrowRight} fill = "rgba(0,0,0,.4)"/></View></TouchableOpacity>
          
            <TouchableOpacity style = {styles.settingButtonContainer}><View style = {styles.row}><Text  style = {styles.settingName}>Software Details</Text><RightArrowSVG style = {styles.arrowRight} fill = "rgba(0,0,0,.4)"/></View></TouchableOpacity>
            <TouchableOpacity style = {[styles.settingButtonContainer, {position:"relative", bottom: -380}]}><View style = {styles.row}><Text  style = {[styles.settingName, {color: "red"}]}>SignOut</Text><RightArrowSVG style = {styles.arrowRight} fill = "rgba(255, 0, 0, 0.7)"/></View></TouchableOpacity>
            </View>
          


        </>
    )
}
const styles = StyleSheet.create({

settingButtonsGroup:{
      rowGap: 0, 
      display:"flex",
      flexDirection:"column",
      position:"relative",
      bottom: 0,
      width: "90%",
      alignSelf:"center",
     backgroundColor: "white", 
     height: "80%",
     

},

settingButtonContainer:{
    borderTopWidth: 1, 
    borderTopColor: "rgba(0,0,0,.2)",
    alignItems:"center",

    justifyContent: "flex-start",
    textAlign:"left",
    paddingVertical: 25,
    paddingHorizontal: 0
    
},

settingName:{
  textAlign:"left",
  alignSelf: "baseline"
},
row:{
    display:"flex",
    flexDirection:"row",
    width: "100%",

},

arrowRight:{
    position:"absolute",
    right: 0,
    color: "rgba(0,0,0,.4)"
}
})