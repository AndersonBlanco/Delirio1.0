import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, Text, View, Dimensions, Platform, TouchableOpacity, Button, NativeEventEmitter, NativeModules,  } from 'react-native';
import SideNav from '../components/sideNav';
import { StatusBar } from 'expo-status-bar';
import { Camera, useCameraDevice, useCameraFormat, useCameraPermission, useFrameProcessor} from 'react-native-vision-camera';
//import { useSharedValue } from 'react-native-worklets-core';
//import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { RNMediapipe } from '@thinksys/react-native-mediapipe';

export default function AICam({theme}){
   
    /*
    //expo-camera
     const [permission, requestPermission] = useCameraPermissions();
   const [facing, setFacing] = useState("front")

    if(!permission){
        return(
            <>
                <StatusBar barStyle="light-content" backgroundColor="#000" />
                <Text style = {{color: theme?"black":"white", alignSelf:"center", bottom: -350}}>Camera permission loading.....</Text>
            </>
        )
    }

    if(!permission.granted){
        requestPermission();
        return(
            <>
                <StatusBar barStyle="light-content" backgroundColor="#000" />
                <Text style = {{color: theme?"black":"white", alignSelf:"center", bottom: -350}}>Camera permission denied. Requesting.....</Text>
            </>
        )
    }

    /*
      <CameraView
                facing={facing}
                active={true}
                style = {{
                    height: Dimensions.get("screen").height,
                    width:Dimensions.get("screen").width,
                    position:"absolute"

                }}

                />
    */
        /**/
const {hasPermission, requestPermission} = useCameraPermission();
const device = useCameraDevice("front"); 
const customFormat = useCameraFormat(device, [{fps:"max"}]) //fps set to max


useEffect(() =>{
    if(!hasPermission){
        requestPermission();
    }
}, [hasPermission]);

if(!hasPermission){
    return(
        <>
            <StatusBar barStyle="light-content" backgroundColor="#000" />
            <SideNav buttonColor={theme? "black": "white"} style = {{top: 70, left: -173, marginBottom: 50, position:"relative"}}/>
            <Text style = {{color: theme?"black":"white", alignSelf:"center", bottom: -350}}>Go to settings and allow permission for this appplication</Text>
         </>
    )
}

if(!device){
    return(
        <>
            <Text style = {{color: theme?"black":"white", alignSelf:"center", bottom: -350}}>Camera Device not identitified</Text>
        </>
    )
}

const customFrameProcessor = useFrameProcessor((frame) =>{
    'worklet';
    try{
        if(frame.pixelFormat == "rgb"){
        let buffer = frame.toArrayBuffer();
        let rgbObj = new Uint8Array(buffer); 
        //console.log("rgb: ", rgbObj.slice(0,1))
    }else{
        //console.log("pixel form != rgb")
    }
    }catch(e){
        console.log("Error inside 'customFrameProcessor' : ", e)
    }
})

const CamExpo = () =>{
    return(
         <Camera
         isActive = {true}
         device={device}
         format={customFormat}
         pixelFormat={"rgb"}
         frameProcessor={customFrameProcessor}
         style = {{
            height: Dimensions.get("screen").height,
            width:Dimensions.get("screen").width,
            position:"absolute"
         }}
         />
    )
}
    return(
           <>

             <RNMediapipe 
        
        style={{
            position:"absolute"
        }}
        width={Dimensions.get("screen").width}
        height={Dimensions.get("screen").height}
        onLandmark={(data) => {
            console.log(data); 
        }}
      />
         
            <StatusBar barStyle="light-content" backgroundColor="#000" />
            <SideNav buttonColor={theme? "black": "white"} style = {{top: 70, left: -173, marginBottom: 50, position:"relative"}}/>
            <Text style = {{color: theme?"black":"white", alignSelf:"center", bottom: -350}}>Hello Universe</Text>
         </>
    )
         
}