import { useState } from "react";
import {View,Button, Text, TouchableOpacity, BackHandler, StyleSheet, Image, Dimensions, StatusBar, Touchable } from "react-native"; 
import { ScrollView } from "react-native-gesture-handler";
import { useDispatc, useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import SideMenu from "../components/sideMenu";
import SideNav from "../components/sideNav";
import CoverImg from "../assets/MannyPacquiao1.jpg"; 
import User from "../assets/profile8.png"; 
 import { ActionSheetIOS } from "react-native";
import {Sheet,  Avatar,Separator, XGroup, YGroup, Select, Label, SelectIcon, Tooltip, TooltipGroup, Paragraph, } from "tamagui"; 
import * as Progress from "react-native-progress";
import { Badge, Card } from "react-native-elements";
import { animations } from "@tamagui/config";
import { Icon } from "react-native-elements";
import Logo from "../assets/logo2.jpeg";
import LogoSVG from "../assets/logo2_SVG";
import Svg from "react-native-svg";
import Fire from "../assets/fire.png";
import Logo2SVG from "../assets/logo2_SVG";
import Wrong from "../assets/wrong.png"; 
import Boxing_Glove from "../assets/boxing_glove.png"; 
//import {LinearGradient} from"tamagui/linear-gradient";
//import { LinearGradient } from "expo-linear-gradient";
import ChatBubble from "react-native-chat-bubble";
import { ScreenHeight, ScreenWidth } from "react-native-elements/dist/helpers";
import { NativeModules } from "react-native";
import { generateVoice_jsthread } from "../components/ChatEnvironment";

const {TTS} = NativeModules; 

export default function Home({theme}){
const dispatch = useDispatch();
const [hover, setHover] = useState(0);
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
        <YGroup rowGap={50} scrollEnabled = {false} showsVerticalScrollIndicator = {false} horizontal = {orientation == 0? false : true} style = {{backgroundColor: "transparent", width: Dimensions.get("screen").width * .9, height: Dimensions.get("screen").height* 2, bottom: 70, }}>
        
            {
                data.map((item, idx) =>
                    <View style = {[styles.column, {rowGap: 15, }]} key={item.dayID}>
                   
                    <TouchableOpacity style = {[styles.column, {borderColor: "transparent", borderWidth: 2, borderRadius: 10, rowGap: 0, backgroundColor: "transparents", alignItems:"center", justifyContent:"center", width: "100%"}]}>
                       
                       <View style = {{borderRadius: 10, overflow: "hidden"}}>
                       <Image source={CoverImg} style = {{width: Dimensions.get("screen").width*.9, height: Dimensions.get("screen").height * .25}}/>
                      </View>
                    </TouchableOpacity>
                    <View style = {[styles.row]}>
                        <Text style = {{ fontWeight: "200", fontSize: 15,color:theme? "black": "black",  textDecorationLine:"none"}}>{item.day} —</Text><Text style = {{ fontWeight: "200", borderRadius: 10, borderColor: "transparent", borderWidth: 1, color: theme? "gray": "black", alignSelf: "left", paddingHorizontal: 25}}>{item.title}</Text>
                        </View>

            {    idx <  item.length -1?   
                <Separator width={Dimensions.get('screen').width* .85} marginVertical={20} horizontal alignSelf="center"/>
                :
                null
            }
                    </View>
                )
            }
       
        </YGroup>
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
            <Text style = {{alignSelf:"left", color: theme? "black": "black", fontSize: 20, fontWeight: 500, marginVertical: 25}}>Today's Plan <Text style = {{color: theme? "gray": "lightgray"}}>— {day.title}</Text></Text>

          <TouchableOpacity style = {[styles.column, {borderColor: "transparent", borderWidth: 2, borderRadius: 10, rowGap: 0, backgroundColor: "transparents", alignItems:"center", justifyContent:"center", width: "100%"}]}>
                       
                       <View style = {{borderRadius: 10, overflow: "hidden"}}>
                       <Image source={CoverImg} style = {{width: Dimensions.get("screen").width*.9, height: Dimensions.get("screen").height * .15}}/>
                      </View>
                    
                    </TouchableOpacity>
                   
        </View>
    )
};
const WeekPlanDisplay = (
    <View style = {{position:"relative", bottom: -70, }}>
        <Text style = {{ fontWeight:'500', fontSize: 20,color: theme? "black": "black", bottom: 59, marginVertical: 0, bottom: 65, marginBottom: 25}}>My Week</Text>
        <Timeline data = {weekPlan} orientation={0}/>
        </View>
        ); 
        
//new aproach:  
const pastUI = (
    <ScrollView showsVerticalScrollIndicator = {false} style = {{bottom: -10}} contentContainerStyle = {{ marginTop: -20,alignItems:"center", justifyContent:"flex-start", height: Dimensions.get("screen").height *2.8}}>
    <DayPlan day = {weekPlan[0]}/>
     <Separator borderColor="gray" width={Dimensions.get('screen').width* .9} marginVertical={20} horizontal alignSelf="center"/>
    {WeekPlanDisplay}
    </ScrollView>
)
 
const weekDaysInitials = ['Su', 'M', 'Tu', 'W', 'Th', 'F', 'Sa'];
const [selectedWeekDay, setSelectedWeekDay] = useState(new Date().getDay());
const WeekDaysUI = ()=>{
    return(
        <XGroup columnGap={10} top = {20}>
            {
        weekDaysInitials.map((item, idx) =>{
                    return(
                        <TouchableOpacity key = {item} onPress={() => setSelectedWeekDay(idx)}>
                        <Avatar circular borderRadius = {0}  borderTopColor = {idx == selectedWeekDay? "rgba(0,0,0,.75)" : "rgba(0,0,0,.05)"} borderStyle="solid"  borderTopWidth={idx == selectedWeekDay? 1.5 : 0} borderBottomWidth={idx == selectedWeekDay? 0 : 0} >
                            <Text style = {{color: idx == selectedWeekDay? "black" : "rgba(0,0,0,.5)"}}>{item}</Text>
                        </Avatar>
                        </TouchableOpacity>
                    )
             })
            }
            </XGroup>
    )
};


const TodayLesson = (
    <View style = {{marginVertical: 12}}>
       <Text style = {{alignSelf:'left', fontWeight: 400, paddingHorizontal:20, bottom: -37, left: -8.1,fontSize: 19}}>Today's Lesson</Text>
    <Card containerStyle = {{ marginVertical: 50, borderRadius: 17, borderColor:"rgba(0, 0, 0, .05)"}} wrapperStyle = {{width: Dimensions.get('screen').width*.8,  borderStyle:"solid", borderWidth: 0, borderColor:"rgba(0,0,0,0)",}}>
        
        <XGroup alignItems="center" justifyContent="left"> 
        <Card.Title style = {{ alignSelf:"flex-start", color:"black", fontSize: 20, fontWeight: 400}}>Jab </Card.Title>
        <Card.Title style = {{alignSelf:"right", color:"black", fontWeight: "200", top: 5, position:"absolute", right: 0}}><View><Badge badgeStyle = {{paddingVertical:0, paddingHorizontal:7, borderRadius: 100, borderColor: "red", borderWidth: 0}} containerStyle = {{borderRadius: 100, boxSizing:"content-box"}} value = "Advanced" status = {"primary"}/></View></Card.Title>
        </XGroup>

        <Card.Image source = {CoverImg} borderRadius={10}/>
        
        <Card.FeaturedTitle style = {{ paddingHorizontal: 15, paddingTop: 20, paddingBottom: 2.5, color:"rgba(0,0,0,.75)", fontWeight: 400, fontSize: 12}}> The Jab is the most used punch type in the book, dont miss out on it. Learn the jab at the next level awating you! </Card.FeaturedTitle>
 
         <TouchableOpacity onPress = {() => {
           //TTS.speak("Hello Universe, i hope you are well."); 
           //generateVoice_jsthread("Hello Universe, i hope your well! Try to maintain your guard up and twist your hips to generate forward thrust!!")
         }} style = {{backgroundColor:"rgba(0,0,0,.85)", alignSelf:"flex-end",  alignItems:"center", justifyContent:"center", borderRadius: 100, borderWidth: 0, paddingVertical: 5, paddingHorizontal: 25}}>
            <Text style = {{color:"white", fontSize:17}}>Start</Text>
         </TouchableOpacity>

    </Card>
    </View>
);
// <Text style = {{alignSelf: 'left', left: 15, fontSize: 15, marginVertical: 25}}>Last Performance Stats</Text>

/*  <TouchableOpacity onPress = {() => {
           //TTS.speak("Hello Universe, i hope you are well."); 
           //generateVoice_jsthread("Hello Universe, i hope your well! Try to maintain your guard up and twist your hips to generate forward thrust!!")
         }} style = {{backgroundColor:"rgba(0,0,0,1)", borderStyle:"solid", alignSelf:"flex-start",  alignItems:"center", justifyContent:"center", borderRadius: 100, borderWidth: 2, paddingVertical: 7, paddingHorizontal: 20, marginTop: 5}}>
            <Text style = {{color:"white", fontSize:12}}>Try Now</Text>
         </TouchableOpacity>
*/

const LastPerformanceStats = () => 
    <YGroup alignItems="center" justifyContent="center" marginVertical={15} backgroundColor={"transparent"}>
            <Text style = {{alignSelf:"left", fontWeight: 400, fontSize: 19, left: 10, top: -10}}>Recent Performance</Text>
        <XGroup justifyContent="space-between" alignItems="center" columnGap={10} marginVertical={2}>
            <XGroup.Item>
                 <TouchableOpacity style = {{rowGap: 7, borderRadius: 15, paddingHorizontal: 15, paddingVertical: 5}}>
                                <Image source={Fire} style = {{height: 25, width: 25, alignSelf:"center"}}/>

                <Text color = "lightgray" style = {{textAlign:"center",color: "rgba(0,0,0,.75)" }}>1.5 p/s</Text>
                <Text color ="lightgray" style = {{textAlign:"center",color: "rgba(0,0,0,.75)", fontSize: 11 }}>Punch Speed</Text>
            </TouchableOpacity>
            </XGroup.Item>
           
            <Separator vertical borderColor = "lightgray" borderWidth={1} height = {80}/>

              <XGroup.Item>
                <TouchableOpacity style = {{rowGap: 7, borderRadius: 15, paddingHorizontal: 12, paddingVertical: 5}}>
                   <Image source={Boxing_Glove} style = {{height: 25, width: 25, alignSelf:"center", transform: [{rotateZ:"45deg"}]}}/>

  
                 <Text color ="lightgray" style = {{textAlign:"center", color: "rgba(0,0,0,.75)" }}>3:00 mins</Text>
                <Text color = "lightgray" style = {{textAlign:"center",color: "rgba(0,0,0,.75)", fontSize: 11 }}>Lesosns Time</Text>
            </TouchableOpacity>
            </XGroup.Item>
      
            <Separator vertical borderColor={"lightgray"} borderWidth={1} height={80}/>
              <XGroup.Item>
                <TouchableOpacity style = {{rowGap: 7, borderRadius: 15, paddingHorizontal: 20, paddingVertical: 5}}>
                        <Image source={Wrong} style = {{height: 25, width: 25, alignSelf:"center"}}/>
                  <Text color = "lightgray" style = {{textAlign:"center", color: "rgba(0,0,0,.65)"}}>2</Text>
                <Text color = "lightgray" style = {{textAlign:"center", color: "rgba(0,0,0,.65)", fontSize: 11}}>Incorrects</Text>
            </TouchableOpacity>
            </XGroup.Item>
          
        </XGroup>



 
         
            
    </YGroup>


const AI_PastLesson_re4view = (
    <View>
        <View      
        style = {{
             borderStyle:"solid", borderWidth: 1.7, borderColor:"rgba(0,0,0,.07)",
          paddingHorizontal: 10, alignItems:"center",justifyContent:"center", backgroundColor:"rgba(0,0,0,.0)", left: 15, bottom: -55, width:Dimensions.get('screen').width * .8, height: Dimensions.get('screen').height*.12, borderRadius: 25,borderTopLeftRadius: 0, }}>
          <Avatar position="absolute" left = {-43} bottom = {77}>
            <Logo2SVG height = {40} />
        </Avatar>
        <Text style = {{color:"rgba(0,0,0,.75)", alignSelf:"center", textAlign:"left", paddingLeft: 10}}>Nice stats, but your punch speed could increase, why dont you give it another try this in today's lesson?</Text>
        </View>
</View>
)

return(
    <>
    <StatusBar barStyle="dark-content" backgroundColor="#000" />

    <View style = {[styles.row, {paddingBottom: 40,paddingHorizontal: 15, justifyContent:"center", alignItems:"center", alignContent:"center"}]}>
    <SideNav buttonColor={theme? "black": "black"} style = {{top: 70, left: 64, marginBottom: 50, position:"relative"}}/>
   
   
    <View style = {{ backgroundColor: "gray", width: "100%", height: 1, top: -735}}/>

<TouchableOpacity>
   <Avatar circular size ={"$4.5"} style = {{top: 48, right: 20}} padded = {false} padding={false} >
    <Avatar.Image source={User}/> 
   </Avatar>
   </TouchableOpacity>

    </View>
   
      <ScrollView horizontal = {false} style = {{bottom: 0}} centerContent contentContainerStyle = {{alignItems:"center", justifyContent:"center", }} showsVerticalScrollIndicator = {false} >

   
   <WeekDaysUI/>

   {TodayLesson}

 
     <LastPerformanceStats/>


<View style = {{justifyContent:"center", backgroundColor:"transparent", paddingVertical: 10, paddingBottom: 37}}>
<XGroup paddingBottom = {0}>
      <Text style = {{fontSize: 19, fontWeight: 400, alignSelf:"left", right: -26.5, bottom: -2 }}>New Releases</Text>
            <TouchableOpacity style = {{position:"absolute", right: 21, alignSelf:"flex-end", bottom:-5}}> <Text style = {{ color:"gray",  borderBottomColor:"gray", borderBottomWidth: 1, fontSize: 12}}>see more</Text></TouchableOpacity>
</XGroup>

         <XGroup showScrollIndicator = {false} scrollable backgroundColor={"transparent"} alignItems="top" justifyContent="center" paddingTop = {1} alignSelf="center" paddingHorizontal = {11}>
            
                  <TouchableOpacity>
             <Card containerStyle = {{ marginVertical: 15, borderRadius: 17, borderColor:"rgba(0, 0, 0, .05)"}} wrapperStyle = {{width: Dimensions.get('screen').width*.8,  borderStyle:"solid", borderWidth: 0, borderColor:"rgba(0,0,0,0)",}}>
        <XGroup alignItems="center" justifyContent="left"> 
        <Card.Title style = {{ alignSelf:"flex-start", color:"black", fontSize: 15, fontWeight: 250}}> Angles </Card.Title>
        <Card.Title style = {{top: 3,color:"black", fontWeight: "200", position:"absolute", right: 0}}><View><Badge badgeStyle = {{paddingVertical:0, paddingHorizontal:7, borderRadius: 100, borderWidth: 0}} containerStyle = {{borderRadius: 100, boxSizing:"content-box"}} value = "Advanced" status = {"primary"}/></View></Card.Title>
        </XGroup>
        <Card.FeaturedTitle style = {{ paddingHorizontal: 0, paddingTop: 1, paddingBottom: 0, color:"rgba(0,0,0,.75)", fontWeight: 400, fontSize: 12, textAlign:"left"}}>The One-Two combination is built upon the fundamental punches Jab and Straight-Right, a lethal and speedy combo. </Card.FeaturedTitle>
    </Card>
    </TouchableOpacity>

            
            <TouchableOpacity>
             <Card containerStyle = {{ marginVertical: 15, borderRadius: 17, borderColor:"rgba(0, 0, 0, .0)"}} wrapperStyle = {{width: Dimensions.get('screen').width*.8,  borderStyle:"solid", borderWidth: 0, borderColor:"rgba(0,0,0,.75)",}}>
        <XGroup alignItems="center" justifyContent="left"> 
        <Card.Title style = {{ alignSelf:"flex-start", color:"black", fontSize: 15, fontWeight: 250}}>One-Two </Card.Title>
        <Card.Title style = {{top: 3,color:"black", fontWeight: "200", position:"absolute", right: 0}}><View><Badge badgeStyle = {{paddingVertical:0, paddingHorizontal:7, borderRadius: 100, borderWidth: 0}} containerStyle = {{borderRadius: 100, boxSizing:"content-box"}} value = "Intermediate" status = {"warning"}/></View></Card.Title>
        </XGroup>
        <Card.FeaturedTitle style = {{ paddingHorizontal: 0, paddingTop: 1, paddingBottom: 0, color:"rgba(0,0,0,.75)", fontWeight: 400, fontSize: 12, textAlign:"left"}}>The One-Two combination is built upon the fundamental punches Jab and Straight-Right, a lethal and speedy combo. </Card.FeaturedTitle>
    </Card>
    </TouchableOpacity>
    
    

      <TouchableOpacity>
             <Card containerStyle = {{ marginVertical: 15, borderRadius: 17, borderColor:"rgba(0, 0, 0, 0)"}} wrapperStyle = {{width: Dimensions.get('screen').width*.8,  borderStyle:"solid", borderWidth: 0, borderColor:"rgba(0,0,0,.75)",}}>
        <XGroup alignItems="center" justifyContent="left"> 
        <Card.Title style = {{ alignSelf:"flex-start", color:"black", fontSize: 15, fontWeight: 250}}> Pull-Back Counter</Card.Title>
        <Card.Title style = {{top: 3,color:"black", fontWeight: "200", position:"absolute", right: 0}}><View><Badge badgeStyle = {{paddingVertical:0, paddingHorizontal:7, borderRadius: 100, borderWidth: 0}} containerStyle = {{borderRadius: 100, boxSizing:"content-box"}} value = "Advamced" status = {"primary"}/></View></Card.Title>
        </XGroup>
        <Card.FeaturedTitle style = {{ paddingHorizontal: 0, paddingTop: 1, paddingBottom: 0, color:"rgba(0,0,0,.75)", fontWeight: 400, fontSize: 12, textAlign:"left"}}>The One-Two combination is built upon the fundamental punches Jab and Straight-Right, a lethal and speedy combo. </Card.FeaturedTitle>
    </Card>
    </TouchableOpacity>

         </XGroup>
</View>
      
 
       </ScrollView>


    </>    
)
}

/*
   <Sheet open >

        
     </Sheet>

     */


const styles = StyleSheet.create({
    cont:{
   
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
        color:"black",
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