import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import {Text, Animated, View, ActivityIndicator, StyleSheet, Dimensions, Platform, TouchableOpacity, Button, NativeEventEmitter, NativeModules, Easing, Touchable,  } from 'react-native';
import { VStack} from "swiftui-react-native"; 
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
import StraightRightAnimation from "../assets/straightRightAnimation1.json"; 
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

import { Sheet, Spinner } from 'tamagui';
import ActionSheet, { registerSheet, SheetManager, SheetProvider} from 'react-native-actions-sheet';
import LessonSummarry from './LessonSummarry';
import Logo2SVG from '../assets/logo2_SVG';




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

export default function AICam({theme}){ //main function of the page 'AI_Cam' 
 
  //activity indicator for when crucial screen comonents are loading:
  const LoadingActivity = (
      <View style = {{position:"absolute", alignItems:"center", justifyContent:"center", zIndex: 100, backgroundColor:"white", height:Dimensions.get('screen').height, width: Dimensions.get("screen").width}}>
              <Spinner color = "black"/>
      </View>
  );

  const nav = useNavigation(); 
   // const {userStrikes, incrimentUserStrikes, resetUserStrikes, userStrikedOut} = useUserState(); 
   const strikes = useSharedValue(0);
   const userGotStrikedOut = useSharedValue(false);
   const userCorrectMoves = useSharedValue(0);
   const tempFrameCounter = useSharedValue(0); 
   const max_GRU_idx = useSharedValue(-1); 
   const totalMovements = useSharedValue(-1); 


    const resetUserState = () =>{ //resets the stats of the user (ie number of strikes, and sets the booolean of userGotStrikedOut to false)
        strikes.value = 0; 
        userGotStrikedOut.value = false; 
        poseHistriy.current = []; 
        //console.log('user stats resetted');
        //reset pose history: 
    
      // console.log("pose histriy: ", poseHistriy.current.length); 
      TTS.stopConverse()

    }

    const incrimentUserStrikes_alt = () =>{ //also responsible for incirmenting the variable userIncorrectMoves | as seen at the end of the function name "alt", its an alternative to the first incrimentUserStrikes function as a replacement or alternative

       let val = strikes.value + 1; 
        if (val >=3){
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
        if (val >=3){ //extra to 4, not 3 for padding space
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
    fps: 30, 
    videoStabilizationMode:'off', 
    //photoAspectRatio: 1/2,
    //videoAspectRatio: 1/2,
    videoResolution: {height: ScreenHeight, width:ScreenWidth},
    videoAspectRatio:ScreenWidth/ScreenHeight
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
const speak = (txt) => TTS.speak(txt);
const synced_text_to_speech_runOnJS = (txt) => TTS.synced_text_to_speech(txt); //prompts gpt and plays only once, no converse 

//invokes continous conversation with AI, agentic-like conversation 
const triggerConverse = () => TTS.converse(`Additional instructions/preprompt: The user just executed an incorrect movement, here is the statement describing the evaluation of the movement: ${textLabelSharedValm.value}`)
                     .then(r =>{
                     //console.log(r); 
                     // console.log("Conversed"); 
                       
                      }).catch(e =>{
                    // console.log(e)
                      // console.log("Spoken"); 
                      TTS.stopConverse();
                      });

useAnimatedReaction(()=>{return {dep1: textLabelSharedValm.value, dep2: userGotStrikedOut.value, dep3: moveWindowIsOpen.value}}, (curr, prev) =>{ //currently unused, can be deleted confidently, but is better if kept and ignored just in case for future errors or bugs, these can invoked as potential solutions instead 

  //trigger once ai feed back for per user movement evaluation during lesson, while user has not beedn striked out 
  if(!curr.dep3){
      if(curr.dep1 != '-' && !curr.dep2 && (curr.dep1 == prev.dep1 || curr.dep1 != prev.dep1) ){
      //runOnJS(speak)(curr);
      runOnJS(synced_text_to_speech_runOnJS)(`User just executed an incorrect movement, return a coach statement taht is under 3 seconds long that gives them feedback based on the statement '${textLabelSharedValm.value}' which describes their mistake`);
    }
  } 
  
 
  //Agentic AI conversation trigger when user gets striekd out 
    if(curr.dep2){
      //control oscilator for animation play

      //Agentic AI converse native function implementation 
     //   console.log('agentic ai');
        //runOnJS(synced_text_to_speech_runOnJS)(`User just executed an incorrect movement, return a coach statement taht is under 3 seconds long that gives them feedback based on the statement '${textLabelSharedValm.value}' which describes their mistake`);
       runOnJS(triggerConverse)()
    }else{
 
    }
    totalMovements.value++; 
   // console.log("Total moves: ", totalMovements.value)
    //console.log("Correct moves: ", userCorrectMoves.value)

}, [textLabelSharedValm.value, userGotStrikedOut.value, moveWindowIsOpen.value]);


useAnimatedReaction(() =>{'worklet'; return moveWindowIsOpen.value}, (curr, prev) =>{ //useAnimatedReactiob 'reacts' or set sof a 'reaction' to a value change in a variable declared with the hook useSharedValue(...) hook and not useState(...) hook. | When value of bthe variable changes, a function is triggered 
    'worklet'; //very important to include in functions if the function involves useSHaredValue(..) variables, setAnimatedReactiuons or if the function is called from inside the useFrameProcessor(...) hook 
    if(curr != prev){
        Worklets.createRunOnJS(() =>{
             set_moveWindowIsOpen(curr); 
        })
    }
}, [set_moveWindowIsOpen])

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

 
    //console.log(poseHistriy); 
    
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
 

/*

Pose:  [{"head_joint": {"conf": 0.8154296875, "name": "head_joint", "x": 0.2755799889564514, "y": 0.8650012016296387}, "left_ear_joint": {"conf": 0.7626953125, "name": "left_ear_joint", "x": 0.27416253089904785, "y": 0.772429883480072}, "left_eye_joint": {"conf": 0.83935546875, "name": "left_eye_joint", "x": 0.25808513164520264, "y": 0.8358705043792725}, "left_foot_joint": {"conf": 0.2548828125, "name": "left_foot_joint", "x": 0.916772723197937, "y": 0.7006985545158386}, "left_forearm_joint": {"conf": 0.75927734375, "name": "left_forearm_joint", "x": 0.47521519660949707, "y": 0.6458866596221924}, "left_hand_joint": {"conf": 0.7451171875, "name": "left_hand_joint", "x": 0.585648238658905, "y": 0.7250705361366272}, "left_leg_joint": {"conf": 0.345458984375, "name": "left_leg_joint", "x": 0.7474462389945984, "y": 0.8088974356651306}, "left_shoulder_1_joint": {"conf": 0.740234375, "name": "left_shoulder_1_joint", "x": 0.3587661385536194, "y": 0.6952054500579834}, "left_upLeg_joint": {"conf": 0.3740234375, "name": "left_upLeg_joint", "x": 0.6154303550720215, "y": 0.7841629981994629}, "neck_1_joint": {"conf": 0.658203125, "name": "neck_1_joint", "x": 0.36932146549224854, "y": 0.8048836886882782}, "right_ear_joint": {"conf": 0.298583984375, "name": "right_ear_joint", "x": 0.27111393213272095, "y": 0.9224628806114197}, "right_eye_joint": {"conf": 0.751953125, "name": "right_eye_joint", "x": 0.2619226276874542, "y": 0.8966839909553528}, "right_foot_joint": {"conf": 0.177490234375, "name": "right_foot_joint", "x": 0.9470490217208862, "y": 0.9034504890441895}, "right_forearm_joint": {"conf": 0.196533203125, "name": "right_forearm_joint", "x": 0.4512541890144348, "y": 0.955840528011322}, "right_leg_joint": {"conf": 0.173828125, "name": "right_leg_joint", "x": 0.7485769987106323, "y": 0.8617675304412842}, "right_shoulder_1_joint": {"conf": 0.576171875, "name": "right_shoulder_1_joint", "x": 0.3798767924308777, "y": 0.914561927318573}, "right_upLeg_joint": {"conf": 0.35009765625, "name": "right_upLeg_joint", "x": 0.5963930487632751, "y": 0.9102357029914856}, "root": {"conf": 0.362060546875, "name": "root", "x": 0.6059117019176483, "y": 0.8471993505954742}}]

*/


const default_useFramePorcessor = useFrameProcessor((frame) =>{ //veyr important piece, it does exactly what it sname reflects: processes frames incoming from the <Camera/> tag and passes it onto the th enative side for evaluation and predictions 
    'worklet'; 

    //let res2 = mediapipePose_swiftPlugin.call(frame); 
    //console.log(res2); 

    if(detectPlugin == null){
      console.log("null value for plugin ")
    }else{
    
    let res = detectPlugin.call(frame, {userGotStrikedOut: userGotStrikedOut.value}); //detectPlugin.call, calls the native side function and passes {frame} as one argument, and userGotStrikedOut as another for native side processing 
  
    //print set_100: 
    try{
      console.log("Length ", res[7].length, res[7]);
    }catch{
      
    }

    max_GRU_idx.value = res[4] > 0 ? res[4] : max_GRU_idx.value; 
  //  console.log(max_GRU_idx.value, res[4]); 

    updatePoses(res[1]); //updates poses


     if(res[2].length > 0 && res[6] != "Wait for break to be over, punchClass"){
      textLabelSharedValm.value = res[6]; 
      
     if(res[4] % 2 != 0){
      incrimentUserStrikes();
     }else{
      userCorrectMoves.value++; 
     };
    // console.log(strikes.value)
     }


    if(!userGotStrikedOut.value){
      if(res[5] && res[6] != textLabelSharedValm.value && res[6] != "Wait for break to be over, punchClass" && res[6] != -1){ //was if res[3] == 0
       // updateExternals(res[3], res[5], frame.height, frame.width); 
     
          //textLabelSharedValm.value = res[6]; 
       //    console.log(res[3]); 

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
const limb_color_map = useSharedValue({
  0:[0.0, 0.0, 1.0, 1.0],
  1:[0.0, 1.0, 1.0, 1.0],
  2:[1.0, 0.0, 0.0, 1.0],
  3:[0.0, 1.0, 0.0, 1.0],
  4:[0.0, 0.0, 1.0, 1.0],
  5:[0.0, 1.0, 0.0, 1.0],
  6:[1.0, 0.0, 0.0, 1.0],
  7:[1.0, 0.0, 0.0, 1.0],
  8:[1.0, 0.0, 0.0, 1.0],
  9:[1.0, 0.0, 0.0, 1.0],
  10:[1.0, 0.0, 0.0, 1.0],
  11:[1.0, 0.0, 0.0, 1.0],
  12:[1.0, 0.0, 0.0, 1.0],
  13:[1.0, 0.0, 0.0, 1.0],
  14:[0.0, 1.0, 0.0, 1.0],
  15:[1.0, 0.0, 0.0, 1.0],
  16:[1.0, 1.0, 0.0, 1.0],
  17:[1.0, 0.0, 0.0, 1.0],
})
//limb_color_based_on_gru_max_idx system design: 
// total of 8 indecies in GRU prediciton label hot-encoding 
//gru_output_idx=1 -> SKELETON_CONNECTIONS[9 & 10 ]=red
//gru_output_idx=1 -> SKELETON_CONNECTIONS[9 & 10 ]=red

const gru_output_limb_color_map = {
  1:{
    target_SKELETON_CONNECTIONS: [2, 3, 4, 5],
    color:[1.0, 0.0, 0.0, 1.0]
  },
    3:{
    target_SKELETON_CONNECTIONS: [0,1],
    color:[1.0, 0.0, 0.0, 1.0]
  },

   5:{
    target_SKELETON_CONNECTIONS: [2,3, 4, 5, 9,10, 12, 13],
    color:[1.0, 0.0, 0.0, 1.0]
  },
   7:{
    target_SKELETON_CONNECTIONS: [6, 9, 10, 12, 13],
    color:[1.0, 0.0, 0.0, 1.0]
  },


}
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
const skeleton_color = useSharedValue('vec4(0.0, 1.0, 0.0, 1.0)');
      // const unifrom_color_space = gl.getUniformLocation(shaderProgramRef.current, "color_space");
  // gl.uniform4fv(unifrom_color_space, [0.0, 0.0, 1.0, 1.0]); 


const drawSkeleton = useCallback((gl, joints, shaderProgram,colorUnformLoc) => {//drawSkeleton : START


  //create uniform color space: 

  SKELETON_CONNECTIONS.forEach(([start, end], idx) => {
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
    
    if(max_GRU_idx.value % 2 >= 1){ //max_GRU_idx.value % 2 >= 1){
      let idx_in_gru_color_map = gru_output_limb_color_map[max_GRU_idx.value].target_SKELETON_CONNECTIONS.includes(idx);
      gl.uniform4fv(colorUnformLoc, idx_in_gru_color_map? new Float32Array([1.0, 0.0, 0.0, 1.0] ) : new Float32Array([0.0, 1.0, 0.0, 1.0]));
    } else{
        gl.uniform4fv(colorUnformLoc, [0.0, 1.0, 0.0, 1.0]);

    }
    /*
    if(userGotStrikedOut.value){
      gl.uniform4fv(colorUnformLoc, new Float32Array(limb_color_map.value[idx]));
    }
      */

    gl.drawArrays(gl.LINES, 0, 2);
    gl.deleteBuffer(buffer);



    //drawing circlel articulations/joints: /////////////////
    const joints_vertecies = new Float32Array([x2, y2]);
    const joints_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, joints_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, joints_vertecies, gl.STATIC_DRAW);

    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    gl.uniform4fv(colorUnformLoc, [1.0, 1.0, 1.0, 1.0]);
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
const jabFrameIdx = useSharedValue(0); //although the name specififes jab, its used as a general index tracker for the animations to be displayed on the FeedbackScreen

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

  let target_animation = poseHistriy.current; 

  const renderLoop = () => {
      gl.clear(gl.COLOR_BUFFER_BIT);

  
    if (latestPoseRef.current) {
             
      if(userGotStrikedOut.value && poseHistriy.current.length > 0){
      //drawSkeleton(gl, StraightRightAnimation[jabFrameIdx.value], shaderProgramRef.current, colorUniformLocation);
     //skeleton_color.value = [0.1, 0.0, 0.0, 1.0]; 

 
    drawSkeleton(gl, target_animation[jabFrameIdx.value], shaderProgramRef.current, colorUniformLocation); 
      
      jabFrameIdx.value++;

     if(jabFrameIdx.value > target_animation.length-1){ //|| jabFrameIdx.value > StraightRightAnimation.length-1){
      jabFrameIdx.value = 0; 
     }
  
    
         // console.log(jabFrameIdx.value)
         

    }else{
      
   drawSkeleton(gl, latestPoseRef.current[0], shaderProgramRef.current, colorUniformLocation);
    }
    
    }

  
    gl.endFrameEXP();
    requestAnimationFrame(renderLoop);

  };

  //if(poseHistriy.length > 0){
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


//const step = useSharedValue(1); 
const array_multiplier_speed_emulator_variable = 10; 
useEffect(() => { //updates the latestPoseRef, very important
  if (poses?.[0]){ 
      latestPoseRef.current = poses;
      if(strikes.value == 2){
      if(moveWindowIsOpen.value){
        
      poseHistriy.current[poseHistriy.current.length] = Array(array_multiplier_speed_emulator_variable).fill(poses[0])[0];//Array.from(poses[0],poses[0], poses[0], poses[0], poses[0], poses[0], poses[0], poses[0], poses[0], poses[0])[0];
      

      }
      }
 
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

const skipFeedback_opacity = useRef(new Animated.Value(0)).current;
const is_conversation_loop = useSharedValue(false); 

const [showFeedChat, setShowFeedChat] = useState(false); 


const FeedbackInteruptionScreen = (
 <>
        <SheetProvider>
        <View onTouchStart={resetUserState} style = {{ position:"absolute", height: ScreenHeight, width:ScreenWidth, backgroundColor:"transparent"}}>

            <View>{/*animation skeleton for correction*/}</View>         
            <Animated.Text style = {{position:"absolute", bottom: 50, color:"black", left: ScreenWidth/5.25, opacity: skipFeedback_opacity}}>Tap anywhere on screen to skip</Animated.Text>

        </View>
      </SheetProvider>


            <TouchableOpacity onPress={() => {
               SheetManager.show("ChatSheet")
             // alert("Test")
              /*
            SheetManager.show("Lesson", {
            payload:{
            freeStyle: true,
            title:"FreeStyle",
             img:TestImg,
            difficulty: "Advanced",
            description:"Execute any movement at your heart's desire as FiTech evaluates your executions!"
        }
       }) 
        */

              //setShowFeedChat(!showFeedChat);
            /*
                    TTS.converse(`Additional instructions/preprompt: The user just executed an incorrect movement, here is the statement describing the evaluation of the movement: ${textLabelSharedValm.value}`)
                     .then(r =>{
                     console.log(r); 
                      console.log("Conversed"); 
                    
                      }).catch(e =>{
                     console.log(e)
                       console.log("Spoken"); 
                      TTS.stopConverse();
                      })
                      p*/
              }} style = {{backgroundColor:"black", top: 59, alignSelf:'center', borderRadius: 100, padding: 10, alignItems:"center", flexDirection:"row", columnGap:0, justifyContent:"center", }}>
              <Image source = {TransparentLogo} style = {{height: 40, width: 40}} />
                </TouchableOpacity>
        
        </>
      );


const [see, setSee] = useState(false);
  const go_opacity = useRef(new Animated.Value(0)).current;

  //curious if optimization can be done here (below): 
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

  <View style ={[styles.row, {columnGap: 10, position:"absolute", top: 150, backgroundColor:"transparent", alignItems:"center", justifyContent:"center", width:ScreenWidth, }]}>
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


    return(
 
           <View style = {{
            flex: 1,
            backgroundColor: "transparent",
           }} >
            <StatusBar barStyle="light-content" backgroundColor="#000" />
               <Camera
          
           isMirrored = {true}
           shouldRasterizeIOS = {false}
         //   enableBufferCompression = {true}
         enableFpsGraph = {false}
       
         isActive = {true}
         device={device}
         format={customFormat}
         pixelFormat={"rgb"}
        
         frameProcessor={default_useFramePorcessor}
     //   videoBitRate={"extra-low"}
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

  {
    (see)?
    <Animated.Text style = {{display: "flex", position:"absolute", color: "white", fontWeight: "bold", bottom: ScreenHeight/2.3, right: ScreenWidth/4.7, fontSize: 90, opacity: go_opacity}}>GO!</Animated.Text>
    :
    <Animated.Text style = {{display: "flex", position:"absolute", color: "white", fontWeight: "bold", bottom: ScreenHeight/2.3, right: ScreenWidth/5, fontSize: 90, opacity: go_opacity}}>PAUSE!</Animated.Text>

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