import {
    View,
    Text,
    Button,
    TouchableOpacity,
    Animated,
    useAnimatedValue,
    Easing
} from 'react-native';
import ActionSheet, { SheetManager } from 'react-native-actions-sheet';
import {XGroup, YGroup, XStack, YStack, Avatar, Separator} from 'tamagui'; 
import { Badge, Icon, Image } from 'react-native-elements';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Line } from 'react-native-svg';
import SideNav from '../components/sideNav';
import Belt1 from "../assets/belt.png";
import Belt2 from "../assets/belt1.png";
import { ScreenWidth } from 'react-native-elements/dist/helpers';
//import Animated from 'react-native-reanimated';
import { useEffect, useRef } from 'react';
import { useNavigation } from '@react-navigation/native';
export default function LessonSummarry(){
    const nav = useNavigation(); 
    /*
    Lesson Difficulties
    0 -> Fundamentals
    1 -> Inytermediate
    2 -> Advanced
    */
const stats_data_point = { 
     lesson_title:"FreeStyle",
     free_style:true,
     difficulty_signs: 0,
     stats:{
     duration: {
        minutes: 1, 
        seconds: 9
     },
     speed:2, //punches / sec
     punch_count: 10,
    }

}


let stats_titles = {
    duration: "Duration",
    speed: "Speed",
    punch_count:"Punch Count"
};
const fade_in_animation = useAnimatedValue(0); 
const zoom_out = useAnimatedValue(7); 
useEffect(() =>{
    Animated.timing(fade_in_animation, {
        toValue: 1, 
        from:0,
        useNativeDriver: true,
        easing: Easing.in(),
        duration: 1500,
     }).start(); 

     Animated.timing(zoom_out, {
        toValue: 1.25,
        useNativeDriver: true,
        easing: Easing.bounce,
        duration: 1500,
     }).start(); 
}, [fade_in_animation, zoom_out]);

const BeltAward = (
       <View style={{alignSelf:"center", top:120}}>
            <Animated.Image source={Belt1} style = {{height:150, transform: [{scale: zoom_out}], width: 150, opacity:fade_in_animation}}/>
        </View>
 
);


const RecomendedLessons = (
    <>
    <YGroup>
        
    </YGroup>
    </>
)
return(
    <SafeAreaView style = {{
 
        paddingVertical:100,

    }}>
    <SideNav buttonColor={'black'} style = {{zIndex: 1, top: 75, left: 25, position:"absolute"}}/>
        
  

        <YGroup rowGap={25}>
            <Text
            style = {{
        
                fontSize: 25,
                paddingLeft: 28

            }}
            >{stats_data_point.lesson_title}</Text>
            <XGroup marginTop = {11} _tag = "badges" columnGap={10} alignItems='center'  justifyContent='center'>
                {
                    stats_data_point.free_style?
                            <>
                             <XGroup alignItems='center' justifyContent='center' columnGap={5}>
                                <View><Badge badgeStyle = {{height: 12, width:12, borderRadius: 100}} containerStyle = {{borderRadius: 100, boxSizing:"content-box"}} value = "" status = {"success"}/></View>
                             <Text>Fundamental</Text>
                             </XGroup>
                          
                             <XGroup alignItems='center' justifyContent='center' columnGap={5}>
                                <View><Badge badgeStyle = {{height: 12, width:12, borderRadius: 100}} containerStyle = {{borderRadius: 100, boxSizing:"content-box"}} value = "" status = {"warning"}/></View>                              
                                  <Text>Intermediate</Text>
                                </XGroup>

                            <XGroup alignItems='center' justifyContent='center' columnGap={5}>
                                <View><Badge badgeStyle = {{height: 12, width:12, borderRadius: 100}} containerStyle = {{borderRadius: 100, boxSizing:"content-box"}} value = "" status = {"primary"}/></View>
                                 <Text>Advanced</Text>
                                </XGroup>  
                            </>
                                       : 
                                       null
                }
            </XGroup>

            <YGroup rowGap={40} verticalAlign='center' backgroundColor = "transparent" top = {50}>
                {
                    Object.keys(stats_data_point.stats).map(key=>{
                      
                            
                            return(
                            <XGroup columnGap={10} key = {key} paddingHorizontal={50} justifyContent='space-between' alignItems='center' >
                                <Text style = {{fontSize: 20, fontWeight: 300, color:"rgba(0,0,0,.65)"}}>{stats_titles[key]}</Text>
                               <Separator borderColor = "rgba(0, 0, 0, .15)" borderWidth={1} top = {3.7} borderSty borderRadius={100}/>
                                {
                                    key == "duration"?
                                        <XGroup>
                                        <Text style = {{fontSize: 20, fontWeight: 300,  color:"rgba(0,0,0,.7)"}}>{stats_data_point.stats[key].minutes}m</Text>
                                        <Text style = {{fontSize: 20, fontWeight: 300,  color:"rgba(0,0,0,.7)"}}>,</Text>
                                        <Text style = {{fontSize: 20, fontWeight: 300,  color:"rgba(0,0,0,.7)"}}>{stats_data_point.stats[key].minutes<10? `0${stats_data_point.stats[key].minutes}` : stats_data_point.stats[key].minutes}s</Text>
                                        </XGroup>

                                    :
                                        <Text style = {{fontSize: 20, fontWeight: 300,  color:"rgba(0,0,0,.7)"}}>{stats_data_point.stats[key]}</Text>
                                    
                                }
                            </XGroup>
                            )
                        
                    })
                }
            </YGroup>
        </YGroup>

      <TouchableOpacity style ={{position:"absolute", right: 34, top: 155}} onPress={() =>alert('Test')}>
        <Icon name = 'share' iconStyle = {{ color:"rgba(0,0,0,.35)"}} size = {27} reverseColor='blue'/>
        </TouchableOpacity>

     {RecomendedLessons}
       
       <TouchableOpacity onPress={() => nav.replace("AI_Cam")} style={{ alignSelf:"center", bottom: -175, paddingVertical: 10, backgroundColor:"black", borderRadius: 100, width: ScreenWidth/2, justifyContent:'center', alignItems:'center'}}>
        <Text style = {{color:"white"}}>Again?</Text>
       </TouchableOpacity>
       
    </SafeAreaView>
)
}