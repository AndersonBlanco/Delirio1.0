import {View, StyleSheet, Text, ImageBackground, Image, BackHandler, Button, TouchableOpacity, FlatList, ScrollView, Dimensions, Modal, Pressable} from "react-native";
import {useState} from "react";
import coachSlideBackImage from "../assets/coachSlideImg.jpg"; 
import AnimatedDotsCarousel  from "react-native-animated-dots-carousel"; 
import ChatBotImg from "../assets/bot.png"; 
import { nav } from "../redux/navigationSlice";
import { useDispatch, useSelector} from "react-redux";

import WorkoutCat from "../assets/workoutCat.jpg"; 
import SideNav from "../components/sideNav";
export default function Services({navigation}){

    const dispatch = useDispatch(); 

    let screenHeight = Dimensions.get("screen").height,
        screenWidth = Dimensions.get("screen").width; 
        const fontS = 20; 
    const DropShadow = ({style}) =>{
        return(
            <View style = {[style, {backgroundColor: "rgba(0,0,0, .5)", position:"absolute"}]}></View>
        )
    }

    const ActionButton = ({text}) =>{
        return(
            <TouchableOpacity 
            onPress={() => dispatch(nav("Auth"))}
            style = {{
                backgroundColor: "white", 
             position: 'absolute',
                textAlign:"center",
                alignItems:"center",
                justifyContent:"center",
                borderRadius: 100,
                paddingVertical: 10,
                paddingHorizontal: 25,
                bottom: 180,
                right: Dimensions.get("screen").width / 5,
                position: "absolute"
    
            }}><Text style = {{
                color: "black",
                fontSize: 20
    
            }}>{text}</Text></TouchableOpacity>
        )
    }
    const coachSlide = (
        <ImageBackground key = {0} source = {coachSlideBackImage} style = {{
            height: screenHeight,
            width: screenWidth,
            backgroundColor: "transparent",
            textAlign:"center",
            justifyContent:"center", 
            alignItems:"center",
        }}>
              <DropShadow key = {1} style = {{height: screenHeight, width: screenWidth}}/>
            <Text style = {{
                color:"white",
                width: 250,
                textAlign:"left",
                fontSize: fontS,
                top: -10


             }}>Learn fundamentals on the go with quality evaluation and feedback by using the power of AI to kickstart your progress!</Text>
        
        </ImageBackground>
    );

    const chat = (
        <View style = {{
            height: screenHeight,
            width: screenWidth,
            backgroundColor: "black",
            textAlign:"center",
            justifyContent:"center", 
            alignItems:"center"
        }}>
              <DropShadow style = {{height: screenHeight, width: screenWidth}}/>

              <Image source = {ChatBotImg} height = {100} width = {100} />
            <Text style = {{
                color:"white",
                width: 250,
                textAlign:"center",
                marginTop: 25,
                fontSize: fontS

             }}>Address your inquiries with your personal assitant powered by AI!</Text>
   
        </View>
    );

    const WorkoutsCatalogue = (
        <ImageBackground source = {WorkoutCat} style = {{
            height: screenHeight,
            width: screenWidth,
            backgroundColor: "green",
            textAlign:"center",
            justifyContent:"center", 
            alignItems:"center"
        }}>
              <DropShadow style = {{height: screenHeight, width: screenWidth}}/>
                <Text style = {{
            color:"white",
            width: 250,
            textAlign:"left",
            marginTop: 0,
            fontSize: fontS,
            right: -10, 
            top: -10

         }}>Search through the workout catalogue and find what best fits you! {"\n\n"}
          If you need a hand, ask your personal assitant to the left!</Text>
    </ImageBackground>
);


    const slides = [{key: 0, comp: coachSlide}, {key: 1, comp: chat}, {key: 2, comp: WorkoutsCatalogue} ];
    const Indecies = ({index}) => {
        return (
            <View style = {{flexDirection: "row", display:"flex", columnGap: 75, backgroundColor: "transparent", position: "absolute", bottom: screenHeight*.9, left: screenWidth/5, width: screenWidth}}>
        <View key = {1}  style = {{backgroundColor: "white", opacity: index == 0? 1 : .5, height: 5, width: 34, borderRadius: 100}}></View>
        <View key = {2}  style = {{backgroundColor: "white", opacity: index == 1? 1 : .5, height: 5, width: 34, borderRadius: 100}}></View>
        <View key = {3}  style = {{backgroundColor: "white", opacity: index == 2? 1 : .5, height: 5, width: 34, borderRadius: 100}}></View>
        </View>
        ); 
    }
    const indecies = []
    const [scrollIndex, setScrollIndex] = useState(0);
    const [modalView, setModalView] = useState(false); 
    return(
        <View style = {{backgroundColor: "black", height: Dimensions.get("screen").height}}>
            
            <ScrollView
            pagingEnabled
            horizontal
            onScroll = {(e) =>{ setScrollIndex(e.nativeEvent.contentOffset.x)}}
            style = {{
                height: screenHeight,
                width: screenWidth,
    
            
            }}>
                
                {
                    slides.map(a => <View key = {a.key}>{a.comp}</View>)
                }
            </ScrollView>
            <Indecies index = {scrollIndex < 300? 0 : scrollIndex < 800? 1 : 2}/>
            <ActionButton text="GET STARTED →"/>
        </View>
    )
}