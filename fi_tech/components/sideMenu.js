import {View, ScrollView, Text, TouchableOpacity, Image, StyleSheet, Dimensions} from "react-native";
import Modal from "react-native-modal"; 
import { useState } from "react";
import User from "../assets/user.png"; 

import { nav } from "../redux/navigationSlice";
import { useDispatch, useSelector} from "react-redux";

export default function SideMenu(){
    let profileImgSize = 110; 
    const dispatch = useDispatch();

    const [modalView, setModalView] = useState(false); 
    const _SideMenu = (
       <>
       <TouchableOpacity onPress = {() => setModalView(!modalView)} style = {{position:"absolute", left: 20.5, top: 48}}><Text>=</Text></TouchableOpacity>
               <Modal animationInTiming={601} animationOutTiming = {500} backdropColor="transparrent" animationIn = "slideInLeft" animationOut= "slideOutLeft" isVisible = {modalView} onTouchMove={() => setModalView(false)} style={{}}>
                   <View style = {[styles.row, {height:"110%"}]}  >
                   <View style = {{paddingTop: 65, backgroundColor: "white", height: "100%", width: "50%", shadowColor: "black", shadowOpacity: .25, shadowRadius: 5, shadowOffset:{width: 10}, }}>
                       <ScrollView style ={{top: -50}}>
                     <View style = {[styles.column, {paddingTop: 100, rowGap: 15, paddingRight: 25}]}>
                       <TouchableOpacity onPress={() => dispatch(nav("MyPillPals"))}><Text style = {[styles.sideMenuText, {fontSize: 15}]}>Manage Pill-Pals</Text></TouchableOpacity>
                       <View style = {styles.lineBreak}/>
                       <TouchableOpacity onPress={() => dispatch(nav("Home"))}><Text style = {[styles.sideMenuText, {fontSize: 15}]}>Dashboard</Text></TouchableOpacity>
                       <View style = {styles.lineBreak}/>
                       <TouchableOpacity onPress={() => dispatch(nav("Settings"))}><Text style = {[styles.sideMenuText, {fontSize: 15}]}>Settings</Text></TouchableOpacity>
       
                     </View>
                     </ScrollView>
                     <View style = {[[styles.lineBreak, {top: -65, left: -15}]]}/>
                     <TouchableOpacity style = {{bottom: 50, flexDirection:"row", justifyContent:"center", alignItems:"center", columnGap: 15, display:"relative", left: -17 }}>
                       <Image source = {User} style = {{height: profileImgSize*.5, width: profileImgSize*.5}} />
                       <Text style = {{fontSize: 12.5}}>My Profile</Text>
                   </TouchableOpacity>
                   </View>
               
                   </View>
               </Modal>
               </>
           ); 
        return _SideMenu; 
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

    globalPillPalContainer:{
     bottom: 50, 
    },
    pillpalContainer:{
        display:"flex",
        flexDirection:"row",
        columnGap: 100, 
        width: Dimensions.get("screen").width *.7,
        alignItems:"center",
        justifyContent:"space-evenly",
        borderTopWidth: 1, 
        borderTopColor: "rgba(0,0,0,.25)",
        paddingHorizontal: 0, 
        paddingVertical: 15,



    },

addPillPal:{
    backgroundColor: "rgba(250, 84,84,1)",
    paddingVertical: 10, 
    alignItems:"center",
    justifyContent:"center",
    width: Dimensions.get("screen").width * .7, 
    borderRadius: 100,
    bottom: -50
     
},
lineBreak:{
    backgroundColor: "lightgray",
    height: 1, 
    
}
})