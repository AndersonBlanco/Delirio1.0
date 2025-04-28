import { memo, useEffect, useState } from "react";
import { Animated, View, Text, TouchableOpacity, BackHandler, StyleSheet, Image, Dimensions, StatusBar, TextInput, FlatList} from "react-native"; 
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
import WristWraps from "../assets/weightWraps.jpeg"
import { color } from "react-native-elements/dist/helpers";
import Modal from 'react-native-modal';

export default function Shop({theme}){
const dispatch = useDispatch();
const [hover, setHover] = useState(0);


const items = [
    {
        day: "Item",
        id: 0, //Monday
        title: "Cardio",
        specifics: {
            workouts:["5 Mile run", "30 min Jump Rope"]
        },
        img: Item1
    },
    {
        day: "Tuesday",
        id: 1, //Monday
        title: "Strength & Conditioning",
        specifics: {
            workouts:["5 Mile run", "30 min Jump Rope"]
        },
        img: Item2
    },
    {
        day: "Wednesday",
        id: 2, //Monday
        title: "Rest",
        specifics: {
            workouts:["5 Mile run", "30 min Jump Rope"]
        },
        img: Item2
    },
    {
        day: "Thursday",
        id: 3, //Monday
        title: "Cardio",
        specifics: {
            workouts:["5 Mile run", "30 min Jump Rope"]
        },
        img: Item1
    },
    {
        day: "Friday",
        id: 4, //Monday
        title: "Cardio",
        specifics: {
            workouts:["5 Mile run", "30 min Jump Rope"]
        },
        img: Item2
    },
    {
        day: "Saturday",
        id: 5, //Monday
        title: "Rest",
        specifics: {
            workouts:["5 Mile run", "30 min Jump Rope"]
        },
        img: Item1
    },
    {
        day: "Sunday",
        id: 6, //Monday
        title: "Rest",
        specifics: {
            workouts:["5 Mile run", "30 min Jump Rope"]
        },
        img: Item2
    },
    {
        day: "Sunday",
        id: 7, //Monday
        title: "Rest",
        specifics: {
            workouts:["5 Mile run", "30 min Jump Rope"]
        },
        img: Item2
    },
    {
        day: "Sunday",
        id: 8, //Monday
        title: "Rest",
        specifics: {
            workouts:["5 Mile run", "30 min Jump Rope"]
        },
        img: Item2
    },
    {
        day: "Sunday",
        id: 9, //Monday
        title: "Rest",
        specifics: {
            workouts:["5 Mile run", "30 min Jump Rope"]
        },
        img: Item2
    },

    
    
];

const [search, setSearch] = useState(""); 
const [finalSearch, setFinalSearch] = useState("A"); 
const [modalContent, setModalContent] = useState(0);
const [modalView, setModalView] = useState(false); 

async function handleItemClick(id){
    try{
         await setModalContent(id); 
         await setModalView(true)
    }catch{ 
        console.log("Error when loading clicked shop item")
    }
}

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
    innerTextCol: "rgba(255, 255, 255, 0.75)"
}
 const TraditionalItemList = memo(({data}) =>{
    return(
    <FlatList
    scrollEnabled = {false}
    numColumns={2}
    data = {data}
    horizontal = {false}
    columnWrapperStyle ={{columnGap: 1}}
    contentContainerStyle = {{alignItems:"center", justifyContent:"center", rowGap: 10, marginBottom: 30}}
    renderItem={({item}) =>{
        return(
        <TouchableOpacity key={item.id} onPress={ () =>handleItemClick(item.id)} style = {{ borderRadius: 10,overflow: "hidden", margin: 5, paddingTop: 0, alignItems:"center", justifyContent:"flex-start", borderColor: "rgb(67, 67, 67)", borderWidth: 1, height: Dimensions.get("screen").height*.35, width: Dimensions.get("screen").width*.47}}>
           <Image source = {item.img} style = {{height: "60%"}} />

            <View id = "textArea" style = {{paddingHorizontal: 10, paddingVertical: 20}}>
            <Text style = {{ marginVertical:0, color:theme? "black" : "white", alignSelf: "left"}}>Item</Text> 
            <Text style = {{ fontSize: 10, marginVertical:0, color:colors.innerTextCol}}>Imporve your recovery quality and speed, increase lactid acide removal, and save time and resources...</Text> 
            </View>
        </TouchableOpacity>
        )
    }}
    />
    )
 })

 const Static_TraditionalItemLis = ({data}) =>{
    data.map(item =>{
        return(
        <TouchableOpacity key = {item.id} style = {{ borderRadius: 10,overflow: "hidden", margin: 5, paddingTop: 0, alignItems:"center", justifyContent:"flex-start", borderColor: "rgb(67, 67, 67)", borderWidth: 1, height: Dimensions.get("screen").height*.35, width: Dimensions.get("screen").width*.47}}>
           <Image source = {Item1} style = {{height: "60%"}} />

            <View id = "textArea" style = {{paddingHorizontal: 10, paddingVertical: 20}}>
            <Text style = {{ marginVertical:0, color:theme? "black" : "white", alignSelf: "left"}}>Item</Text> 
            <Text style = {{ fontSize: 10, marginVertical:0, color:colors.innerTextCol}}>Imporve your recovery quality and speed, increase lactid acide removal, and save time and resources</Text> 
            </View>
        </TouchableOpacity>
        )}); 

 }
const CircularHorizontalList = ({data}) =>{
    return(
    <FlatList
data = {data}
horizontal = {true}
contentContainerStyle = {{paddingHorizontal: 15, columnGap: 25, alignItems:"center", justifyContent:"center", rowGap: 10, paddingVertical: 25}}
renderItem={({item}) =>{
    return(
    <TouchableOpacity key={item.id} onPress={async() => {try{ await setModalContent(item.id); await setModalView(true)}catch{ console.log("Error when loading clicked shop item")}}} style = {{ rowGap: 15, borderRadius: 100,overflow: "hidden", margin: 5, alignItems:"center", justifyContent:"center", borderColor: "rgb(67, 67, 67)", borderWidth: 1, height: Dimensions.get("screen").height*.22*.9, width: Dimensions.get("screen").width*.47*.9}}>
       <Image source = {WristWraps} style = {{height: "50%", width:"40%"}} />
        <View id = "textArea" style = {{paddingHorizontal: 10,}}>
        <Text style = {{ marginVertical:0, color:colors.innerTextCol, alignSelf: "left", fontSize: 12,}}>Lift Wraps</Text> 
        </View>
    </TouchableOpacity>
    )
}}
/>
    )
}
const ModalViewComp = memo(() =>
    <Modal visible={modalView} transparent = {true} style = {{position:"absolute"}} animationIn ="slideUp" animationOut = "slideDown" >
    <View onTouchStart={() => setModalView(false)} style = {{position:"absolute", backgroundColor: "rgba(0, 0, 0, 0)", height: "100%", width:"100%", justifyContent:"flex-end", alignItems:"center"}}>
    <Animated.View style = {{rowGap: 50, backgroundColor: "white", paddingVertical: 50, maxHeight: "50%", width:"100%", borderTopStartRadius:34, borderTopEndRadius: 34, textAlign:"center", alignItems:"center", justifyContent:"center",}}> 

        <View style = {[styles.row, {width:"100%", columnGap: 25, paddingHorizontal: 15}]}>    
        <Image source = {items[modalContent].img} style = {{height:"auto", width: "20%"}}/>

        <View sstyle = {[styles.column, ]}>
        <Text>{items[modalContent].title}</Text>
        <Text style = {{ fontSize: 10, marginVertical:0, color:"rgba(0,0,0, .75)", maxWidth: "85%"}}>Imporve your recovery quality and speed, increase lactid acide removal, and save time and resources...</Text>
        </View>
        
        </View>

        <TouchableOpacity onPress={() => setModalView(false)} style = {{borderRadius: 100, backgroundColor:"black", width:"90%", alignItems:"center", justifyContent:"center", paddingVertical: 10}}>
            <Text style= {{color: "white", fontSize: 15}}>add item to cart</Text>
        </TouchableOpacity>
    </Animated.View>
    </View>
    </Modal>
);


return(
    <>
      
    
 <SideNav buttonColor={"white"} style = {{top: 59, position: "relative", left: -170, marginBottom: 0}} />
 
 <View style = {[styles.row, { top: 28, columnGap: 10, right: -20, backgroundColor: "transparent", alignItems:"center", justifyContent:"center"}]}>
  <TextInput value = {search} placeholderTextColor={"rgba(255, 255, 255, 0.75)"} onEndEditing={hanfleFInalSearch} onChangeText={(val) => setSearch(val) } placeholder="search here.." style = {{fontSize: 15, textAlign:"center", borderColor: colors.outlineCol, borderWidth: theme? 0 : 1, backgroundColor: "transparent", width: Dimensions.get("screen").width * .7, borderRadius: 100, paddingHorizontal: 10, paddingVertical: 5}} />
  <TouchableOpacity onPress={() => setFinalSearch(search)} style = {{ position:"absolute", top: 7, left: 55}}>
  <Icon color={colors.innerTextCol} name = "search" style = {{}}/>
  </TouchableOpacity>
 
  <TouchableOpacity style = {[{justifyContent:"center", alignItems:"center", position: "relative", }, styles.row]}>
   <Icon color={colors.innerTextCol} name = "tune" size = {25}/>
    </TouchableOpacity>
    </View>

   

    <View style = {{position:"absolute", backgroundColor:"transparent", height: Dimensions.get("screen").height*.87, bottom: 0, width: Dimensions.get("screen").width}}>
   
    <ScrollView style = {{ }} horizontal = {false}>
    <CircularHorizontalList data = {items}/>
    <TraditionalItemList data = {items}/>
    </ScrollView>

    </View>
    <ModalViewComp/>
  </>
  
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