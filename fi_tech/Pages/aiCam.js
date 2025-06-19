import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, Text, View, Dimensions, Platform, TouchableOpacity, Button, NativeEventEmitter, NativeModules,  } from 'react-native';
import SideNav from '../components/sideNav';
import { StatusBar } from 'expo-status-bar';
import { Camera, useCameraDevice, useCameraFormat, useCameraPermission } from 'react-native-vision-camera';
//import { useSharedValue } from 'react-native-worklets-core';
//import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';

export default function AICam({theme}){
    //nativeModules: 

/*
    
    //handling frames:
    const frameProcessor = useFrameProcessor((frame) =>{
        'worklet';
        //converting frame to array based frame
        if(frame.pixelFormat == "rgb"){
            //console.log('pixel format IS rgb')

            const array_based_frame = frame.toArrayBuffer();
            let f =  new Uint8Array(array_based_frame); 
            
            //console.log(f.toString());
        }else{
            console.log("Frame not in rgb pixel format")
        }

    },[]);


    const device = useCameraDevice("front");
    const {hasPermission} = useCameraPermission();
    const customFormat = useCameraFormat(device, [{fps:"max"}]) //fps set to max
const handleTest = () =>{
    alert("Hello Universe"); 
}
//<View style ={{justifyContent:"center", alignItems:"center"}}>
    return(
    <>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
         <Camera
        style = {{
            height:Dimensions.get("screen").height,
            width: Dimensions.get("screen").width,
            backgroundColor:"red",
            position:"absolute"
        }}
        device={device}
      isActive={true}
      zoom={device.minZoom}
      enableZoomGesture
      format={customFormat}
      frameProcessor={frameProcessor}
      pixelFormat={"rgb"}
      />
        <SideNav buttonColor={theme? "black": "white"} style = {{top: 70, left: -173, marginBottom: 50, position:"relative"}}/>
       
    

           <Text style = {{color: theme?"black":"white", alignSelf:"center", bottom: -350}}>Hello universe</Text>
    </>
    )
*/
    
 
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
    return(
           <>
         <Camera
         isActive = {true}
         device={device}
         style = {{
            height: Dimensions.get("screen").height,
            width:Dimensions.get("screen").width,
            position:"absolute"
         }}
         />
            <StatusBar barStyle="light-content" backgroundColor="#000" />
            <SideNav buttonColor={theme? "black": "white"} style = {{top: 70, left: -173, marginBottom: 50, position:"relative"}}/>
            <Text style = {{color: theme?"black":"white", alignSelf:"center", bottom: -350}}>Hello Universe</Text>
         </>
    )
         
}