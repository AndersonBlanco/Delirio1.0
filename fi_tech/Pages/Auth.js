import {View, Text, Image, SafeAreaView, StyleSheet, ImageBackground, TextInput, TouchableOpacity} from "react-native";
import { Dimensions } from "react-native";
import Logo from "../assets/fiTech_logo.png"; 
import AppleLogo from "../assets/apple_logo.png";
import GoogleLogo from "../assets/google_logo.png";
import { useState } from "react";

//redux
import { Provider, useSelector, useDispatch } from 'react-redux';
import { store } from '../redux/store';
import { nav, selectNavigation, render } from "../redux/navigationSlice"; 


let screenWidth = Dimensions.get("screen").width,
        screenHeight = Dimensions.get("screen").height; 

        
export default function AuthScreen(){
 const dispatch = useDispatch(); 
    const LogoImg = (
        <View style = {styles.logoContainer}>
            <Image source={Logo} style= {styles.logo} />
        </View>
    )

    let w = 64;
    const Intereactables = (
        <View style = {{top: -37, rowGap: 50}}>
            <Text style = {{fontSize: 14, fontWeight: "300"}}>Forgot username or password? <TouchableOpacity><Text style = {{bottom: -5, color: "rgb(255, 0, 0)", textDecorationLine: "underline", }}>Reset</Text></TouchableOpacity></Text>
           
            <View style = {[styles.row, {columnGap: 50, backgroundColor: "transparent", justifyContent:"center", }]}>
            <TouchableOpacity>
            <Image source = {AppleLogo} style = {{height: w, width:w}} />
            </TouchableOpacity>
      
            <TouchableOpacity style = {{borderRadius: 100, overflow: "hidden"}}>
            <Image source = {GoogleLogo} style = {{height: w, width:w}} />
            </TouchableOpacity>

            </View>

        </View>

    )

    const LogIn = (
        <View style = {[styles.column, {backgroundColor: "transparent", padding: 50, alignItems:"center", rowGap: 40, bottom: -70}]}>
            <TouchableOpacity style = {styles.textInputContainer}>            
                <TextInput placeholder="username / email" style={styles.textInput} placeholderTextColor={"rgba(0,0,0, .25)"}/>
            </TouchableOpacity>

            <TouchableOpacity style = {styles.textInputContainer}>            
                <TextInput placeholder="password" style={styles.textInput} placeholderTextColor={"rgba(0,0,0, .25)"}/>
            </TouchableOpacity>

            <TouchableOpacity style = {styles.authButtons} onPress={() => dispatch(nav("Home"))}>
                <Text style = {styles.authButtons_text}>SignIn</Text>
            </TouchableOpacity>

            <Text style = {{fontSize: 14, fontWeight: "300"}}>Dont have an account? <TouchableOpacity onPress={() => setAuthType(false)}><Text style = {{bottom: -5, color: "rgb(255, 0, 0)", textDecorationLine: "underline", }}>SignUp</Text></TouchableOpacity></Text>
            {Intereactables}
        
        </View>
    )

    
    const SignUp = (
        <View style = {[styles.column, {backgroundColor: "transparent", padding: 50, alignItems:"center", rowGap: 50, bottom: -20}]}>
            <TouchableOpacity style = {styles.textInputContainer}>            
                <TextInput placeholder="username" style={styles.textInput} placeholderTextColor={"rgba(0,0,0, .25)"}/>
            </TouchableOpacity>

            <TouchableOpacity style = {styles.textInputContainer}>            
                <TextInput placeholder="email" style={styles.textInput} placeholderTextColor={"rgba(0,0,0, .25)"}/>
            </TouchableOpacity>

            <TouchableOpacity style = {styles.textInputContainer}>            
                <TextInput placeholder="password" style={styles.textInput} placeholderTextColor={"rgba(0,0,0, .25)"}/>
            </TouchableOpacity>
            
            <TouchableOpacity style = {styles.authButtons} onPress={() => dispatch(nav("Home"))}>
                <Text style = {styles.authButtons_text}>SignUp</Text>
            </TouchableOpacity>

            <Text style = {{fontSize: 14, fontWeight: "300"}}>Already have an account? <TouchableOpacity onPress={() => setAuthType(true)}><Text style = {{bottom: -5, color: "rgba(250, 84,84,1)", textDecorationLine: "underline", }}>SignIn</Text></TouchableOpacity></Text>
            {Intereactables}
        </View>
    );

    const [AuthType, setAuthType] = useState(true);
   
    return(
        <SafeAreaView style={{alignItems:"center", justifyContent:"center", backgroundColor: "white", height:"200%"}}>
      
       {LogoImg}
        {AuthType? LogIn : SignUp}
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    logoContainer:{
    },
    logo:{

        bottom: -50,
        width: 150, 
        height: 150
    },

    column:{
        display: "flex",
        flexDirection: "column",
        width: Dimensions.get("screen").width 
    },

    textInputContainer:{
        backgroundColor: "transparent", 
        width: Dimensions.get("screen").width * .7,
        borderBottomWidth: 1, 
        borderBottomColor: "black",

        paddingVertical: 10,
        paddingHorizontal: 5,
 
    },

    textInput:{
        color: "black",
        textAlign:"left",
        fontSize: 15
    },
    authButtons:{
        backgroundColor: "rgb(0, 0, 0)",
        paddingVertical: 15,
        paddingHorizontal: 25,
        width: screenWidth * .65,
        textAlign:"center",
        alignItems:"center",
        justifyContent:"center",
        borderRadius: 100

    },

    authButtons_text:{
        color: "white",

    },
    hotFix1:{
        
    },

    row:{
        display:"flex",
        flexDirection: "row", 

    }
})