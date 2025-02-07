import {View, StyleSheet, Text, ImageBackground, Image, BackHandler, Button, TouchableOpacity, FlatList, ScrollView, Dimensions, Modal, Pressable} from "react-native";
import {useState} from "react";
import coachSlideBackImage from "../assets/images/coachSlideImg.jpg"; 
import AnimatedDotsCarousel  from "react-native-animated-dots-carousel"; 
import ChatBotImg from "../assets/images/bot.png"; 

import WorkoutCat from "../assets/images/workoutCat.jpg"; 
export default function Home({navigation}){
    let screenHeight = Dimensions.get("screen").height,
        screenWidth = Dimensions.get("screen").width; 
        const fontS = 20; 
    const DropShadow = ({style}) =>{
        return(
            <View style = {[style, {backgroundColor: "rgba(0,0,0, .5)", position:"absolute"}]}></View>
        )
    }
    const coachSlide = (
        <ImageBackground key = {0} source = {coachSlideBackImage} style = {{
            height: screenHeight,
            width: screenWidth,
            backgroundColor: "transparent",
            textAlign:"center",
            justifyContent:"center", 
            alignItems:"center"
        }}>
              <DropShadow key = {1} style = {{height: screenHeight, width: screenWidth}}/>
            <Text style = {{
                color:"white",
                width: 250,
                textAlign:"left",
                fontSize: fontS


             }}>Learn fundamentals on the go with quality evaluation and feedback by using the power of AI to kickstart your progress!</Text>
            <TouchableOpacity key = {2} style = {{
                backgroundColor: "white", 
              position: "absolute",
                textAlign:"center",
                alignItems:"center",
                justifyContent:"center",
                borderRadius: 100,
                paddingVertical: 10,
                paddingHorizontal: 25,
                bottom: 100

            }} onPress = {() => navigation.replace("aiCam")}><Text style = {{
                color: "black",
                fontSize: 20

            }}>START!</Text></TouchableOpacity>
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
            <TouchableOpacity style = {{
                backgroundColor: "white", 
             position: 'absolute',
                textAlign:"center",
                alignItems:"center",
                justifyContent:"center",
                borderRadius: 100,
                paddingVertical: 10,
                paddingHorizontal: 25,
                bottom: 100

            }}><Text style = {{
                color: "black",
                fontSize: 20

            }}>CHAT</Text></TouchableOpacity>
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
            marginTop: 25,
            fontSize: fontS

         }}>Search through the workout catalogue and find what best fits you! {"\n\n"}
          If you need a hand, ask your personal assitant to the left!</Text>
        <TouchableOpacity style = {{
            backgroundColor: "white", 
         position: 'absolute',
            textAlign:"center",
            alignItems:"center",
            justifyContent:"center",
            borderRadius: 100,
            paddingVertical: 10,
            paddingHorizontal: 25,
            bottom: 100

        }}><Text style = {{
            color: "black",
            fontSize: 20

        }}>SEARCH</Text></TouchableOpacity>
    </ImageBackground>
);


    const slides = [{key: 0, comp: coachSlide}, {key: 1, comp: chat}, {key: 2, comp: WorkoutsCatalogue} ];
    const Indecies = ({index}) => {
        return (
            <View style = {{flexDirection: "row", display:"flex", columnGap: 50, backgroundColor: "transparent", position: "absolute", bottom: screenHeight/17, left: screenWidth/3.5, width: screenWidth}}>
        <View key = {1}  style = {{backgroundColor: "white", opacity: index == 0? 1 : .5, height: 15, width: 25, borderRadius: 100}}></View>
        <View key = {2}  style = {{backgroundColor: "white", opacity: index == 1? 1 : .5, height: 15, width: 25, borderRadius: 100}}></View>
        <View key = {3}  style = {{backgroundColor: "white", opacity: index == 2? 1 : .5, height: 15, width: 25, borderRadius: 100}}></View>
        </View>
        ); 
    }
    const indecies = []
    const [scrollIndex, setScrollIndex] = useState(0);
    const [modalView, setModalView] = useState(false); 
    return(
        <View style = {{backgroundColor: "black"}}>

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
            <TouchableOpacity
            onPress = {() => setModalView(true)}
            style = {{position:"absolute", top: 50, left: 25}}>
                <Text style = {{color: "white", fontSize: 30}}>
                    =
                </Text>
            </TouchableOpacity>

            <Modal animationType  = "fade" visible = {modalView} transparent={true}>
                <Pressable onPress = {() => setModalView(false)} style = {{height: screenHeight, width: screenWidth, backgroundColor: "rgba(0,0,0,0)"}}>

                </Pressable>
                <View style = {{backgroundColor: "white", width:screenWidth/2, height: screenHeight, position:'absolute', left: 0, padding: 25, flexDirection: "column", rowGap: 25, paddingTop: 150, paddingLeft: 50}}>

                    <TouchableOpacity><Text>Shop</Text></TouchableOpacity>
                    <TouchableOpacity><Text>Account</Text></TouchableOpacity>
                    <TouchableOpacity><Text>Settings</Text></TouchableOpacity>
                    <TouchableOpacity onPress = {() => setModalView(false)} style = {{position: "absolute", left: 170, top: 40}}><Text style = {{fontSize: 20}}>X</Text></TouchableOpacity>

                    </View>
            </Modal>
        </View>
    )
}