import React, { useEffect, useState, useRef } from 'react';
import { ActivityIndicator, StyleSheet, Text, View, Dimensions, Platform, TouchableOpacity, Button, NativeEventEmitter, NativeModules,  } from 'react-native';
import SideNav from '../components/sideNav';
import { StatusBar } from 'expo-status-bar';
import { VisionCameraProxy, Camera, useCameraDevice, useCameraFormat, useCameraPermission, useFrameProcessor, runAsync, runAtTargetFps} from 'react-native-vision-camera';
import Animated, { createWorkletRuntime, runOnJS, useDerivedValue } from 'react-native-reanimated';
import { useSkiaFrameProcessor } from 'react-native-vision-camera';
import {Skia} from '@shopify/react-native-skia';
import storage from '../components/storage';
import { useSharedValue, useWorklet, worklet, Worklets } from 'react-native-worklets-core';
//import { useSharedValue } from 'react-native-worklets-core';
//import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
//import { RNMediapipe } from '@thinksys/react-native-mediapipe';
import { loadTensorflowModel, useTensorflowModel } from 'react-native-fast-tflite';
import * as tf from "react-native-fast-tflite"; 
import {Icon} from "react-native-elements"; 
import { ImageBackground } from 'expo-image';
import { ScrollView } from 'react-native-gesture-handler';
import TestImg from "../assets/workoutCat.jpg"; 
const detectPlugin = VisionCameraProxy.initFrameProcessorPlugin("detect",{}); 
 
/*angles utilized for custom GRU prediction: 

       rightElbow_angle,  --> 'right_forearm_joint' in VNHumanBodyPoseDetection
        rightShoulder_angle, --> 'right_shoulder_1_joint' in VNHumanBodyPoseDetection
        rightHip_angle, --> 'right_upLeg_joint' in VNHumanBodyPoseDetection
        rightKnee_angle, --> 'right_leg_joint' in VNHumanBodyPoseDetection

        leftElbow_angle, 
        leftShoulder_angle,
        leftHip_angle,
        leftKnee_angle
*/

  
export default function AICam({theme}){
//custom GRU2 model initialization 

//const detectPlugin = VisionCameraProxy.initFrameProcessorPlugin("detect", {}); 
 
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
const [camFlip, setCamFlip] = useState(true); 
const device = useCameraDevice(camFlip? "front" : "back", {}); 

const customFormat = useCameraFormat(device, [{
    fps: "max", 
    videoStabilizationMode:'off', 
    photoAspectRatio: 1/2,
    //videoAspectRatio: 1/2
}]) //fps set to max

 
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
//let predictionLaebl = useSharedValue("None"); 
const [textLabel, setTextLabel] = useState("None"); 
const updateUIText = Worklets.createRunOnJS((v) =>{
    //predictionLaebl.value = v; 
   setTextLabel(v);
})
const camRef = useRef(); 

const frameProcessor_executableBody = (frame) =>{
    'worklet';
        try{ 
        if(frame.pixelFormat == "rgb"){
        let buffer = frame.toArrayBuffer();
        let rgbObj = new Uint8Array(buffer); 
        //console.log("rgb: ", rgbObj.slice(0,1))

        
        
        let res = detectPlugin.call(frame);
        //res = JSON.parse(res); 
       //console.log(res[1][0]['right_shoulder_1_joint']);
       //console.log(res[0]);
      
      //console.log(rgbObj.slice(0,1))

      //console.log(res[2]); //console logs the 1 if frame count == 40 

      console.log(textLabel);
      
     updateUIText(res[3]); 
     

//      runOnJS(update_predictionLaebl)(res[3][0]); 


      //if(res[2] ==1){
        //if true, the last valu e)index 3) of res will be non null and will have custom GRU model prediction
        //testAngle of rightElbow willalso be available when res[2] == true 

       // console.log(res[3]); 
      //}

      return res; 
      
    /*
    
 LOG  {"head_joint": {"conf": 0.611328125, "name": "head_joint", "x": 0.2837872803211212, 
 "y": 0.13709235191345215}, "left_ear_joint": {"conf": 0.5009765625, "name": "left_ear_joint", 
 "x": 0.28298014402389526, "y": 0.1261497139930725}, "left_eye_joint": {"conf": 0.59765625, 
 "name": "left_eye_joint", "x": 0.27875617146492004, "y": 0.1259964108467102}, 
 "left_foot_joint": {"conf": 0.67041015625, "name": "left_foot_joint", "x": 0.4756293296813965, 
 "y": 0.11322402954101562}, "left_forearm_joint": {"conf": 0.615234375, "name": "left_forearm_joint", 
 "x": 0.3277706503868103, "y": 0.07323598861694336}, "left_hand_joint": {"conf": 0.70751953125, 
 "name": "left_hand_joint", "x": 0.3304170072078705, "y": 0.07168960571289062}, 
 "left_leg_joint": {"conf": 0.75146484375, "name": "left_leg_joint", "x": 0.4267195761203766, 
 "y": 0.11428534984588623}, "left_shoulder_1_joint": {"conf": 0.728515625, 
 "name": "left_shoulder_1_joint", "x": 0.3040411174297333, "y": 0.10185164213180542}, 
 "left_upLeg_joint": {"conf": 0.73974609375, "name": "left_upLeg_joint", "x": 0.36857840418815613, 
 "y": 0.11218005418777466}, "neck_1_joint": {"conf": 0.76953125, "name": "neck_1_joint", 
 "x": 0.3041687160730362, "y": 0.13006165623664856}, "right_ear_joint": {"conf": 0.336181640625, 
 "name": "right_ear_joint", "x": 0.2796621322631836, "y": 0.1414150595664978}, 
 "right_eye_joint": {"conf": 0.58056640625, "name": "right_eye_joint", 
 "x": 0.2786276936531067, "y": 0.13880223035812378}, 
 "right_foot_joint": {"conf": 0.68896484375, "name": 
 "right_foot_joint", "x": 0.4762856960296631, "y": 0.16938257217407227}, 
 "right_forearm_joint": {"conf": 0.297607421875, "name": "right_forearm_joint",
  "x": 0.3257850110530853, "y": 0.16522157192230225}, 
  "right_hand_joint": {"conf": 0.30859375, "name": "right_hand_joint", 
  "x": 0.32752344012260437, "y": 0.15538203716278076}, "right_leg_joint": {"conf": 0.771484375, 
  "name": "right_leg_joint", "x": 0.4224238991737366, "y": 0.15336650609970093}, 
  "right_shoulder_1_joint": {"conf": 0.810546875, "name": "right_shoulder_1_joint", 
  "x": 0.3042963147163391, "y": 0.1582716703414917}, "right_upLeg_joint": {"conf": 0.7568359375, 
  "name": "right_upLeg_joint", "x": 0.3664237856864929, "y": 0.14343637228012085}, 
  "root": {"conf": 0.748291015625, "name": "root", "x": 0.3675010949373245, "y": 0.12780821323394775}}
 */
 
    }else{
        //console.log("pixel form != rgb")
    }

    frame.render(); 
    }catch(e){
        console.log("Error inside 'customFrameProcessor' : ", e.message)
    }
}


const allJoints = ["right_upLeg_joint", "right_forearm_joint", "left_leg_joint", "left_hand_joint", "left_ear_joint", "left_forearm_joint", "right_leg_joint", "right_foot_joint", "right_shoulder_1_joint", "neck_1_joint", "left_upLeg_joint", "left_foot_joint", "root", "right_hand_joint", "left_eye_joint", "head_joint", "right_eye_joint", "right_ear_joint", "left_shoulder_1_joint"]

const customFrameProcessor = useSkiaFrameProcessor((frame) =>{
   'worklet';
    //runAtTargetFps(10000000000000000000, () =>{
     frame.render(); 
   // })
   

   let res = frameProcessor_executableBody(frame); 
   const centerX = frame.width*.1
  const centerY = frame.height/1.5;
  
  try{
    //if(res[0]['right_shoulder_1_joint']['x'] != null || res[0]['right_shoulder_1_joint']['y'] != null){

    // right_shoulder_1_joint:
  let paint = Skia.Paint()
  paint.setColor(Skia.Color('red'));
  let jointId;  
  let rect; 
  
   
  rect = Skia.XYWHRect( frame.width* res[1][0]['right_upLeg_joint']['x'], frame.height*res[1][0]['right_upLeg_joint']['y'] , 10, 10)
  frame.drawRect(rect, paint);

  rect = Skia.XYWHRect( frame.width* res[1][0]['right_forearm_joint']['x'], frame.height*res[1][0]['right_forearm_joint']['y'] , 10, 10)
  frame.drawRect(rect, paint);


   
  rect = Skia.XYWHRect( frame.width* res[1][0]['left_leg_joint']['x'], frame.height*res[1][0]['left_leg_joint']['y'] , 10, 10)
  frame.drawRect(rect, paint);


 
  rect = Skia.XYWHRect( frame.width* res[1][0]['left_hand_joint']['x'], frame.height*res[1][0]['left_hand_joint']['y'] , 10, 10)
  frame.drawRect(rect, paint);



 /*
  rect = Skia.XYWHRect( frame.width* res[1][0]['left_ear_joint']['x'], frame.height*res[1][0]['left_ear_joint']['y'] , 10, 10)
  frame.drawRect(rect, paint);
*/


 


   rect = Skia.XYWHRect( frame.width* res[1][0]['left_forearm_joint']['x'], frame.height*res[1][0]['left_forearm_joint']['y'] , 10, 10)
  frame.drawRect(rect, paint);

   
  rect = Skia.XYWHRect( frame.width* res[1][0]['right_leg_joint']['x'], frame.height*res[1][0]['right_leg_joint']['y'] , 10, 10)
  frame.drawRect(rect, paint);

    
  rect = Skia.XYWHRect( frame.width* res[1][0]['right_foot_joint']['x'], frame.height*res[1][0]['right_foot_joint']['y'] , 10, 10)
  frame.drawRect(rect, paint);

    
  rect = Skia.XYWHRect( frame.width* res[1][0]['right_shoulder_1_joint']['x'], frame.height*res[1][0]['right_shoulder_1_joint']['y'] , 10, 10)
  frame.drawRect(rect, paint); jointId = 0; 

  rect = Skia.XYWHRect( frame.width* res[1][0]['left_upLeg_joint']['x'], frame.height*res[1][0]['left_upLeg_joint']['y'] , 10, 10)
  frame.drawRect(rect, paint);

   
  rect = Skia.XYWHRect( frame.width* res[1][0]['left_foot_joint']['x'], frame.height*res[1][0]['left_foot_joint']['y'] , 10, 10)
  frame.drawRect(rect, paint);

   /*
  rect = Skia.XYWHRect( frame.width* res[1][0]['root']['x'], frame.height*res[1][0]['root']['y'] , 10, 10)
  frame.drawRect(rect, paint);
*/

   
  rect = Skia.XYWHRect( frame.width* res[1][0]['right_hand_joint']['x'], frame.height*res[1][0]['right_hand_joint']['y'] , 10, 10)
  frame.drawRect(rect, paint);

  /* 
  rect = Skia.XYWHRect( frame.width* res[1][0]['left_eye_joint']['x'], frame.height*res[1][0]['left_eye_joint']['y'] , 10, 10)
  frame.drawRect(rect, paint);
       */

 
  rect = Skia.XYWHRect( frame.width* res[1][0]['head_joint']['x'], frame.height*res[1][0]['head_joint']['y'] , 10, 10)
  frame.drawRect(rect, paint);

   /*
  rect = Skia.XYWHRect( frame.width* res[1][0]['right_eye_joint']['x'], frame.height*res[1][0]['right_eye_joint']['y'] , 10, 10)
  frame.drawRect(rect, paint);

  rect = Skia.XYWHRect( frame.width* res[1][0]['right_ear_joint']['x'], frame.height*res[1][0]['right_ear_joint']['y'] , 10, 10)
  frame.drawRect(rect, paint);
*/

   jointId = 16; 
  rect = Skia.XYWHRect( frame.width* res[1][0]['left_shoulder_1_joint']['x'], frame.height*res[1][0]['left_shoulder_1_joint']['y'] , 10, 10)
  frame.drawRect(rect, paint);

   
  /**/

   // }
  }catch{


  }


  
}, [textLabel, detectPlugin]);

const flipIcon = (           
    <TouchableOpacity style = {{position:"absolute", top: 125, left: 22}} onPress={() => setCamFlip(!camFlip)}>
<Icon size={27} name="cameraswitch" backgroundColor={"transparent"} color={"white"} style={{}}/>
    </TouchableOpacity>     
);

    return(
           <View style = {{
            flex: 1,
            backgroundColor: "white",
           }}>
            <StatusBar barStyle="light-content" backgroundColor="#000" />

         <>
    <Camera
           
           shouldRasterizeIOS = {false}
            enableBufferCompression = {true}
         enableFpsGraph = {false}
         fps={customFormat.maxFps}
         isActive = {true}
         device={device}
         format={customFormat}
         pixelFormat={"rgb"}
         frameProcessor={customFrameProcessor}
        videoBitRate={"extra-low"}
         style = {{
            height: Dimensions.get("screen").height,
            width:Dimensions.get("screen").width,
            position:"absolute"
         }}
         />
        {flipIcon}

         <View style = {{ alignSelf:"center", bottom: 0, backgroundColor:"white", 
                height: Dimensions.get("screen").height*.25,
                width:Dimensions.get("screen").width,
                position:"absolute",
                borderTopEndRadius: 25,
                borderTopLeftRadius: 25,
                alignItems:"center",
                justifyContent:"center",
           
            }}>
            <Animated.Text style = {{color: "black", fontSize: 20}} >""</Animated.Text>
            <Animated.Text style = {{color: "black", fontSize: 20}} >{textLabel}</Animated.Text>
            </View>
            <SideNav buttonColor={theme? "black": "white"} style = {{top: 70, left: -173, marginBottom: 50, position:"relative"}}/>
            </>
          </View>
    )
         
}


export const styles = StyleSheet.create({
    column:{
         flexDirection: "column",
         display:"flex", 
    },
     row:{
         flexDirection: "row",
         display:"flex", 
    }
})