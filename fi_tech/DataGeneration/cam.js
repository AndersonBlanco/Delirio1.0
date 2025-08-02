import React, { useEffect, useState, useRef, useCallback } from 'react';
import {Animated, View, ActivityIndicator, StyleSheet, Dimensions, Platform, TouchableOpacity, Button, NativeEventEmitter, NativeModules, Easing,  } from 'react-native';
import {Text, VStack} from "swiftui-react-native"; 
import SideNav from '../components/sideNav';
import { StatusBar } from 'expo-status-bar';
import { VisionCameraProxy, Camera, useCameraDevice, useCameraFormat, useCameraPermission, useFrameProcessor, runAsync, runAtTargetFps} from 'react-native-vision-camera';
import { createWorkletRuntime, runOnJS, useAnimatedReaction, useDerivedValue } from 'react-native-reanimated';
import { useSkiaFrameProcessor } from 'react-native-vision-camera';
import {Skia, Path, rect} from '@shopify/react-native-skia';
import storage from '../components/storage';
import { useSharedValue, useWorklet, worklet, Worklets, start } from 'react-native-worklets-core';
//import { useSharedValue } from 'react-native-worklets-core';
//import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
//import { RNMediapipe } from '@thinksys/react-native-mediapipe';
import { loadTensorflowModel, useTensorflowModel,} from 'react-native-fast-tflite';
import * as tf from "react-native-fast-tflite"; 
import {Icon} from "react-native-elements"; 
import TestImg from "../assets/workoutCat.jpg"; 
import * as Speech from "expo-speech"; 

import { GLView } from 'expo-gl';
import { Renderer } from 'expo-three';
import * as Permissions from "expo-permissions"; 
import { Audio } from 'expo-av';

//import user data zustand state handlers from zustand store: 
import {useUserState} from "../components/zustandStore"; 
import { ScreenHeight, ScreenWidth } from 'react-native-elements/dist/helpers';
import { Pressable } from 'react-native-gesture-handler';

import {File, Paths, Directory } from "expo-file-system/next"; 
import { documentDirectory } from 'expo-file-system';
import * as RNFS from "react-native-fs"; 
 
const detectPlugin = VisionCameraProxy.initFrameProcessorPlugin("detect",{}); 
 
export default function GenCam({theme}){
 //test writeFile

 
const {hasPermission, requestPermission} = useCameraPermission();
const [camFlip, setCamFlip] = useState(true); 
const device = useCameraDevice(camFlip? "front" : "back", {}); 
const [poses, setPoses] = useState([]); 
const [textLabel, setTextLabel] = useState("None"); 
const textLabelSharedValm=useSharedValue('None');
const moveWindowIsOpen = useSharedValue(true);
const [moveWindowIsOpen_state,set_moveWindowIsOpen] = useState(true);
//
const [lessonPaused, setLessonPaused] = useState(false); 
//
const frameRecordedCount = useRef(0); 
const recording = useSharedValue(false); 

const latestPoseRef = useRef(null);


const customFormat = useCameraFormat(device, [{
    fps: 30, 
    videoStabilizationMode:'off', 
        //photoAspectRatio: 1/2,
        //videoAspectRatio: 1/2,
        videoResolution: {height: ScreenHeight, width:ScreenWidth},
        videoAspectRatio:ScreenWidth/ScreenHeight

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

const updatePoses = Worklets.createRunOnJS((p) =>{
    if(p.length > 0 && moveWindowIsOpen.value){
        //let p_restrucrured = RestructureData(p); 
        console.log(p);
    } 
    setPoses(p); 
});

useAnimatedReaction(() => recording.value, (curr, prev) =>{
    if(curr != prev){
        if(curr == false){
            console.log("Recording stopped....."); 
        }else{
            console.log("Recording began....."); 
        }
    }; 

})
const default_useFramePorcessor = useFrameProcessor((frame) =>{
    'worklet'; 
    let res = detectPlugin.call(frame, {userGotStrikedOut: false});  
    //print set_100: 
    try{
      console.log("Length ", res[7].length, res[7]);
    }catch{
      
    }
    /*
    updatePoses(res[1]); 
   // console.log(res[1])
   let frameCount = res[0]; 
   moveWindowIsOpen.value = res[5]; 
   if(res[4] && res[5]){
    recording.value = true; 
   }else{
    recording.value = false; 
   }

   */


   


});

//const glRef = useRef(); 


const allJoints = ["right_upLeg_joint", "right_forearm_joint", "left_leg_joint", "left_hand_joint", "left_forearm_joint", "right_leg_joint", "right_foot_joint", "right_shoulder_1_joint", "left_upLeg_joint", "left_foot_joint", "right_hand_joint", "head_joint", "left_shoulder_1_joint"];
const SKELETON_CONNECTIONS = [
  ["root", "left_upLeg_joint"],
  ["root", "right_upLeg_joint"],
  ["left_upLeg_joint", "left_leg_joint"],
  ["left_leg_joint", "left_foot_joint"],
  ["right_upLeg_joint", "right_leg_joint"],
  ["right_leg_joint", "right_foot_joint"],
  ["root", "neck_1_joint"],
  ["neck_1_joint", "head_joint"],
  ["neck_1_joint", "left_shoulder_1_joint"],
  ["left_shoulder_1_joint", "left_forearm_joint"],
  ["left_forearm_joint", "left_hand_joint"],
  ["neck_1_joint", "right_shoulder_1_joint"],
  ["right_shoulder_1_joint", "right_forearm_joint"],
  ["right_forearm_joint", "right_hand_joint"],
  ["head_joint", "left_eye_joint"],
  ["head_joint", "right_eye_joint"],
  ["left_eye_joint", "left_ear_joint"],
  ["right_eye_joint", "right_ear_joint"]
];
const normalizeGLCoords = (x, y) => [
      1 - y * 2.005  ,
  1-x * 2    // Convert to [-1, 1] range
     // Flip vertically (WebGL Y-down to screen Y-up)
];
function createShaderProgram(gl, vertexSrc, fragmentSrc) {
  const vs = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vs, vertexSrc);
  gl.compileShader(vs);

  const fs = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fs, fragmentSrc);
  gl.compileShader(fs);

  const program = gl.createProgram();
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  gl.useProgram(program);

  return program;
}
const vertexShaderSource = `
        attribute vec2 position;
        void main() {
          gl_Position = vec4(position, 0.0, 1.0);
          gl_PointSize = 20.0;
        }
        `;
const fragmentShaderSource = `
        precision mediump float;
        void main() {
          gl_FragColor = vec4(0.0, 1.0, 0.0, 1.0); // green points
        }`;
const drawSkeleton = useCallback((gl, joints, shaderProgram) => {//drawSkeleton : START
  SKELETON_CONNECTIONS.forEach(([start, end]) => {
    const j1 = joints[start];
    const j2 = joints[end];

    if (!j1 || !j2 || j1.conf < 0.2 || j2.conf < 0.2) return;

    const [x1, y1] = normalizeGLCoords(j1.x, j1.y);
    const [x2, y2] = normalizeGLCoords(j2.x, j2.y);
        gl.lineWidth(10);
        gl.LINE_LOOP; 
/*
    let _x1 = !camFlip? -x1 : x1; 
    let _x2 = !camFlip? -x2 : x2; 
    
    let _y1 = !camFlip? -y1 : y1;
    let _y2 = !camFlip? -y2 : y2; 
    */
   
    const vertices = new Float32Array([x1, y1, x2, y2]);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const posLoc = gl.getAttribLocation(shaderProgram, "position");
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    gl.drawArrays(gl.LINES, 0, 2);

    gl.deleteBuffer(buffer);
 
  });
} 
)//drawSkeleton : END

//console.log("Jab frames lngth:", jabFrames.length)
const shaderProgramRef = useRef(null);

const onContextCreate2 = async (gl) => {
  // gl?.cancelFeedbackLoop?.();
   
if (!shaderProgramRef.current) {
    shaderProgramRef.current = createShaderProgram(gl, vertexShaderSource, fragmentShaderSource);
  }

  const renderLoop = async() => {
     gl.clear(gl.COLOR_BUFFER_BIT);
     if(latestPoseRef.current){
        drawSkeleton(gl, latestPoseRef.current, shaderProgramRef.current);
     }
    
    gl.endFrameEXP();
    requestAnimationFrame(renderLoop);

  };

  renderLoop();
};
const animateFrameIdx = useSharedValue(0); 
const onContextCreate_playAnimation = async (gl) => {
  // gl?.cancelFeedbackLoop?.();
   
if (!shaderProgramRef.current) {
    shaderProgramRef.current = createShaderProgram(gl, vertexShaderSource, fragmentShaderSource);
  }

  const renderLoop = () => {
      gl.clear(gl.COLOR_BUFFER_BIT);

    if (latestPoseRef.current){
     drawSkeleton(gl, A[animateFrameIdx.value], shaderProgramRef.current);
      animateFrameIdx.value++;
     if(animateFrameIdx.value > A.length-1){
      animateFrameIdx.value = 0; 
     }
         // console.log(jabFrameIdx.value)
    
    
    
    }

  
    gl.endFrameEXP();
    requestAnimationFrame(renderLoop);

  };

  renderLoop();
};


useAnimatedReaction(() => moveWindowIsOpen.value, (curr, prev) =>{
    if(curr != prev){
        console.log("Move windoe open: ", curr); 
    }
})

useEffect(() => {
  if (poses?.[0]){ 
      latestPoseRef.current = poses[0];
  }

}, [poses]);


    return(
           <View style = {{
            flex: 1,
            backgroundColor: "white",
           }} >
            <StatusBar barStyle="light-content" backgroundColor="#000" />
               <Camera
           
           isMirrored = {true}
           shouldRasterizeIOS = {false}
            enableBufferCompression = {true}
         enableFpsGraph = {false}
         fps={customFormat.maxFps}
         isActive = {true}
         device={device}
         format={customFormat}
         pixelFormat={"rgb"}
         frameProcessor={default_useFramePorcessor}
        videoBitRate={"extra-low"}
         style = {{
            height: Dimensions.get("screen").height,
            width:Dimensions.get("screen").width,
            position:"absolute"
         }}
         />
       <View style={[StyleSheet.absoluteFill, {backgroundColor:"transparent"}]}>
      <GLView
        style={[StyleSheet.absoluteFill, {}]}
        onContextCreate={onContextCreate2}

      />
          </View>
        
        <View style = {{top: 250, position:"absolute", left: 161, height: 100, width: 100, backgroundColor: moveWindowIsOpen.value? 'lightgreen' : 'red', borderRadius: 100}}>
  
          </View>
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