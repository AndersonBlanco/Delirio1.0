import { useEffect, useState, useRef } from 'react';
import { ImageBackground, ActivityIndicator, StyleSheet, Text, View, Dimensions, Platform, TouchableOpacity, Button, NativeEventEmitter, NativeModules,  } from 'react-native';
import SideNav from '../components/sideNav';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { ScrollView } from 'react-native-gesture-handler';
import TestImg from "../assets/workoutCat.jpg";
import { styles } from './aiCam';


export default function Lessons(){
const nav = useNavigation(); 

const LessonTemplate = ({title, imgSrc})  =>{
    return(
        <ImageBackground style = {{alignSelf:"center", height: 200, backgroundColor:"blue", width: 125, borderRadius: 10,overflow: 'hidden'}} source={imgSrc}>
            <View style = {{flex: 1,backgroundColor:"rgba(1, 1, 1, 0.35)", padding: 10}}>
            <Text style ={{color: "white", fontSize: 14 }}>{title}</Text>
            </View>
        </ImageBackground>
    )
};

const lessons = [
    {
        title: "Punches", 
    funddamental: {
        title: "Fundamental Punches" , 
        data: [ //visually linear punches (ie linear eye level targets)
            {
        title: "Jab", 
        imgSrc: TestImg
    },    {
        title: "Straight-Right", 
        imgSrc: TestImg 
    },    {
        title: "Right Upper-Cut", 
        imgSrc: TestImg
    },    {
        title: "Left Upper-Cut", 
        imgSrc: TestImg
    },{
        title: "Right Hook", 
        imgSrc: TestImg
    },     {
        title: "Left Hook", 
        imgSrc: TestImg
    },     
]
    },
    intermediate:[ //visually linear punches (ie linear eye level targets)
    {
        title: "Low-Jab", 
        imgSrc: TestImg
    },    {
        title: "Low Straight-Right", 
        imgSrc: TestImg
    },     {
        title: "Left-Hook: Liver", 
        imgSrc: TestImg
    },   {
        title: "Left-Hook: Shoulderplex", 
        imgSrc: TestImg
    },       {
        title: "Right-Hook: Pancreas", 
        imgSrc: TestImg
    },     {
        title: "Right-Hook: Shoulderplex", 
        imgSrc: TestImg
    },     {
        title: "Right-Hook: Right Rib", //similar to Right-Hook(pancreas/shoulderplex) target but less of resemblence to an uppere cut than Right-Hook(pancreas/shoulderplex) target
        imgSrc: TestImg
    },  
]
},

{
    title: "Defense", 
    lessons:[

    ]
},
{
    title: "Footwork", 
    lessons:[

    ]
}

];

const Section = ({sectionTitle,sectionLssons}) =>{
    return (
           <View style = {[styles.column, { backgroundColor:"transparent", position:"relative", alignItems:"center", justifyContent:"center", alignContent:"center"}]}>
         <Text style = {{alignSelf:"flex-start", paddingLeft: 20, fontSize: 15}}>{sectionTitle}</Text>

                 <View style = {[styles.column, {position:"relative", height:280, paddingVertical: 20, alignItems:"center", justifyContent:"center", alignContent:"center",}]}>
        <ScrollView horizontal 
        centerContent 
        contentContainerStyle = {{columnGap: 25, overflow: "hidden"}}
        showsHorizontalScrollIndicator = {false} 
        scrollToOverflowEnabled
        overScrollMode='always'
        automaticallyAdjustsScrollIndicatorInsets
        
        style = {[
            styles.row, 
            {
                width: Dimensions.get('screen').width, 
                paddingHorizontal: 25,
                backgroundColor:"transparent",
                bottom: 0

            }]} 
        title = "row_of_fundamental_lessons">
            {
                sectionLssons.map((item) =>{
                    return(
                        <TouchableOpacity key = {item.title} onPress={() => nav.navigate("AI_Cam")}>
                           <LessonTemplate key = {item.title} title = {item.title} imgSrc={item.imgSrc}/>
                        </TouchableOpacity>
                )
                })
            }
            <View title = "filler_padding_element" style = {{width: .5}}/>
        </ScrollView>
    </View>
    </View>  
    )
}


return(
         <View style = {{
                 flex: 1,
                 backgroundColor: "white",
                }}>
            <StatusBar barStyle="light-content" backgroundColor="#000" />
              <SideNav buttonColor={'black'} style = {{zIndex: 1, top: 70, left: -173, marginBottom: 50, position:"relative"}}/>
           <View style = {[styles.column, {
           paddingBottom: 25,
            height: "auto", 
            overflow:"hidden",
             height: Dimensions.get('screen').height,
             backgroundColor:"transparent", 
             alignItems:"center",
              justifyContent:"center",}]}> 
              <ScrollView horizontal = {false} style = {{marginBlock: 30, height: Dimensions.get("screen").height}}>
    
              <Section sectionTitle={lessons[0].funddamental.title} sectionLssons={lessons[0].funddamental.data}/>
              <Section sectionTitle={lessons[0].funddamental.title} sectionLssons={lessons[0].funddamental.data}/>
              <Section sectionTitle={lessons[0].funddamental.title} sectionLssons={lessons[0].funddamental.data}/>
              <Section sectionTitle={lessons[0].funddamental.title} sectionLssons={lessons[0].funddamental.data}/>
         </ScrollView>
        </View>
        </View>
)
}