import { Image, StyleSheet, View, TouchableOpacity, Text, TextInput, Dimensions, ImageBackground} from "react-native"; 
import { Icon } from "react-native-elements";
import {useState} from "react"; 
import { SafeAreaView } from "react-native-safe-area-context";
import SideNav from "../components/sideNav";
import pros from "../components/dummyPros.json"; 
import { FlatList } from "react-native-gesture-handler";
import DefaultProfileImg from "../assets/user.png"; 
import Profile1 from "../assets/profile1.png";
import Profile2 from "../assets/profile2.png";
import Profile3 from "../assets/profile3.png";
import Profile4 from "../assets/profile4.png";
import Profile5 from "../assets/profile5.png";
import Profile6 from "../assets/profile6.png";

import Profile7 from "../assets/profile7.png";
import Profile8 from "../assets/profile8.png";
import Profile9 from "../assets/profile9.png";
import Profile10 from "../assets/profile10.png";

export default function Advice({theme}){
    
    const [search, setSearch] = useState(""); 
    const hanfleFInalSearch = (event) =>{
    try{
  setFinalSearch(event.nativeEvent.text); 
  //alert(event.nativeEvent.text)
    }catch(e){
        console.log(e); 
    }
  
}

const colors = {
    outlineCol: "rgb(113, 113, 113)",
    innerTextCol: "rgba(67, 67, 67, 0.75)"
}

/*
{
                pro.item.appCertified?  
                <Icon name = "verified" color ={"rgba(0,0,0,1)"} iconStyle={{color: "rgba(255, 215, 0, 1)", top: 0, zIndex: 5}} /> 
                :
                <Icon name = "verified" color ={"rgba(0,0,0,0)"} iconStyle={{color: "rgba(255, 215, 0, 0)", top:0}} /> 

            }
                */ 


const profileImgs = [
    Profile1,
    Profile2,
    Profile3,
    Profile4,
    Profile5,
    Profile6,
    Profile7,
    Profile8,
    Profile9,
    Profile10,
]; 
const [both, setBoth] = useState(false),
[fitness, setFitness] = useState(false),
[nutri, setNutri] = useState(false); 
    
const QuickFilters = (
    <View style = {{flexDirection:"row", columnGap: 10, bottom: -45}}>
        <TouchableOpacity onPress={() => setNutri(!nutri)} style = {{backgroundColor: nutri? "rgb(9, 8, 8)" : "rgba(137, 137, 137, 0.2)", borderRadius: 15, paddingHorizontal: 10, paddingVertical: 7, alignItems:"center", textAlign:"center", justifyContent:"center", }}>
            <Text style = {{color: nutri? "rgb(255, 255, 255)" : "rgba(137, 137, 137, 1)", fontSize: 10}}>Nutrition</Text>
        </TouchableOpacity>
         <TouchableOpacity onPress={() => setFitness(!fitness)} style = {{backgroundColor: fitness? "rgb(0, 0, 0)" : "rgba(137, 137, 137, 0.2)",
            color: fitness? "rgb(255, 255, 255)" : "rgba(137, 137, 137, 0.2)", borderRadius: 15, paddingHorizontal: 10, paddingVertical: 7, alignItems:"center", textAlign:"center", justifyContent:"center", }}>
            <Text style = {{ color: fitness? "rgb(255, 255, 255)" : "rgb(137, 137, 137)", fontSize: 10}}>Fitness</Text>
        </TouchableOpacity>
         <TouchableOpacity onPress={() => setBoth(!both)} style = {{backgroundColor: both? "rgba(0,0,0,1)" : "rgba(137, 137, 137, 0.2)", color: both? "rgb(255, 255, 255)" : "rgba(137, 137, 137, 0.2)", borderRadius: 15, paddingHorizontal: 10, paddingVertical: 7, alignItems:"center", textAlign:"center", justifyContent:"center", }}>
            <Text style = {{  color: both? "rgb(255, 255, 255)" : "rgb(137, 137, 137)", fontSize: 10}}>Both</Text>
        </TouchableOpacity>
    </View>
)
const ListPors = 
<FlatList
style = {{

}}
ItemSeparatorComponent={() => <View style = {{height: 25, width: "100%",}}/>}
showsVerticalScrollIndicator = {false}
data = {pros.Professionals}
renderItem={(pro) =>{
    return(
        <TouchableOpacity style = {[styles.column, {  rowGap: 10, textAlign:"center", alignItems:"center", justifyContent:"center", borderColor: "rgba(0,0,0,.2)", borderWidth: 2, borderRadius: 25, borderTopWidth: 0, borderRightWidth: 0, borderLeftWidth: 0, paddingHorizontal: 10, paddingVertical: 25}]}>
        <View style = {{paddingHorizontal:15, justifyContent:"space-evenly", flexDirection: "row", display:"flex", columnGap: 15, alignItems:"center", backgroundColor:"transparent", width: "100%"}}> 


           
            <View style = {{borderRadius: 100, overflow: "hidden", alignItems:"center", justifyContent:"center"}}>
             
        <Image source = {profileImgs[pro.index]} style = {{height: 75, width: 75, marginHorizontal: 0, overflow:"visible"}}/>
            
                
        </View>

        <View style = {styles.column}>
        <Text>{pro['item'].name}</Text>
        <Text>{pro['item'].certification}</Text>
        </View>

        </View>

        <Text style = {{paddingHorizontal: 17}}>{pro.item.bio}</Text>
        <View style = {[styles.row, {paddingTop: 10, columnGap: 15, justifyContent:"center", alignItems:"center"}]}>
            <TouchableOpacity style = {{backgroundColor: "black", width: "70%", borderRadius: 100,alignItems:"center", justifyContent:"center",  paddingVertical: 5}}>
                <Text style = {{color: "white", fontSize: 14}}>Schedule</Text>
            </TouchableOpacity>

            <Text>${pro.item.cost} / 1 hr</Text>
        </View>
        </TouchableOpacity>
   
    )
}
}
/>




    return(
        <View style = {{paddingTop: 20, display:"felx", flexDirection:"column", alignItems:"center"}}>
             <SideNav buttonColor={"black"} style = {{top: 59, position: "relative", left: -170, marginBottom: 0}} />
            
            
            <View style = {[styles.row, { top: 28, columnGap: 10, right: -20, backgroundColor: "transparent", alignItems:"center", justifyContent:"center"}]}>
             <TextInput value = {search} placeholderTextColor={colors.innerTextCol} onEndEditing={hanfleFInalSearch} onChangeText={(val) => setSearch(val) } placeholder="search here.." style = {{fontSize: 15, textAlign:"center", borderColor: colors.outlineCol, borderWidth: theme? 0 : 0, backgroundColor: "rgba(0,0,0,.1)", width: Dimensions.get("screen").width * .7, borderRadius: 100, paddingHorizontal: 10, paddingVertical: 5}} />
             <TouchableOpacity onPress={() => setFinalSearch(search)} style = {{ position:"absolute", top: 7, left: 55}}>
             <Icon color={colors.innerTextCol} name = "search" style = {{}}/>
             </TouchableOpacity>
            
             <TouchableOpacity style = {[{justifyContent:"center", alignItems:"center", position: "relative", }, styles.row]}>
              <Icon color={colors.innerTextCol} name = "tune" size = {25}/>
               </TouchableOpacity>
               </View>
               {QuickFilters}

               <View style = {{bottom: -50, paddingHorizontal: 15, height: Dimensions.get("screen").height*.82}}>
      {ListPors}
               </View> 
           
        </View>
    )
}

const styles = StyleSheet.create({
    cont:{
        
        height: "100%",
        width:"200%"
    },
    topNav:{
        display: "flex",
        flexDirection: "row",
        columnGap: 50, 
        width: "100%",
        alignContent:"center",
        bottom: -25,
        
        backgroundColor: "transparent"
    },
    topNavText:{
        color:"white",
        fontSize: 12,
        marginHorizontal: 20
    },
    column:{
        display:"flex",
        flexDirection:"column"
    },
    row:{
        display:"flex",
        flexDirection:"row"
    },

})