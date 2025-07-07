import React, { useEffect, useState, useRef, useCallback } from 'react';
import {Animated, View, ActivityIndicator, StyleSheet, Dimensions, Platform, TouchableOpacity, Button, NativeEventEmitter, NativeModules, Easing, Touchable,  } from 'react-native';
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
import { ScreenHeight, ScreenWidth } from 'react-native-elements/dist/helpers'; //screen dimensions global constahnhts. They are trustworthy
import { Pressable } from 'react-native-gesture-handler';
import Animation1 from "../assets/animation1.json";
import Animation2 from "../assets/animation2.json";
import JabAnimation2 from "../assets/jabAnimation2.json";
import OneTwoAnimation from "../assets/OneTwoAnimation.json"; 
import StraightRightAnimation from "../assets/straightRightAnimation1.json"; 
import JabAnimation3 from "../assets/jabAnimation3.json";
import { useNavigation } from "@react-navigation/native"; //in react native, this is a hook. Anything that starts with a 'use....' is a hook an dmust be declared inside a function soley.s

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


export default function AICam({theme}){ //main function of the page 'AI_Cam' 
  const nav = useNavigation(); 
   // const {userStrikes, incrimentUserStrikes, resetUserStrikes, userStrikedOut} = useUserState(); 
   const strikes = useSharedValue(0);
   const userGotStrikedOut = useSharedValue(false);
   const userIncorrectMoves = useSharedValue(0);
   const userCorrectMoves = useSharedValue(0);

   /*
    const [userState, steUserState] = useState({
        userStrikes: useDerivedValue(() => strikes.value),
        userStrikedOut: userGotStrikedOut.value
    });
    */

    const resetUserState = () =>{ //resets the stats of the user (ie number of strikes, and sets the booolean of userGotStrikedOut to false)
        strikes.value = 0; 
        userGotStrikedOut.value = false; 
        console.log('user stats resetted')
    }

    const incrimentUserStrikes_alt = () =>{ //also responsible for incirmenting the variable userIncorrectMoves | as seen at the end of the function name "alt", its an alternative to the first incrimentUserStrikes function as a replacement or alternative

       let val = strikes.value + 1; 
        if (val >=3){
          strikes.value = 0;
          userGotStrikedOut.value = true; 
          
          if(textLabelSharedValm.value!= '-'){  //was textLabel != '-'
         //  TTS.speak(textLabel); 
          }

        }else{
          strikes.value = val; 
          userGotStrikedOut.value= false; 
        }
        userIncorrectMoves.value++; 
        //console.log("incirmented to: ", strikes.value); 
    };

    const incrimentUserStrikes = Worklets.createRunOnJS(() =>{ //incriments user's strikes by 1 
        'worklet';
        let val = strikes.value + 1; 
        if (val >=4){ //extra to 4, not 3 for padding space
          strikes.value = 0;
          userGotStrikedOut.value = true; 
          
            if(textLabelSharedValm.value!= '-'){ //was textLabel != '-'
           //TTS.speak(textLabel); 
          }

      
  
        }else{
          strikes.value = val; 
          userGotStrikedOut.value = false; 
        }

        //console.log("incirmented to: ", strikes.value); 
    }); 

//const {userStrikes, userStrikedOut} = userState; 

 //const model = useTensorflowModel(require('../components/pose_landmark_lite.tflite')); model loads correctly + no recursive reloading 


//custom GRU2 model initialization 
//Speech.speak("Hello Universe"); 
//const detectPlugin = VisionCameraProxy.initFrameProcessorPlugin("detect", {}); 

/*
//audio configurations + Permissions:
  Permissions.getAsync("audioRecording");

   //setting audio configurations
   useEffect(() => {
  Audio.setAudioModeAsync({
    playsInSilentModeIOS: true,  // Required for iOS
    staysActiveInBackground: false,
    shouldDuckAndroid: false,
    playThroughEarpieceAndroid: false,
  });
}, []);


const Speak = async (txt) =>{
    if(!Speech.isSpeakingAsync()){
    Speech.speak(txt, {
        pitch: 1,
        language:"en", 
        rate: 1, 
        onError: (e) => console.log("Error on speech: ", e),
        onDone: () => console.log("Done Speech")
    })

    }else{
        //await Speech.stop(); //stop any previous speech sessions
    }
}
*/

const {hasPermission, requestPermission} = useCameraPermission(); //requestPermission is the hook which requests camera permissions from user | hasPermission is just the variable housing the state of the camera permission 
const [camFlip, setCamFlip] = useState(true); //determines front / back camera usage
const device = useCameraDevice(camFlip? "front" : "back", {}); //the object used by the <Camera/> tag below in the main return statement. 
const [poses, setPoses] = useState([]);  //state variable housing poses passed from the native side 
//const [textLabel, setTextLabel] = useState("-"); 
const textLabelSharedValm=useSharedValue('-'); //text that is shown on screen during live lesson 
const moveWindowIsOpen = useSharedValue(true); //moveWindowIsOpen is the variable keeping track of when the user is allowed to move with the gurantee that their movements are being recorded and processed for prediction. When false, the user's movements are technically meaningless and will not be processed for predictions 
const [moveWindowIsOpen_state,set_moveWindowIsOpen] = useState(true);//another state variable keeping track of the moveWindowIsOpen behaviour | currently unused sexcept to change its value but can be deleted confidently 
//
const [lessonPaused, setLessonPaused] = useState(false);  //determines when lesson is paused as configured by the pause and plau UI buttons below in the main return statement 
//
const latestPoseRef = useRef(null); //VERY IMPORTANT, this is what triggers the change in value of the state variable {poses} and is directly configured with custom values from the native side 
/*
useAnimatedReaction(() => userGotIncorrectedMovement.value, (curr, prev) =>{
    if(curr != prev){
        //incrimentUserStrikes(0 )
    }
   // console.log(curr); 
}, [userState]);
*/

const customFormat = useCameraFormat(device, [{ //settings / formats for the <Camera/> tag found below in the main retiurn statement
    fps: 'max', 
    videoStabilizationMode:'off', 
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
//let predictionLaebl = useSharedValue("None"); 

//const [frameH, setFrameHeight] = useState(0);
//const [frameW, setFrameWidth] = useState(0);
//const p = useSharedValue([]); 
useAnimatedReaction(()=>textLabelSharedValm.value, (curr, prev) =>{ //currently unused, can be deleted confidently, but is better if kept and ignored just in case for future errors or bugs, these can invoked as potential solutions instead 
 if(prev){
    //setTextLabel(prev); 
    
  }
 
});

const updateExternals = Worklets.createRunOnJS((v, moveWindowIsOpenVal, fH, fW) =>{ //unused for now, may becoime useful in future to combat bugs 
    if(v != textLabelSharedValm.value){ //was textLabel
       //  Speak(v); 
    }

  // setTextLabel(v);
    
   //speak the changed text: 
//setFrameHeight(fH); 
//setFrameWidth(fW);
});


useAnimatedReaction(() =>{'worklet'; return moveWindowIsOpen.value}, (curr, prev) =>{ //useAnimatedReactiob 'reacts' or set sof a 'reaction' to a value change in a variable declared with the hook useSharedValue(...) hook and not useState(...) hook. | When value of bthe variable changes, a function is triggered 
    'worklet'; //very important to include in functions if the function involves useSHaredValue(..) variables, setAnimatedReactiuons or if the function is called from inside the useFrameProcessor(...) hook 
    if(curr != prev){
        Worklets.createRunOnJS(() =>{
             set_moveWindowIsOpen(curr); 
        })
    }
}, [set_moveWindowIsOpen])
//Tts.addEventListener('tts-start', (event) => console.log("start", event));

//below is the SKiaFrameProcessor execution - no longerused 
/*
const frameProcessor_executableBody = (frame) =>{
    'worklet';
        try{ 
        if(frame.pixelFormat == "rgb"){
        
        //console.log("rgb: ", rgbObj.slice(0,1))

        
 
        let res = detectPlugin.call(frame);
        //res = JSON.parse(res); 
       //console.log(res[1][0]['right_shoulder_1_joint']);
       //console.log(res[0]);
      
      //console.log(rgbObj.slice(0,1))

      //console.log(res[2]); //console logs the 1 if frame count == 40 

   // console.log(textLabel);
   
    //if(res[0] == 39){
       
            //updateUIText(res[3]);
           // console.log("Anngles: ", res[2]);
            //console.log("Prediction array: ", res[4]);
   // }
  
    //console.log(res[3]); 

    //console.log(res[0]);
    if(res[4] != -1){
    console.log('Hot encioding raw prediction arr:', res[4]); 
    
    //console.log(res[2]); 
  
    updateExternals(res[3], res[1]); 
    console.log(res[3]); 
    //speak(res[3]); 
    }
 
     

//      runOnJS(update_predictionLaebl)(res[3][0]); 


      //if(res[2] ==1){
        //if true, the last valu e)index 3) of res will be non null and will have custom GRU model prediction
        //testAngle of rightElbow willalso be available when res[2] == true 

       // console.log(res[3]); 
      //}

      return res; 
      
    let exampleLog =  {"head_joint": {"conf": 0.611328125, "name": "head_joint", "x": 0.2837872803211212, 
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
 
 
    }else{
        //console.log("pixel form != rgb")
    }

    frame.render(); 
    }catch(e){
        console.log("Error inside 'customFrameProcessor' : ", e.message)
    }
}



const customFrameProcessor = useSkiaFrameProcessor((frame) =>{
   'worklet';
    //runAtTargetFps(10000000000000000000, () =>{
   // frame.translate(-10, -100);
    
     frame.render(); 
   // })
   

   let res = frameProcessor_executableBody(frame); 
   let w = frame.width; 
   let sizeW = 5;  
   let sizeH = 5;  
  
  try{
    //if(res[0]['right_shoulder_1_joint']['x'] != null || res[0]['right_shoulder_1_joint']['y'] != null){

    // right_shoulder_1_joint:
    let angles = res[2]; //arranged in grouped angles per type of angle [rightType_x_angle, leftType_x_angle]
  let paint = Skia.Paint()
  paint.setColor(Skia.Color('red'));
  let jointId;  
  let rect; 

  
   
  rect = Skia.XYWHRect( w* res[1][0]['right_upLeg_joint']['x'], frame.height*res[1][0]['right_upLeg_joint']['y'] , sizeW, sizeH)
  frame.drawRect(rect, paint);

  rect = Skia.XYWHRect( w* res[1][0]['right_forearm_joint']['x'], frame.height*res[1][0]['right_forearm_joint']['y'] , sizeW, sizeH)
  frame.drawRect(rect, paint);


   
  rect = Skia.XYWHRect( w* res[1][0]['left_leg_joint']['x'], frame.height*res[1][0]['left_leg_joint']['y'] , sizeW, sizeH)
  frame.drawRect(rect, paint);


 
  rect = Skia.XYWHRect( w* res[1][0]['left_hand_joint']['x'], frame.height*res[1][0]['left_hand_joint']['y'] , sizeW, sizeH)
  frame.drawRect(rect, paint);



 
  rect = Skia.XYWHRect( w* res[1][0]['left_ear_joint']['x'], frame.height*res[1][0]['left_ear_joint']['y'] , sizeW, sizeH)
  frame.drawRect(rect, paint);



 


   rect = Skia.XYWHRect( w* res[1][0]['left_forearm_joint']['x'], frame.height*res[1][0]['left_forearm_joint']['y'] , sizeW, sizeH)
  frame.drawRect(rect, paint);

   
  rect = Skia.XYWHRect( w* res[1][0]['right_leg_joint']['x'], frame.height*res[1][0]['right_leg_joint']['y'] , sizeW, sizeH)
  frame.drawRect(rect, paint);

    
  rect = Skia.XYWHRect( w* res[1][0]['right_foot_joint']['x'], frame.height*res[1][0]['right_foot_joint']['y'] , sizeW, sizeH)
  frame.drawRect(rect, paint);

    
  rect = Skia.XYWHRect( w* res[1][0]['right_shoulder_1_joint']['x'], frame.height*res[1][0]['right_shoulder_1_joint']['y'] , sizeW, sizeH)
  frame.drawRect(rect, paint); jointId = 0; 

  rect = Skia.XYWHRect( w* res[1][0]['left_upLeg_joint']['x'], frame.height*res[1][0]['left_upLeg_joint']['y'] , sizeW, sizeH)
  frame.drawRect(rect, paint);

   
  rect = Skia.XYWHRect( w* res[1][0]['left_foot_joint']['x'], frame.height*res[1][0]['left_foot_joint']['y'] , sizeW, sizeH)
  frame.drawRect(rect, paint);

   
  rect = Skia.XYWHRect( w* res[1][0]['root']['x'], frame.height*res[1][0]['root']['y'] , sizeW, sizeH)
  frame.drawRect(rect, paint);


   
  rect = Skia.XYWHRect( w* res[1][0]['right_hand_joint']['x'], frame.height*res[1][0]['right_hand_joint']['y'] , sizeW, sizeH)
  frame.drawRect(rect, paint);

  
  rect = Skia.XYWHRect( w* res[1][0]['left_eye_joint']['x'], frame.height*res[1][0]['left_eye_joint']['y'] , sizeW, sizeH)
  frame.drawRect(rect, paint);
       

 
  rect = Skia.XYWHRect( w* res[1][0]['head_joint']['x'], frame.height*res[1][0]['head_joint']['y'], sizeW, sizeH)
  frame.drawRect(rect, paint);

   
  rect = Skia.XYWHRect( w* res[1][0]['right_eye_joint']['x'], frame.height*res[1][0]['right_eye_joint']['y'] , sizeW, sizeH)
  frame.drawRect(rect, paint);

  rect = Skia.XYWHRect( w* res[1][0]['right_ear_joint']['x'], frame.height*res[1][0]['right_ear_joint']['y'] , sizeW, sizeH)
  frame.drawRect(rect, paint);


   jointId = 16; 
  rect = Skia.XYWHRect( w* res[1][0]['left_shoulder_1_joint']['x'], frame.height*res[1][0]['left_shoulder_1_joint']['y'] , sizeW, sizeH)
  frame.drawRect(rect, paint);
 

  //draw angles: 
  frame.drawTextBlob(angles[0][0],res[1][0]['left_forearm_joint']['x'], res[1][0]['left_forearm_joint']['y'],paint); 
 
   


   // }
  }catch{


  }


  
}, [textLabel, detectPlugin]);
/* */

const updatePoses = Worklets.createRunOnJS((p) =>{ //updates pose, called from within useFrameProcessor() hook function
    setPoses(p); 
});

const speakFeedback = Worklets.createRunOnJS((v, moveWIndowOpen_) =>{//invokes peaking mechanics
   if(!moveWIndowOpen_){
        //  TTS.speak(v); //speak the feedback
    }
});

//FLoat32 array buffer test:  START 
/*
const JOINT_NAMES = [
  "root", "left_upLeg_joint", "left_leg_joint", "left_foot_joint",
  "right_upLeg_joint", "right_leg_joint", "right_foot_joint",
  "neck_1_joint", "head_joint",
  "left_shoulder_1_joint", "left_forearm_joint", "left_hand_joint",
  "right_shoulder_1_joint", "right_forearm_joint", "right_hand_joint",
  "left_eye_joint", "right_eye_joint",
  "left_ear_joint", "right_ear_joint"
];
var poseBuffer = new Float32Array(JOINT_NAMES*2);
const updatePoseBuffer = (p) =>{
}
  */
//FLoat32 array buffer test:  END
 
const default_useFramePorcessor = useFrameProcessor((frame) =>{ //veyr important piece, it does exactly what it sname reflects: processes frames incoming from the <Camera/> tag and passes it onto the th enative side for evaluation and predictions 
    'worklet'; 
    let res = detectPlugin.call(frame, {userGotStrikedOut: userGotStrikedOut.value}); //detectPlugin.call, calls the native side function and passes {frame} as one argument, and userGotStrikedOut as another for native side processing 
    //console.log(res[0]); 
    //console.log(res[3]); xx
   
    updatePoses(res[1]); //updates poses
    //console.log(res[1]);
    
   // console.log("MoveWIndowIsOpen: ", moveWindowIsOpen.value)
   // console.log("UseGotStrikedOut: ", userGotStrikedOut.value)
   //console.log("Angles: ", res[2]); 
  // updateLatestPoseRef(res[1][0])
    //latestPoseRef.current = res[1][0]; 
    
    if((res[4])>0 && res[4] %2 != 0){ //since all incorrect representing labels are at uneven indecies in the labelArray hot-encoding prediction output array
       //  incrimentUserStrikes(); 
       incrimentUserStrikes();
       //console.log("ConfIdx: ", res[4]%2)

      // console.log(strikes.value)
       
    }else{
      userCorrectMoves.value++; //incirment user correct moves isince the condition above was false
    };

    //speakFeedback(res[3], res[5]); 
   if(!res[5] && res[4] > 0){ // {res[5]} represents moveWindowIsOpen from the native side | {res[4]} represents the greatets confidenc eindex of the ML model prediction array output passed from the native side 
    console.log(`Count ${res[0]}: ${res[3]}`) 
   }

 
    if(!userGotStrikedOut.value){
        if(moveWindowIsOpen.value && res[4] ){ //was if res[3] == 0
       // updateExternals(res[3], res[5], frame.height, frame.width); 
     
          textLabelSharedValm.value = res[3]; 
          //console.log(res[3]); 

        //console.log(res[1]); 
        }
        //if res[5] == true:
        moveWindowIsOpen.value = res[5]; 
     
    }
     

}, [userGotStrikedOut.value]);

const flipIcon = (           
    <TouchableOpacity style = {{position:"absolute", top: 125, left: 22}} onPress={() => setCamFlip(!camFlip)}>
<Icon size={27} name="cameraswitch" backgroundColor={"transparent"} color={"white"} style={{}}/>
    </TouchableOpacity>     
);



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
          gl_Position = vec4(position, 0.0, 1.0);
          gl_PointSize = 20.0; 
        }
        `;

  //below is a second code string in the openGL language (C++) which sets the color for the pooints
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
const jabFrameIdx = useSharedValue(0);  //although the name specififes jab, its used as a general index tracker for the animations to be displayed on the FeedbackScreen
const onContextCreate2 = async (gl) => { // the function responsible of carrying out the steup and execution of openGL drawing on screen
  // gl?.cancelFeedbackLoop?.();
   
if (!shaderProgramRef.current) {
    shaderProgramRef.current = createShaderProgram(gl, vertexShaderSource, fragmentShaderSource);
  }

  let target_animation = StraightRightAnimation; 
  const renderLoop = () => {
      gl.clear(gl.COLOR_BUFFER_BIT);

    if (latestPoseRef.current) {
             
      if(userGotStrikedOut.value){

      drawSkeleton(gl, target_animation[jabFrameIdx.value], shaderProgramRef.current);
      jabFrameIdx.value++;

     if(jabFrameIdx.value > target_animation.length-1){
      jabFrameIdx.value = 0; 
     }
         // console.log(jabFrameIdx.value)
    }else{
   drawSkeleton(gl, latestPoseRef.current, shaderProgramRef.current);
    }
    
    }

  
    gl.endFrameEXP();
    requestAnimationFrame(renderLoop);

  };

  renderLoop();
};


const onContextCreate_feedbackScreen = async (gl) => { //not neeeded anymore

   if (!jabFrames || jabFrames.length === 0) {
    console.warn("jabFrames not loaded yet.");
    return;
  }

if (!shaderProgramRef.current) {
    shaderProgramRef.current = createShaderProgram(gl, vertexShaderSource, fragmentShaderSource);
  }
 const program = shaderProgramRef.current;
  let animationFrame_id;

  gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
  gl.clearColor(0, 0, 0, 0); // optional if you want transparent background


  const renderLoop = () => {

    gl.clear(gl.COLOR_BUFFER_BIT);
  drawSkeleton(gl, jabAnimationFrames[jabFrameIdx.value], program);
      jabFrameIdx.value =(jabFrameIdx.value + 1) % jabAnimationFrames.length;
    gl.endFrameEXP();
    animationFrame_id = requestAnimationFrame(renderLoop);
  };

  renderLoop();
  gl.cancelAnimationLoop = () => cancelAnimationFrame(animationFrame_id) 
};



useEffect(() => { //updates the latestPoseRef, very important
  if (poses?.[0]){ 
      latestPoseRef.current = poses[0];
  }

}, [poses]); //passing in this as last argument just specifies upon what should the function executed inside the useEffect hook shoul depend on / purpose based on some data(in this case, poses variable)



//below is the old pose detection overlay joint points drawing
  /*

const draw = async (gl) => {
    const renderJoints = (points) => {//renderJoints: START
      const program = gl.createProgram();
      const compileShader = (type, source) => {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        return shader;
      };

      const vertexShader = compileShader(gl.VERTEX_SHADER, vertexShaderSource);
      const fragmentShader = compileShader(gl.FRAGMENT_SHADER, fragmentShaderSource);
      gl.attachShader(program, vertexShader);
      gl.attachShader(program, fragmentShader);
      gl.linkProgram(program);
      gl.useProgram(program);


      const positionAttrib = gl.getAttribLocation(program, 'position');
      const buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(points), gl.DYNAMIC_DRAW); //was gl.STATIC_DRAW
      gl.enableVertexAttribArray(positionAttrib);
      gl.vertexAttribPointer(positionAttrib, 2, gl.FLOAT, false, 0, 0);
      gl.drawArrays(gl.POINTS, 0, points.length /2);

    };//renderJoints: END

    gl.clearColor(0, 0, 0, 0); // transparent
    gl.clear(gl.COLOR_BUFFER_BIT);

    if (poses.length > 0) {
      const joints = poses[0]; // just the first person detected
      const points = Object.keys(joints).map((key) => {

        try{
            //filter pose joints/cordinates of interest
        const y= (
            camFlip? 1-joints[key].x
            :
            1-joints[key].x
        ) * 2.005 - 1; // normalize from [0,1] to [-1,1]

        const x = (
            camFlip? 1-joints[key].y
            :
            joints[key].y
        ) * 2.5 - 1; // invert + normalize
        
        return [x-0.27, y+.01];  //normalizing findal data output

        }catch{

        }

      }).flat(1);

      renderJoints(points);
      
    }
    gl.endFrameEXP();
  };

const onContextCreate = async (gl) => {
    glRef.current = gl;
    
    draw(gl);
  };
  useEffect(() => {
    if (glRef.current) draw(glRef.current);
    //if (glRef.current) drawSkeleton(glRef.current);

  }, [poses]);
  */


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
  const NextButton = ({onPress}) =>{
    return(
        <TouchableOpacity style = {{position:"absolute", right: ScreenWidth/2.62, bottom: 100, borderRadius: 100, }}>
            <Icon onTouchStart={onPress} style={{flex: 1}} fill = "black" size = {90} name = "play-circle" color={"black"} backgroundColor={"transparent"}/>
        </TouchableOpacity>
    )
  }

  const skipFeedback_opacity = useRef(new Animated.Value(0)).current;

const FeedbackInteruptionScreen = (
    
        <View onTouchStart={resetUserState} style = {{flex: 1, position:"absolute", height: ScreenHeight, width:ScreenWidth, backgroundColor:"transparent"}}>

            <View>{/*animation skeleton for correction*/}</View>
         
            <Animated.Text style = {{position:"absolute", bottom: 50, color:"black", left: ScreenWidth/5.25, opacity: skipFeedback_opacity}}>Tap anywhere on screen to skip</Animated.Text>

        </View>
    );


const [see, setSee] = useState(false);
  const go_opacity = useRef(new Animated.Value(0)).current;
 useEffect(() => {
    if (moveWindowIsOpen.value && !userGotStrikedOut.value) {
      setSee(true);
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
  useEffect(() =>{
  if(userGotStrikedOut.value){
    skipFeedback_opacity.setValue(0); 
    loopAnimation.start();

    //TTS.speak(textLabel); 
  }else{
    loopAnimation.stop();
    skipFeedback_opacity.setValue(0);
  }



 
  },[userGotStrikedOut.value])



  const Rest1 = (
<>

  <View style ={[styles.row, {columnGap: 10, position:"absolute", top: 150, backgroundColor:"transparent", alignItems:"center", justifyContent:"center", width:ScreenWidth, }]}>
      <Animated.Text style = {{ color: userGotStrikedOut.value? 'black' : 'white',  fontSize: 50}}>{minutes}</Animated.Text>
      <Animated.Text style ={{color:"red", fontSize: 50, top: -7}}>:</Animated.Text>
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

            {
                countDown.value <= 0?
           <>
          <TouchableOpacity onPress={() => nav.replace("AI_Cam")} style = {{paddingHorizontal: 25, paddingVertical: 5,  alignItems:"center", justifyContent:"center", position:"absolute", bottom: 150, right: ScreenWidth/4.15, backgroundColor:"white", borderRadius: 100, width: ScreenWidth/2}}>
          <Animated.Text style = {{color:"black", fontSize: 25}}>Restart?</Animated.Text>
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

  {
    (see)?
    <Animated.Text style = {{display: userGotStrikedOut? 'flex' : 'none', position:"absolute", color: "white", fontWeight: "bold", bottom: ScreenHeight/2.3, right: ScreenWidth/4.7, fontSize: 90, opacity: go_opacity}}>GO!</Animated.Text>
    :
    <Animated.Text style = {{display: userGotStrikedOut? 'flex' : 'none', position:"absolute", color: "white", fontWeight: "bold", bottom: ScreenHeight/2.3, right: ScreenWidth/5, fontSize: 90, opacity: go_opacity}}>PAUSE!</Animated.Text>

  }

   {Rest1}




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