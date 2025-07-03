import { useEffect, useState, useRef } from 'react';
import { ImageBackground, ActivityIndicator, StyleSheet, Text, View, Dimensions, Platform, TouchableOpacity, Button, NativeEventEmitter, NativeModules,  } from 'react-native';
import SideNav from '../components/sideNav';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { ScrollView } from 'react-native-gesture-handler';
import TestImg from "../assets/workoutCat.jpg";
import { styles } from './aiCam';
import * as Speech from "expo-speech"; 
import { PermissionStatus } from 'expo-permissions';
import * as Permissions from "expo-permissions"; 
import { Audio } from 'expo-av';

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
        title:"Punches", 
        funddamentals:{
            title: "Fundamentals",
            data: [ //visually linear punches (ie linear eye level targets)
            {
        title: "Jab", 
        imgSrc: TestImg
            },  
            {
        title: "Straight-Right", 
        imgSrc: TestImg 
            },   
            {
        title: "Right Upper-Cut", 
        imgSrc: TestImg
            },   
            {
        title: "Left Upper-Cut", 
        imgSrc: TestImg
            },
            {
        title: "Right Hook", 
        imgSrc: TestImg
            },     
            {
        title: "Left Hook", 
        imgSrc: TestImg
            },
                ]
            
        },
        intermediate:{
            title:"Intermediate",
            data: [ //visually linear punches (ie linear eye level targets)
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
        }
    },

    {


    }
]


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

const Punches = (
    <>
             <Section sectionTitle={lessons[0].funddamentals.title} sectionLssons={lessons[0].funddamentals.data}/>
              <Section sectionTitle={lessons[0].intermediate.title} sectionLssons={lessons[0].intermediate.data}/>
              <Section sectionTitle={lessons[0].funddamentals.title} sectionLssons={lessons[0].funddamentals.data}/>
              <Section sectionTitle={lessons[0].funddamentals.title} sectionLssons={lessons[0].funddamentals.data}/>
              </>
);

const LessonTypeConstruct = ({txt, img}) =>
    (
        <TouchableOpacity style = {{backgroundColor:"rgba(0,0,0,.5)", display:"contents"}}>
            <ImageBackground source={img} 
            style = {{
                height: 340,
                 width: 150,
                  alignItems:"center",
                   justifyContent:"center",
                
                   }}>
            <Text style ={{color:"white", fontWeight:"500"}}>{txt}</Text>
            </ImageBackground>
            </TouchableOpacity>
    ); 

const LessonTypes = (
    <>
    <TouchableOpacity>
        <LessonTypeConstruct txt = {"Punches"} img={TestImg} />
        <LessonTypeConstruct txt = {"Punches"} img={TestImg} />
        <LessonTypeConstruct txt = {"Punches"} img={TestImg} />
        <LessonTypeConstruct txt = {"Punches"} img={TestImg} />
    </TouchableOpacity>
    </>
)

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
              justifyContent:"center",
              display:"contents",

              }]}> 
              <ScrollView horizontal = {false} style = {{marginBlock: 30, height: Dimensions.get("screen").height}}>
                {LessonTypes}
         </ScrollView>
        </View>

        <View style = {{backgroundColor:"red", position:"absolute", bottom: 100}}>  
        
        </View>

        </View>
)
}