import { Modal, View, Text, TouchableOpacity, Pressable, Dimensions, Image, StyleSheet } from "react-native";
import { nav } from "../redux/navigationSlice";
import { useDispatch, useSelector} from "react-redux";
import { useState } from "react";
import User from "../assets/user.png"; 
import Bot from "../assets/ai.png";
import Advice from "../assets/advice.png";
import Home from "../assets/home.png";
import Explore from "../assets/workouts.png";
import Shop from "../assets/shop.png";
import SettingsIcon from "../assets/settings.png"; 
import { useNavigation } from "@react-navigation/native";
import { Icon } from "react-native-elements";
import { YGroup } from "tamagui";
export default function SideNav({style, buttonColor}){
    //const dispatch = useDispatch(); 
    const navigation = useNavigation(); 

    const [modalView, setModalView] = useState(false); 
       let screenHeight = Dimensions.get("screen").height,
            screenWidth = Dimensions.get("screen").width; 
            const fontS = 20,
            profileImgSize = 75,
            iconSize = 25;
    return(
        <>
          <TouchableOpacity
           
            onPress = {() => setModalView(true)}
            style = {[{position:"absolute", top: 50, left: 25}, style]}>
                <Icon name = "menu" size = {27} color = {buttonColor} style = {{color: buttonColor, fontSize: 25}}/>
            </TouchableOpacity>
        
         <Modal animationType="fade" animationInTiming={100} animationOutTiming = {100} animationIn = "slideInLeft" animationOut= "slideOutLeft"    visible = {modalView} transparent={true}>
                     <View style = {{backgroundColor: "rgba(0,0,0, .5)", height: "100%", width: "100%", alignItems:"center"}}>
                        <View onTouchMove={() => setModalView(false)} style = {{ alignSelf:"center", backgroundColor: "white", width:screenWidth/2.2, height: screenHeight, position:'absolute', left: 0, padding: 25, flexDirection: "column", paddingLeft: 10}}>
                        
                        <YGroup justifyContent="center" backgroundColor={"transparent"} top = {170} rowGap={55} alignSelf="center">
                            <TouchableOpacity style = {[styles.row, {alignItems:"center", columnGap: 20}]} onPress={() =>navigation.replace("H_ome")}><Image style = {{height: iconSize, width: iconSize}} source={Home}/><Text style = {{fontWeight:"250"}}>Home</Text></TouchableOpacity>
                            <TouchableOpacity style = {[styles.row, {alignItems:"center", columnGap: 20}]} onPress={() =>navigation.replace("S_hop")}><Image source= {Shop} style = {{height: iconSize, width: iconSize}}/><Text style = {{fontWeight:"250"}}>Shop</Text></TouchableOpacity>
                            <TouchableOpacity style = {[styles.row, {alignItems:"center", columnGap: 20}]} onPress={() => navigation.replace("Lessons")}><Image style = {{height: iconSize, width: iconSize}} source = {Explore} /><Text style = {{fontWeight:"250"}}>Lessons</Text></TouchableOpacity>
                            <TouchableOpacity style = {[styles.row, {alignItems:"center", columnGap: 20}]} onPress={() => navigation.replace("Advice")}><Image source = {Advice} style = {{height: iconSize, width: iconSize}}/><Text style = {{fontWeight:"250"}}>Advising</Text></TouchableOpacity>
                            <TouchableOpacity style = {[styles.row, {alignItems:"center", columnGap: 20}]} onPress={() => navigation.replace("AI_Chat")}><Image source = {Bot} style = {{height: iconSize, width: iconSize}}/><Text style = {{fontWeight:"250"}}>Chat</Text></TouchableOpacity>
                        </YGroup>

                                                    <TouchableOpacity style = {[styles.row, {bottom: 50, left: 34, position:"absolute", alignItems:"center", columnGap: 20}]} onPress={() => navigation.replace("S_ettings")}><Image source = {SettingsIcon} style = {{height: iconSize, width: iconSize}}/><Text style = {{fontWeight:"250"}}>Settings</Text></TouchableOpacity>


                                                    <TouchableOpacity style = {[styles.row, {alignItems:"center", columnGap: 20, position: "absolute", left: 140, top: 70}]} onPress = {() => setModalView(false)}><Icon name = 'menu-open' size = {34}/></TouchableOpacity>


                            </View> 

                            </View> 
                    </Modal>

                    </>
    )
}


const styles = StyleSheet.create({
 
    row:{
        display:"flex",
        flexDirection: "row",
 
    },

     
    column:{
        display:"flex",
        flexDirection: "column",
 
    },

   
lineBreak:{
    backgroundColor: "lightgray",
    height: 1, 
    
}
})