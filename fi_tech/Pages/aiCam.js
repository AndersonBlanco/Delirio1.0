import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import {Text, Animated, View, ActivityIndicator, StyleSheet, Dimensions, Platform, TouchableOpacity, Button, NativeEventEmitter, NativeModules, Easing, Touchable,  } from 'react-native';
import { VStack} from "swiftui-react-native"; 
import SideNav from '../components/sideNav';
import { StatusBar } from 'expo-status-bar';
import { VisionCameraProxy, Camera, useCameraDevice, useCameraFormat, useCameraPermission, useFrameProcessor, runAsync, runAtTargetFps} from 'react-native-vision-camera';
import { createWorkletRuntime, runOnJS, useAnimatedReaction, useDerivedValue } from 'react-native-reanimated';
import { useSkiaFrameProcessor } from 'react-native-vision-camera';
import {Skia, Path, rect, vec} from '@shopify/react-native-skia';
import storage from '../components/storage';
import { useSharedValue, useWorklet, worklet, Worklets, start } from 'react-native-worklets-core';
//import { useSharedValue } from 'react-native-worklets-core';
//import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
//import { RNMediapipe } from '@thinksys/react-native-mediapipe';
import { loadTensorflowModel, useTensorflowModel,} from 'react-native-fast-tflite';
import * as tf from "react-native-fast-tflite"; 
import {Icon, Image} from "react-native-elements"; 
import TestImg from "../assets/workoutCat.jpg"; 
import * as Speech from "expo-speech"; 

import { GLView } from 'expo-gl';
import { Renderer } from 'expo-three';
import * as Permissions from "expo-permissions"; 
import { Audio } from 'expo-av';

//import user data zustand state handlers from zustand store: 
import {useUserState} from "../components/zustandStore"; 
import { color, ScreenHeight, ScreenWidth } from 'react-native-elements/dist/helpers'; //screen dimensions global constahnhts. They are trustworthy
import { Pressable } from 'react-native-gesture-handler';
import Animation1 from "../assets/animation1.json";
import Animation2 from "../assets/animation2.json";
import JabAnimation2 from "../assets/jabAnimation2.json";
import OneTwoAnimation from "../assets/OneTwoAnimation.json"; 
//import StraightRightAnimation from "../assets/straightRightAnimation1.json"; 
import JabAnimation3 from "../assets/jabAnimation3.json";
import { useNavigation } from "@react-navigation/native"; //in react native, this is a hook. Anything that starts with a 'use....' is a hook an dmust be declared inside a function soley.s
//import * as Reusable from "@react-native-reusables/cli";
//import Collapsible from 'react-native-collapsible';
//import Accordion from "react-native-collapsible/Accordion"; 
//import custom components: START
import AI_Chat from './chat';
import {ChatEnvironment, generateVoice_jsthread, promptGPT, synced_textGen_to_speech_jsthread} from '../components/ChatEnvironment';
//import custom components: END
import TransparentLogo from "../assets/transparent_logo.png";

import { Separator, Sheet, Spinner } from 'tamagui';
import ActionSheet, { registerSheet, SheetManager, SheetProvider} from 'react-native-actions-sheet';
import LessonSummarry from './LessonSummarry';
import Logo2SVG from '../assets/logo2_SVG';
import {LinearGradient} from "react-native-linear-gradient";
import GoodRest from "../assets/GoodRest.json";
import GoodJab from "../assets/GoodJab.json";
import GoodStraightRight from "../assets/GoodStraightRight.json";
import GoodUppercut from "../assets/GoodUppercut.json";
import {mat4} from 'gl-matrix';
import RNSystemSounds from '@dashdoc/react-native-system-sounds';


const midChat = (
    <View style = {{ paddingBottom: 5, top: 43, zIndex: 100, backgroundColor: "transparent", position:"absolute", height: ScreenHeight*.8, width: ScreenWidth, }}>
             <ChatEnvironment isKeyboardInternallyHandled = {true} viewStyle={{flex: 1, paddingVertical: 0, paddingHorizontal: 2, paddingTop: 1, paddingBottom: 25}} placeholderTextColor="rgba(0,0,0,.25)" textInputBackground="rgba(0,0,0,.1)" color = "black"/>
        </View>
)

const ChatSheet = () =>{

    return(
           <ActionSheet
           containerStyle={{overflow:'hidden', backgroundColor:"rgb(255, 255, 255)", position:"absolute", flex: 1,}}
      gestureEnabled={true}
      indicatorStyle={{
        width: 100,
        backgroundColor:"rgba(255,255,255,.9)",
        height:3,
        position:"absolute",

      }}>
      <View
        style={{
          paddingHorizontal: 12,
 
          height: Dimensions.get('screen').height/1.17,
          alignItems: 'center',
          justifyContent: 'center',
          overflow:"hidden",
 
        }} >
    {midChat}
      </View>
    </ActionSheet>
    )
}
registerSheet("ChatSheet", ChatSheet);

const {TTS} = NativeModules; 

const detectPlugin = VisionCameraProxy.initFrameProcessorPlugin("detect",{});  //the custom native code plugin importioned from the nxcode native side | the string "detect" is the exact native side function name which must be matched here as seen in the string argument
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

//const mediapipePose_swiftPlugin = VisionCameraProxy.initFrameProcessorPlugin("medipaipePose_detect", {}); 

const strikes_upperBound = 7; 

const synced_text_to_speech_runOnJS = (txt) => TTS.synced_text_to_speech(txt); //prompts gpt and plays only once, no converse 




export default function AICam({theme}){ //main function of the page 'AI_Cam' 

  const nav = useNavigation(); 
   // const {userStrikes, incrimentUserStrikes, resetUserStrikes, userStrikedOut} = useUserState(); 
   const strikes = useSharedValue(0);
   const userGotStrikedOut = useSharedValue(false);
   const userCorrectMoves = useSharedValue(0);
   const max_GRU_idx = useSharedValue(-1); 
   const totalMovements = useSharedValue(-1); 
    const resetUserState = () =>{ //resets the stats of the user (ie number of strikes, and sets the booolean of userGotStrikedOut to false)
        strikes.value = 0; 
        userGotStrikedOut.value = false; 
       poseHistriy.current = []; 
      
        console.log('user stats resetted');
      TTS.stopConverse()

    }
    const incrimentUserStrikes_alt = () =>{ //also responsible for incirmenting the variable userIncorrectMoves | as seen at the end of the function name "alt", its an alternative to the first incrimentUserStrikes function as a replacement or alternative

       let val = strikes.value + 1; 
        if (val >=strikes_upperBound){
          strikes.value = 0;
          userGotStrikedOut.value = true; 
      
        }else{
          strikes.value = val; 
          userGotStrikedOut.value = false; 
        }
    };

    const incrimentUserStrikes = Worklets.createRunOnJS(() =>{ //incriments user's strikes by 1 
        'worklet';
        let val = strikes.value + 1; 
        if (val >=strikes_upperBound){ //extra to 4, not 3 for padding space
          strikes.value = 0;
          userGotStrikedOut.value = true; 

  
        }else{
          strikes.value = val; 
          userGotStrikedOut.value = false; 
        }

        
    }); 



const {hasPermission, requestPermission} = useCameraPermission(); //requestPermission is the hook which requests camera permissions from user | hasPermission is just the variable housing the state of the camera permission 
const [camFlip, setCamFlip] = useState(true); //determines front / back camera usage
const device = useCameraDevice(camFlip? "front" : "back", {}); //the object used by the <Camera/> tag below in the main return statement. 
const [poses, setPoses] = useState([]);  //state variable housing poses passed from the native side 
const poseHistriy = useRef([]);


const textLabelSharedValm=useSharedValue('-'); //text that is shown on screen during live lesson 
const moveWindowIsOpen = useSharedValue(false); //moveWindowIsOpen is the variable keeping track of when the user is allowed to move with the gurantee that their movements are being recorded and processed for prediction. When false, the user's movements are technically meaningless and will not be processed for predictions 
const [lessonPaused, setLessonPaused] = useState(false);  //determines when lesson is paused as configured by the pause and plau UI buttons below in the main return statement 
const latestPoseRef = useRef(null); //VERY IMPORTANT, this is what triggers the change in value of the state variable {poses} and is directly configured with custom values from the native side 
//invokes continous conversation with AI, agentic-like conversation 
const triggerConverse = () => TTS.converse(`Additional instructions/preprompt: The user just executed an incorrect movement, here is the statement describing the evaluation of the movement: ${textLabelSharedValm.value}`)
                     .then(r =>{
                     console.log(r); 
                      console.log("Conversed"); 
                       
                      }).catch(e =>{
                     console.log(e)
                       console.log("Spoken"); 
                      TTS.stopConverse();
                      });


const customFormat = useCameraFormat(device, [{ //settings / formats for the <Camera/> tag found below in the main retiurn statement
    fps: 30, 
    videoStabilizationMode:'off', 
    //photoAspectRatio:ScreenWidth/ScreenHeight,
    //videoAspectRatio:ScreenWidth/ScreenHeight,
    photoResolution:{height: ScreenHeight, width:ScreenWidth},
    videoResolution:{height:ScreenHeight, width:ScreenWidth}
    //photoAspectRatio: 1/2,
    //videoAspectRatio: 1/2,
}]) //fps set to max

 
useEffect(() =>{ //useEffects allow code to execute without interfearing with the 'main thread' playing. This 'main thread' is better understood as the main program running and the code inide the useEffect runs in the background like a very sneaky ninja!
    if(!hasPermission){
        requestPermission();
    }
    
}, [hasPermission]);

if(!hasPermission){ //if app does not have permissions from user, then this page will display
    return(
        <>
            <StatusBar barStyle="light-content" backgroundColor="#000" />
            <SideNav buttonColor={'white'} style = {{top: 70, left: -173, marginBottom: 50, position:"relative"}}/>
            <Text style = {{color: 'white', alignSelf:"center", bottom: -350}}>Go to settings and allow permission for this appplication</Text>
         </>
    )
}

if(!device){ //if valid <Camera/> hardware device is not found, this content will be rendered instead.   
    return(
        <>
            <Text style = {{color: 'white', alignSelf:"center", bottom: -350}}>Camera Device not identitified</Text>
        </>
    )
}

useAnimatedReaction(()=>{return {dep1: textLabelSharedValm.value, dep2: userGotStrikedOut.value, dep3: moveWindowIsOpen.value}}, (curr, prev) =>{ //currently unused, can be deleted confidently, but is better if kept and ignored just in case for future errors or bugs, these can invoked as potential solutions instead 
  //trigger once ai feed back for per user movement evaluation during lesson, while user has not beedn striked out 
  if(!curr.dep3){
      if(curr.dep1 != '-' && !curr.dep2 && (curr.dep1 == prev.dep1 || curr.dep1 != prev.dep1) ){
       runOnJS(synced_text_to_speech_runOnJS)(`User just executed an incorrect movement, return a coach statement taht is under 3 seconds long that gives them feedback based on the statement '${textLabelSharedValm.value}' which describes their mistake`);
    }
  }else{
   
  }
  
    if(curr.dep2){
      //Agentic AI converse native function implementation 
        console.log('agentic ai');
       runOnJS(triggerConverse)()
    }else{
      
    }
    totalMovements.value++; 
}, [textLabelSharedValm.value, userGotStrikedOut.value, moveWindowIsOpen.value]);


const updatePoses = Worklets.createRunOnJS((p) =>{ //updates pose, called from within useFrameProcessor() hook function
       setPoses(p);
       //poses.current = p; 
});

const animationPoses = useSharedValue([]);
const default_useFramePorcessor = useFrameProcessor((frame) =>{ //veyr important piece, it does exactly what it sname reflects: processes frames incoming from the <Camera/> tag and passes it onto the th enative side for evaluation and predictions 
    'worklet'; 
    let res = detectPlugin.call(frame, {userGotStrikedOut: userGotStrikedOut.value}); //detectPlugin.call, calls the native side function and passes {frame} as one argument, and userGotStrikedOut as another for native side processing 

    if(res[1].length >0){
    if(animationPoses.value.length <= 100){
      
    //  animationPoses.value.push(res[1]); //forces the animatioPoses.value to overreach pass length 40, which would trigger no more console.log visually distracting from the foucs section of interest of the array in the temrinal
 
    }else{
 //console.log("AnimationPoses: END");
 

    }
    }
 


    if(detectPlugin == null){
      console.log("null value for plugin ")
    }else{
  
    max_GRU_idx.value = res[4] > -1 ? res[4] : max_GRU_idx.value; 
  //  console.log(max_GRU_idx.value, res[4]); 

    updatePoses(res[1]); //updates poses


     if(res[2].length > 0 && res[6] != "Wait for break to be over, punchClass"){
     // textLabelSharedValm.value = res[6]; //////////////previous textLabel set


     if([1,2,3,5,6,8,9,11,12,13].includes(res[4])){
      incrimentUserStrikes();
     }else{
      userCorrectMoves.value++; 
     };
    // console.log(strikes.value)
     }


      if(res[8] != undefined){
    console.log("PredicitonP: ", res[8])
      textLabelSharedValm.value = res[8]; //Best textLabel set
      }
      
    if(!userGotStrikedOut.value){
      if(res[5] && res[6] != textLabelSharedValm.value && res[6] != "Wait for break to be over, punchClass" && res[6] != -1){ //was if res[3] == 0
       // updateExternals(res[3], res[5], frame.height, frame.width); 
     
          textLabelSharedValm.value = res[6]; 
         //  console.log(res[3]); 

         //console.log(res[1]); 
      }
        //if res[5] == true:
   
       moveWindowIsOpen.value = res[5]; 
       
    }
     
 
  }


}, [userGotStrikedOut.value]);

const flipIcon = (           
    <TouchableOpacity style = {{position:"absolute", top: 125, left: 22}} onPress={() => setCamFlip(!camFlip)}>
<Icon size={27} name="cameraswitch" backgroundColor={"transparent"} color={"white"} style={{}}/>
    </TouchableOpacity>     
);



//const glRef = useRef(); 


const allJoints = ["right_upLeg_joint", "right_forearm_joint", "left_leg_joint", "left_hand_joint", "left_forearm_joint", "right_leg_joint", "right_foot_joint", "right_shoulder_1_joint", "left_upLeg_joint", "left_foot_joint", "right_hand_joint", "head_joint", "left_shoulder_1_joint"];


const gru_output_limb_color_map = {
  1:{
    target_SKELETON_CONNECTIONS: [12, 13],
    color:[1.0, 0.0, 0.0, 1.0],
    correction: GoodJab
  },

    2:{
    target_SKELETON_CONNECTIONS: [9,10],
    color:[1.0, 0.0, 0.0, 1.0],
    correction: GoodJab
  },

    3:{
    target_SKELETON_CONNECTIONS: [9,10,12,13],
    color:[1.0, 0.0, 0.0, 1.0],
    correction: GoodJab
  },

      5:{
    target_SKELETON_CONNECTIONS: [6],
    color:[1.0, 0.0, 0.0, 1.0],
    correction: GoodRest
  },
    6:{
    target_SKELETON_CONNECTIONS: [9,10,12,13],
    color:[1.0, 0.0, 0.0, 1.0],
    correction: GoodRest
  },

      8:{
    target_SKELETON_CONNECTIONS: [12,13],
    color:[1.0, 0.0, 0.0, 1.0],
    correction: GoodStraightRight
  },

      9 :{
    target_SKELETON_CONNECTIONS: [0,1],
    color:[1.0, 0.0, 0.0, 1.0],
    correction:GoodStraightRight
  },

      11:{
    target_SKELETON_CONNECTIONS: [0,1],
    color:[1.0, 0.0, 0.0, 1.0],
    correction:GoodUppercut
  },

      12:{
    target_SKELETON_CONNECTIONS: [0,1],
    color:[1.0, 0.0, 0.0, 1.0],
    correction:GoodJab
  },

      13:{
    target_SKELETON_CONNECTIONS: [9,10,12,13,6],
    color:[1.0, 0.0, 0.0, 1.0],
    correction:GoodRest
  },

}
const SKELETON_CONNECTIONS = [
  ["root", "left_upLeg_joint"],//0
  ["root", "right_upLeg_joint"],//1
  ["left_upLeg_joint", "left_leg_joint"],//2
  ["left_leg_joint", "left_foot_joint"],//3
  ["right_upLeg_joint", "right_leg_joint"],//4
  ["right_leg_joint", "right_foot_joint"],//5
  ["root", "neck_1_joint"],//6
  ["neck_1_joint", "head_joint"],//7
  ["neck_1_joint", "left_shoulder_1_joint"],//8
  ["left_shoulder_1_joint", "left_forearm_joint"],//9
  ["left_forearm_joint", "left_hand_joint"],//10
  ["neck_1_joint", "right_shoulder_1_joint"],//11
  ["right_shoulder_1_joint", "right_forearm_joint"],//12
  ["right_forearm_joint", "right_hand_joint"],//13
  ["head_joint", "left_eye_joint"],//14
  ["head_joint", "right_eye_joint"],//15
  ["left_eye_joint", "left_ear_joint"],//16
  ["right_eye_joint", "right_ear_joint"]//17
]; //skeleton connections used for drawing connections between joints correctly to represent a human like drawing of the human body 
const normalizeGLCoords = (x, y) => [ //nomralizes joint cordinates 
      1 - y * 2.005  ,
      1-x * 2    // Convert to [-1, 1] range
     // Flip vertically (WebGL Y-down to screen Y-up)
];
function createShaderProgram(gl, vertexSrc, fragmentSrc) { //comonent required to initiate the OpenGLView setup which enables drawing onverlays on screen 
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

//bellow is a openGL language (C++) string that sets the vector positions and size of points for the drawing done by the GLView component on screen
const vertexShaderSource = `
        attribute vec2 position;
        void main() {
          gl_Position = vec4(position.x/0.57 - .03, position.y, 0.0, 1.0);
          gl_PointSize = 20.0; 
        }
        `;

const drawSkeleton = useCallback((gl, joints, shaderProgram,colorUnformLoc, inverted = false, incorrectDrawing = true) => {//drawSkeleton : START


  //create uniform color space: 

  SKELETON_CONNECTIONS.forEach(([start, end], idx) => {
    const j1 = joints[start];
    const j2 = joints[end];

    if (!j1 || !j2 || j1.conf < 0.2 || j2.conf < 0.2) return;

    const [x1, y1] = normalizeGLCoords(j1.x, j1.y);
    const [x2, y2] = normalizeGLCoords(j2.x , j2.y);
        gl.lineWidth(10);
        gl.LINE_LOOP; 
/*
    let _x1 = !camFlip? -x1 : x1; 
    let _x2 = !camFlip? -x2 : x2; 
    
    let _y1 = !camFlip? -y1 : y1;
    let _y2 = !camFlip? -y2 : y2; 
    */


    const vertices = new Float32Array([inverted? -x1 : x1, y1, inverted? -x2 : x2, y2]);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const posLoc = gl.getAttribLocation(shaderProgram, "position");
    
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);
    
    if(gru_output_limb_color_map[max_GRU_idx.value] && max_GRU_idx.value != -1 && incorrectDrawing){
      gl.uniform4fv(colorUnformLoc, gru_output_limb_color_map[max_GRU_idx.value].target_SKELETON_CONNECTIONS.includes(idx)? new Float32Array([1.0, 0.0, 0.0, 1.0] ) : new Float32Array([0.5, 1.0, 0.5, 1.0]));
    }else{
      gl.uniform4fv(colorUnformLoc, new Float32Array([0.5, 1.0, 0.5, 1.0]));
    }
    /*
    if(userGotStrikedOut.value){
      gl.uniform4fv(colorUnformLoc, new Float32Array(limb_color_map.value[idx]));
    }
      */

    gl.drawArrays(gl.LINES, 0, 2);
    gl.deleteBuffer(buffer);



    //drawing circlel articulations/joints: /////////////////
    const joints_vertecies = new Float32Array([inverted? -x2:x2, y2]);
    const joints_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, joints_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, joints_vertecies, gl.STATIC_DRAW);

    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    gl.uniform4fv(colorUnformLoc, [.95, .95, .95, 1.0]);
    gl.drawArrays(gl.POINTS, 0, 1);
    gl.deleteBuffer(joints_buffer);
    

    //callback
   // feedback_animation_oscikator.value = !feedback_animation_oscikator.value; 
    //console.log("ANIMATION SWITCHED");

 
  });
})
//drawSkeleton : END

//console.log("Jab frames lngth:", jabFrames.length)
const shaderProgramRef = useRef(null);

const userRecentAnimation = useSharedValue(null); 
const jabFrameIdx = useSharedValue(0),//although the name specififes jab, its used as a general index tracker for the animations to be displayed on the FeedbackScreen
      correctAnimationIdx = useSharedValue(0); 
      
 const fragmentShaderSource = `
        precision mediump float;
        uniform vec4 u_color;

        void main() {
          gl_FragColor = u_color; // green points
        }`;


const onContextCreate2 = async (gl) => { // the function responsible of carrying out the steup and execution of openGL drawing on screen
  // gl?.cancelFeedbackLoop?.();
   
if (!shaderProgramRef.current) {
    shaderProgramRef.current = createShaderProgram(gl, vertexShaderSource, fragmentShaderSource);
  }
   const colorUniformLocation = gl.getUniformLocation(shaderProgramRef.current, 'u_color');     

  //let target_animation = poseHistriy.current;

  const renderLoop = () => {
      gl.clear(gl.COLOR_BUFFER_BIT);

  
    if (latestPoseRef.current) {
             
      if(userGotStrikedOut.value &&  poseHistriy.current.length > 0){

    //draw recent user poses: START
    gl.viewport(0,ScreenHeight*0.25,ScreenWidth*0.925, ScreenHeight*1.5); 
    drawSkeleton(gl,  poseHistriy.current[jabFrameIdx.value], shaderProgramRef.current, colorUniformLocation, true, true); 
      jabFrameIdx.value++;
     if(jabFrameIdx.value >  poseHistriy.current.length-1){ //|| jabFrameIdx.value > StraightRightAnimation.length-1){
      jabFrameIdx.value = 0; 
     }
    //draw recent user poses: END

    
    //draw correct poses example: START
    gl.viewport(ScreenWidth*1.07,ScreenHeight*0.25,ScreenWidth*1, ScreenHeight*1.5); 
    drawSkeleton(gl,  gru_output_limb_color_map[max_GRU_idx.value].correction[correctAnimationIdx.value], shaderProgramRef.current, colorUniformLocation, true, false); 
      correctAnimationIdx.value++;
     if(correctAnimationIdx.value >  gru_output_limb_color_map[max_GRU_idx.value].correction.length-1){ //|| jabFrameIdx.value > StraightRightAnimation.length-1){
      correctAnimationIdx.value = 0; 
     }
    //draw correct poses example: END

    }else{
  gl.viewport(0,0,ScreenWidth*2, ScreenHeight*2); 
   drawSkeleton(gl, latestPoseRef.current[0], shaderProgramRef.current, colorUniformLocation);
    }
    
    }

  
    gl.endFrameEXP();
    requestAnimationFrame(renderLoop);

  };

  //if(poseHistriy.length > 0){
    renderLoop();
  

};

//const step = useSharedValue(1); 
const array_multiplier_speed_emulator_variable = 10; 
const poseHistCount = useSharedValue(0); 
useEffect(() => { //updates the latestPoseRef, very important
  if (poses?.[0]){ 
      latestPoseRef.current = poses;
    if(strikes.value >= strikes_upperBound-1){

    if(moveWindowIsOpen.value){
      //poseHistriy.current[poseHistriy.current.length] = poses[0]; //[poseHistriy.current.length]// =/Array.from(poses[0], poses[0]);//Array.from(poses[0],poses[0], poses[0], poses[0], poses[0], poses[0], poses[0], poses[0], poses[0], poses[0])[0];
      poseHistriy.current[poseHistriy.current.length] = poses[0]; //Array(array_multiplier_speed_emulator_variable).fill(poses[0])[0];//Array.from(poses[0],poses[0], poses[0], poses[0], poses[0], poses[0], poses[0], poses[0], poses[0], poses[0])[0];

  }
    
   }
 
  }

}, [poses, strikes.value, moveWindowIsOpen.value]); //passing in this as last argument just specifies upon what should the function executed inside the useEffect hook shoul depend on / purpose based on some data(in this case, poses variable)


//clock ufnctionality :
const countDown = useSharedValue(180);  // initial count, in seconds
  const [minutes, setMinutes] = useState(3);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    // Start the countdown timer
    const interval = setInterval(() => {
      if (!lessonPaused && !userGotStrikedOut.value && countDown.value > 0) {
        countDown.value -= 1;
        let minutes = Math.floor(countDown.value  / 60); 
        setMinutes(minutes);

        let _seconds = countDown.value % 60; 
        setSeconds(_seconds); 
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lessonPaused]);



  // Synchronize shared value with React state for display

////////////////////////////////////////////styling + componentilizing ////////////////////////////////////////////////////////////////////

const skipFeedback_opacity = useRef(new Animated.Value(0)).current;
const is_conversation_loop = useSharedValue(false); 

const gradirntAnimation = useRef(new Animated.Value(0)).current;
const backgrouhndColorAnimation_duration = useSharedValue(1000);
useEffect(() => {
  
  if (userGotStrikedOut.value) {
    Animated.loop(
      Animated.sequence([
        Animated.timing(gradirntAnimation, {
          toValue: 1,
          duration: backgrouhndColorAnimation_duration.value,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true, // must be false for color interpolation
        }),
        Animated.timing(gradirntAnimation, {
          toValue: 0,
          duration: backgrouhndColorAnimation_duration.value,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }

}, [userGotStrikedOut.value]);

const FeedbackInteruptionScreen = (
 <>
        <SheetProvider>
        
        <Animated.View 
        onTouchStart={resetUserState} 
        style = {{ position:"absolute", 
        height: ScreenHeight, 
        width:ScreenWidth, 
        backgroundColor:"transparent"}}
        >
         

        
            <View>{/*animation skeleton for correction*/}</View>         
            <Animated.Text style = {{position:"absolute", bottom: 50, color:"black", left: ScreenWidth/5.25, opacity: skipFeedback_opacity}}>Tap anywhere on screen to skip</Animated.Text>

        </Animated.View>
      </SheetProvider>
      
     

 
    <TouchableOpacity onPress={() => {
               SheetManager.show("ChatSheet")
              }} style = {{backgroundColor:"white", top: 59, alignSelf:'center', borderRadius: 100, padding: 5, alignItems:"center", flexDirection:"row", columnGap:0, justifyContent:"center", }}>
          <Logo2SVG fill = "black" height = {70} width = {70}  />
                </TouchableOpacity>
        
        
                <View style = {{backgroundColor:"rgba(0,0,0,.75)", width: 2.5, height: ScreenHeight/1.34, position:"relative", right: -ScreenWidth/2.01, bottom: -45, zIndex: 10000}}/>
        
        </>
      );


const [see, setSee] = useState(false);
  const go_opacity = useRef(new Animated.Value(0)).current;

  //curious if optimization can be done here (below): 
 useEffect(() => {
    if (moveWindowIsOpen.value && !userGotStrikedOut.value) {
      setSee(true);
     
      RNSystemSounds.beep(); //play beep sound. 
      //console.log(moveWindowIsOpen.value)
    }
    
      go_opacity.setValue(1); //1 = full opacity (visible)

      Animated.timing(go_opacity, {
        toValue: 0,
        duration: 2000, //fade out over 1 second
        useNativeDriver: true, 
      }).start(() => {
        setSee(false); //hide 
      });
    
  }, [moveWindowIsOpen.value]);


const loopAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(skipFeedback_opacity, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(skipFeedback_opacity, {
          toValue: 0,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    //logic for determining gpt response/reaction statement intensity:
    //use slope meachnism (similar to USA Boxing) where: 
    //
    //      m_n = correctMovements/totalMovementsUpUntilRecentExecutedMovement 
    // m_n-1 = the past m slope before the current m slope (m_n)
    // if m_n > m_n --> gpt responds with more negative intensity / sentiment / criticism 
    // if m_n < m_n --> gpt responds with moroe posiitve intensity / sentiment / criticism 
    //
    // gpt logic prompt statement to adjust repsonse intensity: 
    //      "you .........."

    // End lesson stats: 
    //            corrects: correctMovements
    //            incorrects: final totalMovementsUpUntilRecentExecutedMovement - correctMovements
    //            final m = (final correctMovements) / (final totalMovementsUpUntilRecentExecutedMovement)
    //            likeleyhood for next moovement to be correct: final m


    /*
    useEffect( () =>{
      if(userGotStrikedOut.value){
       //TTS.synced_text_to_speech(`User executed a movement incorrectly, give an inspirational coahc feedback according to the this statement describing the user's incorrect movement: ${textLabelSharedValm.value}`)
       //synced_textGen_to_speech_jsthread(`User executed a movement incorrectly, give an inspirational coahc feedback according to the this statement describing the user's incorrect movement: ${textLabelSharedValm.value}`)
    }else{
        if(max_GRU_idx.value % 2 > 0){
         // TTS.synced_textGen_to_speech(`User just executed an incorrect movmeent descirbed by this statement: ${textLabelSharedValm.value}. In a short but usweet statement, tell them useful on line motivation feedback accofding to the statement.`)
       //console.log("incorrect move")
       //TTS.speak("Incorrect mvoement")
        }else if(max_GRU_idx.value % 2 == 0){
          //TTS.synced_text_to_speech("User just executed a correct movement, congratulate them")
        }
    }
    }, [max_GRU_idx.value, userGotStrikedOut.value]);
    */

  useEffect(() =>{
  if(userGotStrikedOut.value){
    skipFeedback_opacity.setValue(0); 
    loopAnimation.start();
  }else{
    loopAnimation.stop();
    skipFeedback_opacity.setValue(0);
  }

  },[userGotStrikedOut.value])



  const Clock = (
<>

  <View style ={[styles.row, {columnGap: 10, position:"absolute", top: 97, right: -6.5, backgroundColor:"transparent", alignItems:"center", justifyContent:"center", width:ScreenWidth, }]}>
      <Animated.Text style = {{ color: userGotStrikedOut.value? 'black' : 'white',  fontSize: 50}}>{minutes}</Animated.Text>
      <Animated.Text style ={{color:userGotStrikedOut.value? "black" : "white", fontSize: 50, top: -7}}>:</Animated.Text>
      {
        seconds < 10?
      <Animated.Text style ={{ color: userGotStrikedOut.value? 'black' : 'white', fontSize: 50}}>0</Animated.Text>
      :
      null
      }
      <Animated.Text style = {{ color: userGotStrikedOut.value? 'black' : 'white', fontSize: 50}}>{seconds}</Animated.Text>
  </View>
         

<View>{/* below aare the ui buttons for pause or resume lesson functionality*/}</View>
</>
  );


//const RestartLeson = () => nav.navigate("AI_Cam");
//<Animated.Text style = {{color:"black", fontSize: 21}}>View Summarry</Animated.Text>

/*
const PredicitonTextBubble = (
     <View style = {{ alignSelf:"center", top: 50, right: 34, backgroundColor:"white", 
                height: Dimensions.get("screen").height*.07,
                width:Dimensions.get("screen").width*.7,
                position:"absolute",
                borderTopEndRadius: 25,
                borderTopLeftRadius: 25,
                borderRadius: 25, 
                alignItems:"center",
                justifyContent:"center",
           
                pointerEvents:"auto"
            }}>

      <TouchableOpacity onPress={incrimentUserStrikes_alt}>
            <Animated.Text style = {{color: "black", fontSize: 20}} >{textLabelSharedValm.value}</Animated.Text>
            </TouchableOpacity>

            </View>
); 
*/

    return(
 
           <View style = {{
            flex: 1,
            backgroundColor: "transparent",
           }} >
            <StatusBar barStyle="light-content" backgroundColor="#000" />
               <Camera
          
           isMirrored = {true}
           shouldRasterizeIOS = {false}
            enableBufferCompression = {true}
         enableFpsGraph = {false}
        
         isActive = {true}
         device={device}
         format={customFormat}
         pixelFormat={"rgb"}
         
         frameProcessor={default_useFramePorcessor}
        videoBitRate={"extra-low"}
         style = {{
            height: ScreenHeight,
            width:ScreenWidth,
            position:"absolute"
         }}
         />
       <View style={[StyleSheet.absoluteFill, {backgroundColor: userGotStrikedOut.value? "white" : "transparent"}]}>
      <GLView
        
        style={StyleSheet.absoluteFill}
        onContextCreate={onContextCreate2}

      />
    </View>
{//UI elements overlay


(
userGotStrikedOut.value? 
FeedbackInteruptionScreen
:

<View style = {{flex: 1, zIndex: 1}}>
    {flipIcon}
    <SideNav buttonColor={theme? "black": "white"} style = {{top: 70, left: -173, marginBottom: 50, position:"relative"}}/>
        

            {
                countDown.value <= 0?
           <>
          <TouchableOpacity onPress={() => nav.replace("LessonSummarry")} style = {{ flexDirection:'row', paddingHorizontal: 10, zIndex: 1000000, padding: .01,  alignItems:"center", justifyContent:"center", position:"absolute", bottom: 150, alignSelf:"center", backgroundColor:"white", borderRadius: 100,}}>
          <Logo2SVG fill = "black" height = {50} width = {50}  />
          <Animated.Text style = {{color:"black", fontSize: 21}}>Summarry</Animated.Text>
          </TouchableOpacity>
          </> 
                :
              (
            !lessonPaused?
            <Animated.View style = {{position:"absolute", left: ScreenWidth/9, bottom: 100}}>
           <TouchableOpacity style = {{ borderRadius: 100, backgroundColor:"transparent"}} onPress={() => setLessonPaused(true)}  >
            <Icon containerStyle = {{backgroundColor:"white", borderRadius: 100, overflow: 'visible', boxSizing:"content-box", padding: 0}} iconStyle={{position:"relative", margin: -10}} type='ionicon' style={{flex: 1}} fill = "white" size = {90} name = "pause-circle" color={"black"} />
           </TouchableOpacity>
            </Animated.View>
        :

        <TouchableOpacity style = {{position:"absolute", right: ScreenWidth/9, bottom: 100, borderRadius: 100, backgroundColor:"transparent"}} onPress={() => setLessonPaused(false)}>
            <Icon containerStyle = {{backgroundColor:"white", borderRadius: 100, overflow: 'visible', boxSizing:"content-box", padding: 0}} iconStyle={{position:"relative", margin: -10}} type='ionicon'  style={{flex: 1}} fill = "white" size = {90} name = "play-circle" color={"black"} />
        </TouchableOpacity>
        )

          }


        




    </View>
)
  
}

  {/*(
    (see)?
    <Animated.Text style = {{display: "flex", position:"absolute", color: "white", fontWeight: "bold", bottom: ScreenHeight/2.3, right: ScreenWidth/4.7, fontSize: 90, opacity: go_opacity}}>GO!</Animated.Text>
    :
    <Animated.Text style = {{display: "flex", position:"absolute", color: "white", fontWeight: "bold", bottom: ScreenHeight/2.3, right: ScreenWidth/5, fontSize: 90, opacity: go_opacity}}>PAUSE!</Animated.Text>
)*/
  }

   {userGotStrikedOut.value? null : Clock}
   

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


/*

good rest 
bad rest -[knee lvl lack, hands down, too curved back, narrow stance]
bad rest - complex - incorrect,incorrect - [(lack knee lvl + bent back)]

good jab 
bad jab - [lack of knee lvl, oppose guard low, lack of hip rotation, lack end guard, lack of extension]
bad jab - complex flaw - incorrect, incorrect - [(lack of end guard + lack of opposite)]

good straight 
bad straight - [ opposite guard low, lack of extension, lack of hip rotation, lack of end guard, lack of knee lvl,  ]
bad straight - complex - incorrect, incorrect - [()]

good upper-cut 
bad upper-cut - [ lack of rotation, lack of end guard, lack of opposite guard]
bad uppercut - complex - incorrect - [(over-wind up + over-extension-too-high-up)]

[straight jab, jab, uppercut, rest]
[punchtype, .....] = [flaw, .....] = [correct, incorrect]
*/