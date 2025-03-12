import { useState } from "react";
import {View, Text, TouchableOpacity, BackHandler, StyleSheet, Image, Dimensions, StatusBar, TextInput, FlatList} from "react-native"; 
import { ScrollView } from "react-native-gesture-handler";
import { useDispatc, useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import SideMenu from "../components/sideMenu";
import SideNav from "../components/sideNav";
import CardioImg from "../assets/run.jpg"; 
import User from "../assets/user.png"; 
import { SearchBar, Input, Icon} from "react-native-elements";
import SearchIcon from "../assets/searchIcon.png"
import Item1 from "../assets/item1.jpg"
import Item2 from "../assets/item2.jpg"
export default function Shop({theme}){
const dispatch = useDispatch();
const [hover, setHover] = useState(0);


const items = [
    {
        day: "Item",
        dayID: 0, //Monday
        title: "Cardio",
        specifics: {
            workouts:["5 Mile run", "30 min Jump Rope"]
        },
        img: Item1
    },
    {
        day: "Tuesday",
        dayID: 1, //Monday
        title: "Strength & Conditioning",
        specifics: {
            workouts:["5 Mile run", "30 min Jump Rope"]
        },
        img: Item2
    },
    {
        day: "Wednesday",
        dayID: 2, //Monday
        title: "Rest",
        specifics: {
            workouts:["5 Mile run", "30 min Jump Rope"]
        },
        img: Item2
    },
    {
        day: "Thursday",
        dayID: 3, //Monday
        title: "Cardio",
        specifics: {
            workouts:["5 Mile run", "30 min Jump Rope"]
        },
        img: Item1
    },
    {
        day: "Friday",
        dayID: 4, //Monday
        title: "Cardio",
        specifics: {
            workouts:["5 Mile run", "30 min Jump Rope"]
        },
        img: Item2
    },
    {
        day: "Saturday",
        dayID: 5, //Monday
        title: "Rest",
        specifics: {
            workouts:["5 Mile run", "30 min Jump Rope"]
        },
        img: Item1
    },
    {
        day: "Sunday",
        dayID: 6, //Monday
        title: "Rest",
        specifics: {
            workouts:["5 Mile run", "30 min Jump Rope"]
        },
        img: Item2
    },
    {
        day: "Sunday",
        dayID: 6, //Monday
        title: "Rest",
        specifics: {
            workouts:["5 Mile run", "30 min Jump Rope"]
        },
        img: Item2
    },
    {
        day: "Sunday",
        dayID: 6, //Monday
        title: "Rest",
        specifics: {
            workouts:["5 Mile run", "30 min Jump Rope"]
        },
        img: Item2
    },
    {
        day: "Sunday",
        dayID: 6, //Monday
        title: "Rest",
        specifics: {
            workouts:["5 Mile run", "30 min Jump Rope"]
        },
        img: Item2
    },
    
];

const [search, setSearch] = useState(""); 
const [finalSearch, setFinalSearch] = useState("A"); 
const hanfleFInalSearch = (event) =>{
    try{
  setFinalSearch(event.nativeEvent.text); 
  //alert(event.nativeEvent.text)
    }catch(e){
        console.log(e); 
    }
  
}

 
return(
    <>

 <View style = {[styles.row, {top: -370, columnGap: 10}]}>
 <SideNav buttonColor={theme? "black" :"white"} style = {{left: 0, right: 0, top: 0, position:"relative"}} />
  <TextInput value = {search} placeholderTextColor={theme? "gray": "white"} onEndEditing={hanfleFInalSearch} onChangeText={(val) => setSearch(val) } placeholder="search here.." style = {{fontSize: 15, textAlign:"center", borderColor: "white", borderWidth: theme? 0 : 1, backgroundColor: theme? "lightgray": "transparent", width: Dimensions.get("screen").width * .75, borderRadius: 100, paddingHorizontal: 10, paddingVertical: 5}} />
  <TouchableOpacity onPress={() => setFinalSearch(search)} style = {{ position:"absolute", top: 7, left: 40}}>
  <Icon color={theme? "gray": "white"} name = "search" style = {{}}/>
  </TouchableOpacity>
  <TouchableOpacity onPress={() => setSearch("")} style = {{ position:"absolute", top: 7, right: 45}}>
  <Icon color={theme? "gray": "white"} name = "delete" style = {{}}/>
  </TouchableOpacity>
  
  <TouchableOpacity style = {[{justifyContent:"center", alignItems:"center", position: "relative", }, styles.row]}>
   <Icon color={theme? "black": "white"} name = "tune" size = {25}/>
    </TouchableOpacity>
    </View>

<View style = {{position:"absolute", backgroundColor:"transparent", height: Dimensions.get("screen").height*.87, bottom: 0, width: Dimensions.get("screen").width}}>
    <FlatList

    numColumns={2}
    data = {items}
    horizontal = {false}
    columnWrapperStyle ={{columnGap: 0}}
    contentContainerStyle = {{alignItems:"center", justifyContent:"center"}}
    renderItem={(item) =>{
        return(
        <View style = {{overflow: "hidden", margin: 5, padding: 10, alignItems:"center", justifyContent:"center", borderColor: "lightgray", borderWidth: 1, height: Dimensions.get("screen")/3, width: Dimensions.get("screen").width*.47}}>
            <Image source = {Item1} style = {{height: 150, widt: "100%"}} />
            <Text style = {{ marginVertical:10, color:theme? "black" : "white"}}>Item</Text>
        </View>
        )
    }}
    />
    </View>
  </>
  
)
}

const styles = StyleSheet.create({
    cont:{
        backgroundColor: "white",
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