import { useEffect, useState, useRef, Suspense } from 'react';
import { ImageBackground, ActivityIndicator, StyleSheet, Text, View, Dimensions, Platform, TouchableOpacity, Button, NativeEventEmitter, NativeModules, ActionSheetIOS, Touchable,  } from 'react-native';
import SideNav from '../components/sideNav';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { ScrollView } from 'react-native-gesture-handler';
import TestImg from "../assets/workoutCat.jpg";
import { styles } from './aiCam';
import Item1 from "../assets/item1.jpg"
import Item2 from "../assets/item2.jpg"
import * as Speech from "expo-speech"; 
import { PermissionStatus } from 'expo-permissions';
import * as Permissions from "expo-permissions"; 
import { Audio } from 'expo-av';
 import { Group, Separator, TabsProvider, XGroup, XStack, YGroup, YStack } from 'tamagui';
import ActionSheet, { SheetProvider, SheetManager, registerSheet } from 'react-native-actions-sheet';
import { Badge, Icon, Tab } from 'react-native-elements';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { ScreenHeight, ScreenWidth } from 'react-native-elements/dist/helpers';
import { Label } from '@expo/ui/swift-ui';
//import * as DropdownMenuPrimitive from "@rn-primitives/dropdown-menu";
import { Spinner } from 'tamagui';

import { ChatEnvironment } from '../components/ChatEnvironment';
import Ali1 from "../assets/Ali1.jpeg";
import Ali2 from "../assets/Ali2.jpeg";
import Ali3 from "../assets/Ali2.webp";
import Ali4 from "../assets/Ali4.webp";
import SugarRayLeonard1 from "../assets/SugarRayLeonard1.webp"; 
import SugarRayLeonard2 from "../assets/SugarRayLeonard2.jpg"; 
import SugarRayLeonard3 from "../assets/SugarRayLeonard3.jpg"; 
import RobertoDuran1 from "../assets/RobertoDuran1.jpg"; 
import Vasily1 from "../assets/Vasily1.jpeg";
import Hearns4 from "../assets/Hearns4.jpg";
import MachoCamacho1 from "../assets/MachoCamacho1.jpg";
import JulioCesarChavez1 from "../assets/Julio_Cesar1.jpg"; 
import MikeTyson1 from "../assets/MikeTyson1.jpg";
import Whitaker1 from "../assets/Whitaker1.jpg"; 
import Nassem1 from "../assets/Nassem1.jpg"; 

import SergioMartinez1 from "../assets/SergioMartinez1.jpg";
import MannyPacquiao1 from "../assets/MannyPacquiao1.jpg";
import Caenlo1 from "../assets/Canelo1.jpg"; 

export default function Lessons(){
const nav = useNavigation(); 
const PlayButton = () =>{

    return(
            <Animated.View style = {{position:"absolute", right: ScreenWidth/15, bottom: -34}}>
           <TouchableOpacity style = {{ borderRadius: 100, backgroundColor:"transparent"}} 
           onPressOut={() =>{
             SheetManager.hide("Lesson")
             .then(()=>nav.navigate("AI_Cam"))
            }}  >
            <Icon containerStyle = {{backgroundColor:"white", borderRadius: 100, overflow: 'visible', boxSizing:"content-box", padding: 0}} iconStyle={{position:"relative", margin: -10}} type='ionicon' style={{flex: 1}} fill = "white" size = {90} name = "play-circle" color={"black"} />
           </TouchableOpacity>
            </Animated.View>
    )
}


const LessonSheet = ({payload}) =>{

    return(
           <ActionSheet
           containerStyle={{overflow:'hidden', backgroundColor:"rgb(252, 252, 252)"}}
      gestureEnabled={true}
      indicatorStyle={{
        width: 100,
        backgroundColor:"rgba(255,255,255,.9)",
        height:3,
        position:"absolute",
        zIndex: 25,
      }}>
      <View
        style={{
          paddingHorizontal: 12,
          height: Dimensions.get('screen').height/1.17,
          alignItems: 'center',
          justifyContent: 'center',
          overflow:"hidden",
          
        }}>

            <ImageBackground imageStyle = {{borderBottomRightRadius: 0, borderBottomLeftRadius: 0}} source={payload.img} style = {{borderRadius: 50, position:"relative", top: -Dimensions.get('screen').height/4, width:Dimensions.get('screen').width, height: 320, }}>
                <PlayButton/>
            </ImageBackground>


        <YStack rowGap={25} paddingHorizontal={25} backgroundColor = {"transparent"} position='absolute' zIndex = {-1} paddingTop ={175} >
           

        <YGroup rowGap={7}>
       <Text
          style={{
            color: 'black',
            fontSize: 30,
            textAlign: 'left',
            marginBottom: 10,
          }}>
           {payload.title}
           </Text>

        <XGroup alignItems='center' justifyContent='flex-start' columnGap={10}>
            {
                payload.freeStyle == true?
                <>
                           <View><Badge badgeStyle = {{height: 12, width:12, borderRadius: 100}} containerStyle = {{borderRadius: 100, boxSizing:"content-box"}} value = "" status = {"success"}/></View>
                                      <Text>Fundamental</Text>
                             <View><Badge badgeStyle = {{height: 12, width:12, borderRadius: 100}} containerStyle = {{borderRadius: 100, boxSizing:"content-box"}} value = "" status = {"warning"}/></View>
                                        <Text>Intermediate</Text>
                            <View><Badge badgeStyle = {{height: 12, width:12, borderRadius: 100}} containerStyle = {{borderRadius: 100, boxSizing:"content-box"}} value = "" status = {"primary"}/></View>
                                       <Text>Advanced</Text>

                </>
                :
                <>
            <View><Badge badgeStyle = {{height: 12, width:12, borderRadius: 100}} containerStyle = {{borderRadius: 100, boxSizing:"content-box"}} value = "" status = {payload.badgeStatus}/></View>
           <Text>{payload.difficulty}</Text>
           </>
            }


        </XGroup>

        </YGroup>

                <Text style = {{color:"rgba(0,0,0,.7)"}}>
                    {payload.description}
             </Text>
    </YStack>
  


     <YGroup style = {{position:"absolute", display:"none"}}>

 <Text style = {{color:"rgba(0,0,0,.85)", top:25}}>Want to get the best out of the workout? Try these products:</Text>
 
 <XGroup>
    <TouchableOpacity><Text>Item1</Text></TouchableOpacity>
 </XGroup>

</YGroup>
            

      </View>
    </ActionSheet>
    )
}


registerSheet("Lesson", LessonSheet); 

const LessonTemplate = ({title, imgSrc, customWidth = false})  =>{
    return(
        <ImageBackground style = {[{ alignSelf:"center", height: 200, backgroundColor:"blue", width: customWidth? customWidth : 200, borderRadius: 10,overflow: 'hidden'}]} source={imgSrc}>
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
        imgSrc: SugarRayLeonard3,
        difficulty: "Fundamental",
        badgeStatus:"success",
        description:"The Jab is the most fundamental punch is the sport of the sport. The sweet science of boxing is heavily inspired by it. The punch is comsposed of harmonic sinergy between the shoulders cuff rotation, elbows/arm extension, and hip rotations to generate speed and power"
            },  
            {
        title: "Straight-Right", 
        imgSrc: RobertoDuran1 ,
        difficulty: "Fundamental",
        badgeStatus:"success",
        description:"The Jab is the most fundamental punch is the sport of the sport. The sweet science of boxing is heavily inspired by it. The punch is comsposed of harmonic sinergy between the shoulders cuff rotation, elbows/arm extension, and hip rotations to generate speed and power"
            },   
            {
        title: "Right Upper-Cut", 
        imgSrc: JulioCesarChavez1,
        difficulty: "Fundamental",
        badgeStatus:"success",
        description:"The Jab is the most fundamental punch is the sport of the sport. The sweet science of boxing is heavily inspired by it. The punch is comsposed of harmonic sinergy between the shoulders cuff rotation, elbows/arm extension, and hip rotations to generate speed and power"
            },   
            {
        title: "Left Upper-Cut", 
        imgSrc: Vasily1,
        difficulty: "Fundamental",
        badgeStatus:"success",
        description:"The Jab is the most fundamental punch is the sport of the sport. The sweet science of boxing is heavily inspired by it. The punch is comsposed of harmonic sinergy between the shoulders cuff rotation, elbows/arm extension, and hip rotations to generate speed and power"
            },
            {
        title: "Right Hook", 
        imgSrc: MachoCamacho1,
        difficulty: "Fundamental",
        badgeStatus:"success",
        description:"The Jab is the most fundamental punch is the sport of the sport. The sweet science of boxing is heavily inspired by it. The punch is comsposed of harmonic sinergy between the shoulders cuff rotation, elbows/arm extension, and hip rotations to generate speed and power"
            },     
            {
        title: "Left Hook", 
        imgSrc: Hearns4,
        difficulty: "Fundamental",
        badgeStatus:"success",
        description:"The Jab is the most fundamental punch is the sport of the sport. The sweet science of boxing is heavily inspired by it. The punch is comsposed of harmonic sinergy between the shoulders cuff rotation, elbows/arm extension, and hip rotations to generate speed and power"
            },
                ]
        },
        intermediate:{
            title:"Intermediate",
            data: [ //visually linear punches (ie linear eye level targets)
    {
        title: "Slip", 
        imgSrc: Nassem1,
        difficulty:"Intermediate",
        badgeStatus:"warning",
                description:"The Jab is the most fundamental punch is the sport of the sport. The sweet science of boxing is heavily inspired by it. The punch is comsposed of harmonic sinergy between the shoulders cuff rotation, elbows/arm extension, and hip rotations to generate speed and power"
    },    {
        title: "Duck", 
        imgSrc: MikeTyson1,
        difficulty:"Intermediate",
        badgeStatus:"warning",
                description:"The Jab is the most fundamental punch is the sport of the sport. The sweet science of boxing is heavily inspired by it. The punch is comsposed of harmonic sinergy between the shoulders cuff rotation, elbows/arm extension, and hip rotations to generate speed and power"
    },     {
        title: "Pull-Back-Feint", 
        imgSrc: Whitaker1,
        difficulty:"Intermediate",
        badgeStatus:"warning",
                description:"The Jab is the most fundamental punch is the sport of the sport. The sweet science of boxing is heavily inspired by it. The punch is comsposed of harmonic sinergy between the shoulders cuff rotation, elbows/arm extension, and hip rotations to generate speed and power"
    },  
        ]
        },
        advanced: {
            title: "Advanced",
            data:[
              {
        title: "Straight Combinations", 
        imgSrc: MannyPacquiao1,
        difficulty:"Intermediate",
        badgeStatus:"warning",
                description:"The Jab is the most fundamental punch is the sport of the sport. The sweet science of boxing is heavily inspired by it. The punch is comsposed of harmonic sinergy between the shoulders cuff rotation, elbows/arm extension, and hip rotations to generate speed and power"
    },
    {
        title: "Straight + Hooked Combination", 
        imgSrc: SergioMartinez1,
        difficulty:"Intermediate",
        badgeStatus:"warning",
                description:"The Jab is the most fundamental punch is the sport of the sport. The sweet science of boxing is heavily inspired by it. The punch is comsposed of harmonic sinergy between the shoulders cuff rotation, elbows/arm extension, and hip rotations to generate speed and power"
    },
    {
        title: "Counters", 
        imgSrc: Caenlo1,
        difficulty:"Intermediate",
        badgeStatus:"warning",
                description:"The Jab is the most fundamental punch is the sport of the sport. The sweet science of boxing is heavily inspired by it. The punch is comsposed of harmonic sinergy between the shoulders cuff rotation, elbows/arm extension, and hip rotations to generate speed and power"
    },
            ]
        }
    },

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
                bottom: 0,
                

            }]} 
        title = "row_of_fundamental_lessons">
            {
                sectionLssons.map((item) =>{
                    return(
                        <TouchableOpacity 
                        key = {item.title} 
                        onPress={() => 
                            SheetManager.show('Lesson', 
                                {payload:{
                                    title:item.title,
                                    img:item.imgSrc,
                                    badgeStatus: item.badgeStatus,
                                    description:item.description,
                                    difficulty:item.difficulty
                                }
                            }
                            )
                        }
                        >
                            <Suspense fallback={LoadingActivity}>
                           <LessonTemplate key = {item.title} title = {item.title} imgSrc={item.imgSrc}/>

                            </Suspense>
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
<ScrollView horizontal>
       <TouchableOpacity onPress={() => SheetManager.show("Lesson", {
        payload:{
            freeStyle: true,
            title:"Free-Style",
             img:Ali4,
            difficulty: "Advanced",
            description:"Execute any movement at your heart's desire as FiTech evaluates your executions!"
        }
       })} style = {{marginBottom:40, alignSelf:"flex-start", marginLeft: 25}}>
        <LessonTemplate title = {"FreeStyle"} imgSrc={Ali3} customWidth = {370}/>
     </TouchableOpacity>
     </ScrollView>

             <Section sectionTitle={lessons[0].funddamentals.title} sectionLssons={lessons[0].funddamentals.data}/>
              <Section sectionTitle={lessons[0].intermediate.title} sectionLssons={lessons[0].intermediate.data}/>
              <Section sectionTitle={lessons[0].advanced.title} sectionLssons={lessons[0].advanced.data}/>
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


const DropDownOptions= ['Boxing', 'Takewandoo', 'Fencing', 'Basketball', 'Golf'];
const [doropDown_idx, ste_doropDown_idx] = useState(0); 
const [sportCategory, setSportCategory] = useState(0); 

const animatedOpacity = useSharedValue(1); 


const DoropDownMenu = () =>{
    return(
     <>

     </>
    )
    
}

//SheetManager.show('Lesson', {payload:{title: 'FreeStyle', img: TestImg}});
const LoadingActivity = (
    <View style = {{position:"absolute", alignItems:"center", justifyContent:"center", zIndex: 100, backgroundColor:"white", height:Dimensions.get('screen').height, width: Dimensions.get("screen").width}}>
            <Spinner color = "black"/>
    </View>
);

return(
    <SheetProvider>
               <StatusBar barStyle="light-content" backgroundColor="#000" />

         <View 
         style = {{
                 flex: 1,
                 backgroundColor: "white",
                 paddingTop: 120
                }}>

{
/*
              <Tabs defaultValue='boxing'>
                <Tabs.List>
                    <Tabs.Tab value = "boxing">
                        <Text>Boxing</Text>
                    </Tabs.Tab>
                </Tabs.List>

              </Tabs>
              */
}

 <SideNav buttonColor={'black'} style = {{zIndex: 1, position:"absolute", top: 70, left: 23, backgroundColor:"transparent",}}/>
 
 
<XStack columnGap={20} alignContent='center' alignItems="center" justifyContent='center' width={ScreenWidth} paddingHorizontal={20} >
        {
    ["Boxing", "Takewand", "Basketball", "Golf"].map((item, idx) =>{
        return(
 
              <TouchableOpacity style = {{}} onPress = {() =>{ 
                setSportCategory(idx); 
                 
                }}>
                <Text style = {{color:sportCategory == idx? "black" : "gray", borderBottomColor:"black", paddingBottom: 10, borderBottomWidth:idx == sportCategory? 1.25 : 0, paddingVertical: 1,}}>{item}</Text>
            </TouchableOpacity>
 
        )
    })
}
    

</XStack>
  

         <ScrollView horizontal = {false} style = {{marginTop: 12.5, paddingTop: 10, height: Dimensions.get("screen").height}}>
                
                {Punches}
         </ScrollView>
        </View>
        
        </SheetProvider>
)
}