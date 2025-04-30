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
export default function SideNav({style, buttonColor}){
    //const dispatch = useDispatch(); 
    const navigation = useNavigation(); 

    const [modalView, setModalView] = useState(false); 
       let screenHeight = Dimensions.get("screen").height,
            screenWidth = Dimensions.get("screen").width; 
            const fontS = 20,
            profileImgSize = 75; 
    return(
        <>
          <TouchableOpacity
           
            onPress = {() => setModalView(true)}
            style = {[{position:"absolute", top: 50, left: 25}, style]}>
                <Icon name = "menu" color = {buttonColor} style = {{color: buttonColor, fontSize: 25}}/>
            </TouchableOpacity>
        
         <Modal animationType="fade" animationInTiming={100} animationOutTiming = {100} animationIn = "slideInLeft" animationOut= "slideOutLeft"    visible = {modalView} transparent={true}>
                     <View style = {{backgroundColor: "rgba(0,0,0, .5)", height: "100%", width: "100%"}}>
                        <View onTouchMove={() => setModalView(false)} style = {{backgroundColor: "white", width:screenWidth/2, height: screenHeight, position:'absolute', left: 0, padding: 25, flexDirection: "column", rowGap: 25, paddingTop: 150, paddingLeft: 50}}>
                        
                            <TouchableOpacity style = {[styles.row, {alignItems:"center", columnGap: 20}]} onPress={() =>navigation.replace("H_ome")}><Image style = {{height: iconSize, width: iconSize}} source={Home}/><Text>Home</Text></TouchableOpacity>
                            <TouchableOpacity style = {[styles.row, {alignItems:"center", columnGap: 20}]} onPress={() =>navigation.replace("S_hop")}><Image source= {Shop} style = {{height: iconSize, width: iconSize}}/><Text>Shop</Text></TouchableOpacity>
                            <TouchableOpacity style = {[styles.row, {alignItems:"center", columnGap: 20}]} onPress={() => navigation.replace("H_ome")}><Image style = {{height: iconSize, width: iconSize}} source = {Explore} /><Text>Explore Workouts</Text></TouchableOpacity>
                            <TouchableOpacity style = {[styles.row, {alignItems:"center", columnGap: 20}]} onPress={() => navigation.replace("H_ome")}><Image source = {Advice} style = {{height: iconSize, width: iconSize}}/><Text>Advising</Text></TouchableOpacity>
                            <TouchableOpacity style = {[styles.row, {alignItems:"center", columnGap: 20}]} onPress={() => navigation.replace("H_ome")}><Image source = {Bot} style = {{height: iconSize, width: iconSize}}/><Text>Chat</Text></TouchableOpacity>
                            <TouchableOpacity style = {[styles.row, {alignItems:"center", columnGap: 20}]} onPress={() => navigation.replace("S_ettings")}><Image source = {SettingsIcon} style = {{height: iconSize, width: iconSize}}/><Text>Settings</Text></TouchableOpacity>
                            <TouchableOpacity style = {[styles.row, {alignItems:"center", columnGap: 20, position: "absolute", left: 155, top: 50}]} onPress = {() => setModalView(false)}><Text style = {{fontSize: 20}}>X</Text></TouchableOpacity>

                            <View style = {[styles.column, {position: "relative", bottom: -Dimensions.get("screen").height/1.7}]}>
                            <View style = {[[styles.lineBreak, {top: -65, left: -15}]]}/>
                            <TouchableOpacity style = {{bottom: 50, flexDirection:"row", justifyContent:"center", alignItems:"center", columnGap: 15, display:"relative", left: -17 }}>
                               <Image source = {User} style = {{height: profileImgSize*.5, width: profileImgSize*.5}} />
                               <Text style = {{fontSize: 12.5}}>My Profile</Text>
                           </TouchableOpacity>
                            </View>
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