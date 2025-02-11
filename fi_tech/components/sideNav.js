import { Modal, View, Text, TouchableOpacity, Pressable, Dimensions } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { useState } from "react";

export default function SideNav(){
    const [modalView, setModalView] = useState(false); 
       let screenHeight = Dimensions.get("screen").height,
            screenWidth = Dimensions.get("screen").width; 
            const fontS = 20; 
    return(
        <>
          <TouchableOpacity
            onPress = {() => setModalView(true)}
            style = {{position:"absolute", top: 50, left: 25}}>
                <Text style = {{color: "white", fontSize: 20}}>
                    =
                </Text>
            </TouchableOpacity>
        
         <Modal animationType  = "fade" visible = {modalView} transparent={true}>
                        <Pressable onPress = {() => setModalView(false)} style = {{height: screenHeight, width: screenWidth, backgroundColor: "rgba(0,0,0,0)"}}>
        
                        </Pressable>
                        <View style = {{backgroundColor: "white", width:screenWidth/2, height: screenHeight, position:'absolute', left: 0, padding: 25, flexDirection: "column", rowGap: 25, paddingTop: 150, paddingLeft: 50}}>
        
                            <TouchableOpacity><Text>Home</Text></TouchableOpacity>
                            <TouchableOpacity><Text>Shop</Text></TouchableOpacity>
                            <TouchableOpacity onPress={() => dispatch(nav("Home"))}><Text>Services</Text></TouchableOpacity>
                            <TouchableOpacity><Text>My Account</Text></TouchableOpacity>
                            <TouchableOpacity onPress={() => dispatch(nav("Auth"))}><Text>Settings</Text></TouchableOpacity>
                            <TouchableOpacity onPress = {() => setModalView(false)} style = {{position: "absolute", left: 170, top: 40}}><Text style = {{fontSize: 20}}>X</Text></TouchableOpacity>
        
                            </View>
                    </Modal>

                    </>
    )
}