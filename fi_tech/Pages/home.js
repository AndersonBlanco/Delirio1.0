import { useState } from "react";
import {View, Text, TouchableOpacity, BackHandler, StyleSheet, Image, Dimensions, StatusBar } from "react-native"; 
import { ScrollView } from "react-native-gesture-handler";
import { useDispatc, useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import SideMenu from "../components/sideMenu";
import SideNav from "../components/sideNav";
import CardioImg from "../assets/run.jpg"; 
import User from "../assets/user.png"; 
export default function Home({theme}){
const dispatch = useDispatch();
const [hover, setHover] = useState(0);
const TopNav = (
    <ScrollView style = {styles.topNav} horizontal showsHorizontalScrollIndicator >
    <TouchableOpacity><Text  style = {[styles.topNavText, {textDecorationLine: hover == 0? "underline" : "none", textDecorationStyle:"solid"}]}>My Regimen</Text></TouchableOpacity>
    <TouchableOpacity><Text style = {[styles.topNavText, {textDecorationLine:hover == 2? "underline" : "none", textDecorationStyle:"solid"}]}>Store</Text></TouchableOpacity>
    <TouchableOpacity><Text style = {[styles.topNavText, {textDecorationLine: hover == 3? "underline" : "none", textDecorationStyle:"solid"}]}>Profile</Text></TouchableOpacity>
    <TouchableOpacity><Text style = {[styles.topNavText, {textDecorationLine: hover == 4? "underline" : "none", textDecorationStyle:"solid"}]}>Settings</Text></TouchableOpacity>
</ScrollView>
);

const weekPlan = [
    {
        day: "Monday",
        dayID: 0, //Monday
        title: "Cardio",
        specifics: {
            workouts:["5 Mile run", "30 min Jump Rope"]
        }
    },
    {
        day: "Tuesday",
        dayID: 1, //Monday
        title: "Strength & Conditioning",
        specifics: {
            workouts:["5 Mile run", "30 min Jump Rope"]
        }
    },
    {
        day: "Wednesday",
        dayID: 2, //Monday
        title: "Rest",
        specifics: {
            workouts:["5 Mile run", "30 min Jump Rope"]
        }
    },
    {
        day: "Thursday",
        dayID: 3, //Monday
        title: "Cardio",
        specifics: {
            workouts:["5 Mile run", "30 min Jump Rope"]
        }
    },
    {
        day: "Friday",
        dayID: 4, //Monday
        title: "Cardio",
        specifics: {
            workouts:["5 Mile run", "30 min Jump Rope"]
        }
    },
    {
        day: "Saturday",
        dayID: 5, //Monday
        title: "Rest",
        specifics: {
            workouts:["5 Mile run", "30 min Jump Rope"]
        }
    },
    {
        day: "Sunday",
        dayID: 6, //Monday
        title: "Rest",
        specifics: {
            workouts:["5 Mile run", "30 min Jump Rope"]
        }
    },
    
];


const Timeline = ({data, orientation = 0})=>{
    return (
        <ScrollView scrollEnabled = {false} showsVerticalScrollIndicator = {false} horizontal = {orientation == 0? false : true} style = {{backgroundColor: "transparent", width: Dimensions.get("screen").width * .9, height: Dimensions.get("screen").height* 2, bottom: 70, }}>
            <View style = {[styles.column, {rowGap: 34}]}>
            {
                data.map(item =>
                    <View style = {[styles.column, {rowGap: 15, }]} key={item.dayID}>
                    <View style = {{backgroundColor: item.dayID == 0? "transparent" : "gray", height: 1, width: Dimensions.get("screen").width, marginBottom: 10}}/>
                   
                    <TouchableOpacity style = {[styles.column, {borderColor: "transparent", borderWidth: 2, borderRadius: 10, rowGap: 0, backgroundColor: "transparents", alignItems:"center", justifyContent:"center", width: "100%"}]}>
                       
                       <View style = {{borderRadius: 10, overflow: "hidden"}}>
                       <Image source={CardioImg} style = {{width: Dimensions.get("screen").width*.9, height: Dimensions.get("screen").height * .25}}/>
                      </View>
                    </TouchableOpacity>
                    <View style = {[styles.row]}>
                        <Text style = {{ fontSize: 15,color:theme? "black": "white",  textDecorationLine:"none"}}>{item.day} —</Text><Text style = {{ borderRadius: 10, borderColor: "transparent", borderWidth: 1, color: theme? "gray": "white", alignSelf: "left", paddingHorizontal: 25}}>{item.title}</Text>
                        </View>
                    </View>
                )
            }
            </View>
            <View style = {{height: 55, width: 10}}></View>
            <View style = {{height: 55, width: 10}}></View>
            <View style = {{height: 55, width: 10}}></View>
            <View style = {{height: 55, width: 10}}></View>
            <View style = {{height: 55, width: 10}}></View>
            <View style = {{height: 55, width: 10}}></View>
            <View style = {{height: 55, width: 10}}></View>
        </ScrollView>
    )

}



const DayPlan = ({day}) =>{
    return(
        <View style = {{
            backgroundColor:"transparent",
            width: Dimensions.get("screen").width,
            height: 150,
            position:"relative",
             
            overflow: "hidden",
            justifyContent:"center",
            alignItems:"center",
            height: "fit-content",
            paddingHorizontal: 20, 
            paddingVertical: 15,

        
        }}>
            <Text style = {{alignSelf:"left", color: theme? "black": "white", fontSize: 20, marginVertical: 25}}>Today's Plan <Text style = {{color: theme? "gray": "lightgray"}}>— {day.title}</Text></Text>

          <TouchableOpacity style = {[styles.column, {borderColor: "transparent", borderWidth: 2, borderRadius: 10, rowGap: 0, backgroundColor: "transparents", alignItems:"center", justifyContent:"center", width: "100%"}]}>
                       
                       <View style = {{borderRadius: 10, overflow: "hidden"}}>
                       <Image source={CardioImg} style = {{width: Dimensions.get("screen").width*.9, height: Dimensions.get("screen").height * .15}}/>
                      </View>
                    
                    </TouchableOpacity>
                   
        </View>
    )
};
const WeekPlanDisplay = (
    <View style = {{position:"relative", bottom: -40, marginTop: 25}}>
        <Text style = {{ fontSize: 20,color: theme? "black": "white", bottom: 59, marginVertical: 5, marginBottom: 25}}>My Week</Text>
        <Timeline data = {weekPlan} orientation={0}/>
   
        </View>
        ); 
return(
    <>
    <StatusBar barStyle="light-content" backgroundColor="#000" />

    <View style = {[styles.row, {paddingBottom: 43,paddingHorizontal: 15, justifyContent:"center", alignItems:"center", alignContent:"center"}]}>
    <SideNav buttonColor={theme? "black": "white"} style = {{top: 70, left: 25, marginBottom: 50, position:"relative"}}/>
    <View style = {{backgroundColor: "gray", width: "100%", height: 1, top: -735}}/>
    <Image source={User} style = {{position: "absolute", height: 34, width: 34, right: 27, top: 64}} />
    </View>
   
    <ScrollView contentContainerStyle = {{ marginTop: -20,alignItems:"center", justifyContent:"flex-start", height: Dimensions.get("screen").height *3}}>
    <DayPlan day = {weekPlan[0]}/>
    <View style = {{marginVertical: 10, backgroundColor:"gray", height: 1, width: Dimensions.get("screen").width}}/>
    {WeekPlanDisplay}
    </ScrollView>
    
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
        
        backgroundColor: "transparent"
    },
    topNavText:{
        color:"white",
        fontSize: 12,
        marginHorizontal: 20
    },
    column:{
        display:"flex",
        flexDirection:"column"
    },
    row:{
        display:"flex",
        flexDirection:"row"
    },

})