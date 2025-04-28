import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, Text, View, Dimensions, Platform, TouchableOpacity, Alert, Button, Touchable} from 'react-native';

import { Camera, useCameraPermissions, CameraView} from 'expo-camera';

//import * as tf from '@tensorflow/tfjs';
//import * as posedetection from '@tensorflow-models/pose-detection';
//import * as ScreenOrientation from 'expo-screen-orientation';
/*import {
  bundleResourceIO,
  cameraWithTensors,
} from '@tensorflow/tfjs-react-native';
 */

import Svg, { Circle } from 'react-native-svg';
import { SafeAreaView } from 'react-native-safe-area-context';
//import { ExpoWebGLRenderingContext } from 'expo-gl';
//import { CameraType } from 'expo-camera/build/Camera.types';
 
export default function AICam(){
    const [perm, requestPerm] = useCameraPermissions(); 
    const [cam_orientation, setCam_orientation] = useState(0); 
    //0 -> front 
    //1 -> back
 

    function handleOpenCam(){
        if(!perm.granted){
            Alert.alert("Camera Permissions", "", [
                {
                    text: "Allow",
                    onPress: () => requestPerm()
                },
                {
                    text:"Deny" 
                }
            ]); 
        }else{
    
        }
    };


  
    return(

      
        <View>
              <CameraView 
              active = {() => perm? perm.granted? true : false : false} 
              facing={cam_orientation? "back" : "front"} 
              style = {{justifyContent:"center", alignItems:"center", height: Dimensions.get("window").height, width: Dimensions.get("window").width}}>

                <TouchableOpacity style = {{bottom: -300, backgroundColor:"black", borderRadius: 100, paddingHorizontal: 10, paddingVertical: 5, width: 250, }}> 
                <Button title = "switch" color={"white"} onPress={() => setCam_orientation(!cam_orientation)} />
                </TouchableOpacity>
                </CameraView>
        </View>
        
    )
}