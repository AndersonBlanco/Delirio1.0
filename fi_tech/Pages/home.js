import { useState } from "react";
import {View, Text, TouchableOpacity, BackHandler, StyleSheet } from "react-native"; 
import { ScrollView } from "react-native-gesture-handler";
import { useDispatc, useSelector } from "react-redux";
import { useDispatch } from "react-redux";
export default function Home(){
const dispatch = useDispatch();
const [hover, setHover] = useState(0);
return(
    <>
    <ScrollView style = {styles.topNav} horizontal showsHorizontalScrollIndicator >
        <TouchableOpacity><Text  style = {[styles.topNavText, {textDecorationLine: hover == 0? "underline" : "none", textDecorationStyle:"solid"}]}>My Regimen</Text></TouchableOpacity>
        <TouchableOpacity><Text style = {[styles.topNavText, {textDecorationLine:hover == 1? "underline" : "none", textDecorationStyle:"solid"}]}>My Custom Workouts</Text></TouchableOpacity>
        <TouchableOpacity><Text style = {[styles.topNavText, {textDecorationLine:hover == 2? "underline" : "none", textDecorationStyle:"solid"}]}>Store</Text></TouchableOpacity>
        <TouchableOpacity><Text style = {[styles.topNavText, {textDecorationLine: hover == 3? "underline" : "none", textDecorationStyle:"solid"}]}>Profile</Text></TouchableOpacity>
        <TouchableOpacity><Text style = {[styles.topNavText, {textDecorationLine: hover == 4? "underline" : "none", textDecorationStyle:"solid"}]}>Settings</Text></TouchableOpacity>
    </ScrollView>
    <View style = {{backgroundColor: "gray", width: "100%", height: 1, top: -735}}/>
     <Text style ={{color: "white"}}>Home</Text>
    </>    
)
}

const styles = StyleSheet.create({
    cont:{
        backgroundColor: "white",
        height: "100%",
        width:"200%"
    },
    topNav:{
        display: "flex",
        flexDirection: "row",
        columnGap: 50, 
        width: "100%",
        alignContent:"center",
        bottom: -25,
        
        backgroundColor: "red"
    },
    topNavText:{
        color:"white",
        fontSize: 12,
        marginHorizontal: 20
    }
})