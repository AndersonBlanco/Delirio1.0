import {useState, useEffect, useCallback, useRef} from "react";
import {
    View,
    StyleSheet,
    Dimensions,
     Text,
     TextInput,
     TouchableOpacity,
     KeyboardAvoidingView,
     Platform
} from "react-native";
import { GiftedChatContext, GiftedAvatar, GiftedChat, InputToolbar, Avatar, utils, DEFAULT_PLACEHOLDER, Bubble} from "react-native-gifted-chat";
import Logo from "../assets/fiTech_logo.png";
import { Icon } from "react-native-elements";
import { useSharedValue } from "react-native-worklets-core";
import { OpenAI } from "openai/client.js";
import RandomProfile from "../assets/profile2.png"; 
 
import axios from "axios";
import { Sound } from "expo-av/build/Audio";
 import { Audio } from "expo-av";
 import * as FileSystem from "expo-file-system";
import { NativeModules } from "react-native";
import { Realtime } from "openai/resources/beta/realtime/realtime.js";
 import LiveAudioStream from "react-native-live-audio-stream";
import * as Permissions from "expo-permissions"

const {TTS} = NativeModules; 
//import { ElevenLabs, ElevenLabsClient, play } from "@elevenlabs/elevenlabs-js";
//import SideNav from "../components/sideNav";

//gluetsack-ui for dynamic alert chat prmopt pop ups offer after button click 
//react-native-reusable (rnr) - for <Avatar> consistent UI |  for aletr Aialog for animated prompt for text duirn gfeedback screen or others | for Accordian feature - collapseable and expandable list of items (vertical but maybe horizontal too) 
//Tamagui 
//react native windUI
//react native ui kitten - for Date Picker and for spinner loading icon maybe 

//open-ai api-key: 
const openAI = new OpenAI({
  apiKey: "",
    dangerouslyAllowBrowser: true
});
 

const requestMicPermissions =()=>{
  /*
 const {status} = Permissions.askAsync(Permissions.AUDIO_RECORDING);
 if(status == Permissions.PermissionStatus.GRANTED){
  
 }
 */

}

export const initializeRealTimeSession = ()=>{
  /*
  let realtime = new Realtime();
  realtime.sessions.create({
    model:"gpt-4o-mini-realtime-preview",
    instructions:"You are an expert boxing coach",
    voice:"ash",
    output_audio_format:"pcm16",
    inout
  })
  .then((res) =>{
res.out
  })
*/

}

//const {TTS} = NativeModules; 
export const generateVoice_jsthread = async (txt) =>{

  //   await eleven_client.textToSpeech.convert()
  try{
   //oipenai fetch
   
    let s = await openAI.audio.speech.create({
        input: txt,
        model:"tts-1",
        voice:"ash",

   });  
   
   const arrayBuffer = await s.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // base64 conversion 
    let binaryStr = '';
    for (let i = 0; i < uint8Array.length; i++) {
      binaryStr += String.fromCharCode(uint8Array[i]);
    }
    const base64Audio = btoa(binaryStr);

    //save sound file
    const fileUri = FileSystem.documentDirectory + 'speech.mp3';
    await FileSystem.writeAsStringAsync(fileUri, base64Audio, {
      encoding: FileSystem.EncodingType.Base64,
    });


    const { sound } = await Audio.Sound.createAsync({ uri: fileUri });
    await sound.playAsync();

   }catch(e){
    //TTS.speak(e.message); 
    alert('Error in generating voice')
    console.log('Error in generating voice', e.message)
   }
   }

export const promptGPT_native =async() =>{
         await TTS.promptGPT("WHats up")
         .then((res) =>{
          // console.log(res); 
         // gpt_text_response.value = res; 
           return res; 
         }) 
         .catch(err =>{
          // gpt_text_response.value = err; 
           return err; 
         })
       };
export const promptGPT =  (txt) =>{
     let response = openAI.responses.create({
      stream: false,
      instructions:"You are an expert, yet humble an dgoal driven boxing coach. You answer the user with short but sweet and efficient responses that answers the most crucial conerns, questions or worries of the user. Knowing this, your answers are based on the sweet science of boxing, and backed up by contemporary, proven and trustworhty nutrition, fitness and also empirical knowledge for any knowldge buckets you access. For referencnce, knowdge buckets are basically knowldge types that you access, like fitness, nutrition, strenght and conditioning or boxing knowldge. Final remarks: do not sugar code, and do not add uneceesarry dialogue or conversation insentivizing characters/content in your responses, answer straightforward but as effectively as possible",
      input: txt,
      model:"gpt-4o"
    })

    return response
};
export const generateVoice_jsthread_and_prompt_gpt_synced = async (txt) =>{

  //   await eleven_client.textToSpeech.convert()
  try{
   //oipenai fetch
   
    let s = await openAI.audio.speech.create({
        input: txt,
        model:"tts-1",
        voice:"ash"
   });  
   
   const arrayBuffer = await s.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // base64 conversion 
    let binaryStr = '';
    for (let i = 0; i < uint8Array.length; i++) {
      binaryStr += String.fromCharCode(uint8Array[i]);
    }
    const base64Audio = btoa(binaryStr);

    //save sound file
    const fileUri = FileSystem.documentDirectory + 'speech.mp3';
    await FileSystem.writeAsStringAsync(fileUri, base64Audio, {
      encoding: FileSystem.EncodingType.Base64,
    });


    const { sound } = await Audio.Sound.createAsync({ uri: fileUri });
    await sound.playAsync();

   }catch(e){
    //TTS.speak(e.message); 
    alert('Error in generating voice')
    console.log('Error in generating voice', e.message)
   }
   }
export function ChatEnvironment({ 
  color = "white",
  textInputBackground = "rgba(0, 0, 0, .3)",

  placeholderTextColor="rgba(256, 256, 256, 0.5)", viewStyle, isKeyboardInternallyHandled}){
  

 const [msg, setMsg] = useState("");
const create_gpt_resposne = async(txt) =>{
    if(msg == txt){
       // return null; 
    }

    try{
    let response = await promptGPT(txt); 


    //console.log(response.output_text); 

    //adding message to ongoing visual chat 
    //let msg = createMsg(response.output_text,'fitech', 2, messages.length + 1);   
    // generateVoice_jsthread(response.output_text);
    addMessageToChat(response.output_text,'fitech', 2, Logo); 
   // generateVoice_jsthread(response.output_text); 


}catch(e){
    console.log(e.message);
    addMessageToChat("Error in gpt api",'fitech', 2, Logo); 

}
};


const [messages, setMessages] = useState([
    {
        _id: 1,
        text: 'Hello developer',
        createdAt: new Date(),  
        user: {
          _id: 2,
          name: 'chatbot',
          avatar: Logo,
        },
        renderAvatarOnTop: true
      },
]);

//user._id = 2 -> chatBopt response, user._id = 1 -> user response
const createMsg = (txtMsg, nameOfUser, responder, id, avatarImg) =>{
    return{
        _id: id,
        text: txtMsg,
        createdAt: new Date(),
        user: {
          _id: responder,
          name: nameOfUser,
          avatar: avatarImg,
        },
        isReanimated: true,
        system: false,
        renderAvatarOnTop: true

      }
    
}

const addMessageToChat = (txt, username, responder_id, avatarImg) =>{
    setMessages(latestVal => [createMsg(txt,username, responder_id, latestVal.length + 1, avatarImg),...latestVal]);
}

/*
  useEffect(() => {
    //handle adding user reesponder to messages array:
   GiftedChat.append(messages); 
      
  }, [])
*/

  
  const onSend = useCallback((messages = []) => {
   setMessages(previousMessages =>
      GiftedChat.append(previousMessages, messages),
    );

  }, [])

 
  /* removed component: 
       <TouchableOpacity onPress={() =>{
                    let _msg = createMsg(msg, 'user', 1);
                    addMessageToChat(_msg)
                    create_gpt_resposne(msg); 

                }}>
                <Icon size={25} name = "send" color="rgba(256, 256, 256, .75)" 
                containerStyle ={{
                    backgroundColor:"rgba(256, 256, 256, .35)",
                    borderRadius: 100,
                    padding: 5,

                }}/>
                </TouchableOpacity>
        */

return(    
      <View style = {viewStyle}>
        <GiftedChat
        renderAvatarOnTop
        
        isKeyboardInternallyHandled={isKeyboardInternallyHandled}
        scrollToBottomStyle = {{
             
        }}
        renderInputToolbar={() =>{
            return(
                
                <View style = {{display:"flex", flexDirection:"row", alignItems:"center", justifyContent:"center", columnGap: 10}}>
                <TextInput 
                onChangeText={v => setMsg(v)}
                value= {msg}
                clearTextOnFocus
                clearButtonMode="always"
               
                onSubmitEditing={(event) =>{
                    addMessageToChat(event.nativeEvent.text, 'user', 1, RandomProfile)
                    create_gpt_resposne(event.nativeEvent.text); 
                    setMsg(""); 
                 //   console.log(messages)

                }}
                placeholderTextColor = {placeholderTextColor}
                placeholder = "whats on your mind?" 
                style = {{
                  color:color,
                    width: Dimensions.get('screen').width * .84,
                    backgroundColor:textInputBackground,
                    alignSelf:"center",
                    textAlign:"left",
                    paddingLeft: 25,
                    paddingRight: 15,
                    paddingVertical: 10,
            
                    fontSize: 14,
                    borderRadius: 100,
                }}
                />

           
                </View>
            )
        }}
        messagesContainerStyle={{
            backgroundColor:"transparent",
            paddingVertical: 34,
            
        }}
        alwaysShowSend
        renderUsernameOnMessage = {false}
         showUserAvatar
         showAvatarForEveryMessage
          renderBubble={props =>{
            return(
              <Bubble
              {...props}

              wrapperStyle={{
                right:{
                  backgroundColor:"rgba(0,0,0,.75)",
                  borderWidth: 1,
                  borderColor:"white",
                  borderStyle: 'soolid',

                },
                left:{

                }
              }}
              />
            )
          }}
    
         messages = {messages}
       
         user = {{
            _id: 1, 
            
         }}
        />
        </View>
); 
}
export const synced_textGen_to_speech_jsthread = async (txt) =>{
       let res = promptGPT(txt);
       generateVoice_jsthread(res); 
}
