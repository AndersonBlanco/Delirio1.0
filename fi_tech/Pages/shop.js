import { useEffect, useState, memo, useRef, useCallback } from "react";
import {Animated, View, Text, TouchableOpacity, BackHandler, StyleSheet, Image, Dimensions, StatusBar, TextInput, FlatList, Button, Modal, Touchable} from "react-native"; 
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
export default function Shop({theme}){
const dispatch = useDispatch();
const [hover, setHover] = useState(0);


const items = [
    {
        title: "Roller",
        img: Item1,
        price: 90,
        description: "Hello Universe, ijpwekofpw[, jeirfnowrnfouw iuwenfiuwen wenfowien endjd ewnienfdiweiowe nwkendk"
    },
    {
           title: "Roller",
        img: Item2,
        price: 90,
          description: "Hello Universe, ijpwekofpw[, jeirfnowrnfouw iuwenfiuwen wenfowien endjd ewnienfdiweiowe nwkendk"
    },
    {
          title: "Roller",
        img: Item1,
        price: 90,
          description: "Hello Universe, ijpwekofpw[, jeirfnowrnfouw iuwenfiuwen wenfowien endjd ewnienfdiweiowe nwkendk"
    },
    {
            title: "Roller",
        img: Item2,
        price: 90,
          description: "Hello Universe, ijpwekofpw[, jeirfnowrnfouw iuwenfiuwen wenfowien endjd ewnienfdiweiowe nwkendk"
    },
    {
            title: "Roller",
        img: Item1,
        price: 90,
          description: "Hello Universe, ijpwekofpw[, jeirfnowrnfouw iuwenfiuwen wenfowien endjd ewnienfdiweiowe nwkendk"
    },
    {
            title: "Roller",
        img: Item2,
        price: 90,
          description: "Hello Universe, ijpwekofpw[, jeirfnowrnfouw iuwenfiuwen wenfowien endjd ewnienfdiweiowe nwkendk"
    },
    {
             title: "Roller",
        img: Item1,
        price: 90,
          description: "Hello Universe, ijpwekofpw[, jeirfnowrnfouw iuwenfiuwen wenfowien endjd ewnienfdiweiowe nwkendk"
    },
    {
        title: "Roller",
        img: Item2,
        price: 90,
          description: "Hello Universe, ijpwekofpw[, jeirfnowrnfouw iuwenfiuwen wenfowien endjd ewnienfdiweiowe nwkendk"
    },
    {
             title: "Roller",
        img: Item1,
        price: 90,
          description: "Hello Universe, ijpwekofpw[, jeirfnowrnfouw iuwenfiuwen wenfowien endjd ewnienfdiweiowe nwkendk"
    },
    {
             title: "Roller",
        img: Item2,
        price: 90,
          description: "Hello Universe, ijpwekofpw[, jeirfnowrnfouw iuwenfiuwen wenfowien endjd ewnienfdiweiowe nwkendk"
    },

];

const horizontalItems = [
    {
        title: "Wrist Wraps",
        img: WristWraps,
        price: 90,
        description: "Hello Universe, ijpwekofpw[, jeirfnowrnfouw iuwenfiuwen wenfowien endjd ewnienfdiweiowe nwkendk"
    },
    {
           title: "Wrist Wraps",
        img: WristWraps,
        price: 90,
          description: "Hello Universe, ijpwekofpw[, jeirfnowrnfouw iuwenfiuwen wenfowien endjd ewnienfdiweiowe nwkendk"
    },
    {
          title: "Wrist Wraps",
        img: WristWraps,
        price: 90,
          description: "Hello Universe, ijpwekofpw[, jeirfnowrnfouw iuwenfiuwen wenfowien endjd ewnienfdiweiowe nwkendk"
    },
    {
            title: "Wrist Wraps",
        img: WristWraps,
        price: 90,
          description: "Hello Universe, ijpwekofpw[, jeirfnowrnfouw iuwenfiuwen wenfowien endjd ewnienfdiweiowe nwkendk"
    },
    {
            title: "Wrist Wraps",
        img: WristWraps,
        price: 90,
          description: "Hello Universe, ijpwekofpw[, jeirfnowrnfouw iuwenfiuwen wenfowien endjd ewnienfdiweiowe nwkendk"
    },
    {
            title: "Wrist Wraps",
        img: WristWraps,
        price: 90,
          description: "Hello Universe, ijpwekofpw[, jeirfnowrnfouw iuwenfiuwen wenfowien endjd ewnienfdiweiowe nwkendk"
    },
    {
             title: "Wrist Wraps",
        img: WristWraps,
        price: 90,
          description: "Hello Universe, ijpwekofpw[, jeirfnowrnfouw iuwenfiuwen wenfowien endjd ewnienfdiweiowe nwkendk"
    },
    {
        title: "Wrist Wraps",
        img: WristWraps,
        price: 90,
          description: "Hello Universe, ijpwekofpw[, jeirfnowrnfouw iuwenfiuwen wenfowien endjd ewnienfdiweiowe nwkendk"
    },
    {
             title: "Wrist Wraps",
        img: WristWraps,
        price: 90,
          description: "Hello Universe, ijpwekofpw[, jeirfnowrnfouw iuwenfiuwen wenfowien endjd ewnienfdiweiowe nwkendk"
    },
    {
             title: "Wrist Wraps",
        img: WristWraps,
        price: 90,
          description: "Hello Universe, ijpwekofpw[, jeirfnowrnfouw iuwenfiuwen wenfowien endjd ewnienfdiweiowe nwkendk"
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

const colors = {
    outlineCol: "rgb(113, 113, 113)",
    innerTextCol: "rgba(255, 255, 255, 0.75)"
}


const [modalView, set_modalView] = useState(false);
const [itemSelect, setItemSelect] = useState( {
        title: "Roller",
        img: Item1,
        price: 90
    },);

const slideItemRef = useRef(new Animated.Value(500)).current;
const slideItemCartUp =  async(item) => {
    //handling content change first: 
    await setItemSelect(item) 

      Animated.timing(slideItemRef, {
        toValue: 0, // Adjust this value for desired slide distance (e.g., -height of component)
        duration: 250, // Animation duration in milliseconds
        useNativeDriver: true, // For performance, if only animating transform/opacity
      }).start();
    };

    const slideItemCartDown = () => {
      Animated.timing(slideItemRef, {
        toValue: 500, // Back to original position
        duration: 250,
        useNativeDriver: true,
      }).start();
    };

const ItemCarted = (() =>{
  let [count, setCount] = useState(1); 
  count <1 ? set_modalView(false) : null; 

    return(
        <Animated.View style = {{
            backgroundColor:"white", width: Dimensions.get("screen").width, height: Dimensions.get("screen").height * .27, 
            position:"absolute",
            bottom: 0,
            borderTopEndRadius: 40,
            borderTopLeftRadius: 40,
               paddingHorizontal: 50,
               alignItems:"center",
               justifyContent:"center",
               rowGap: 10,
               transform:[{translateY: slideItemRef}]
        }}
        >
            <Text style = {{fontSize: 15}}>Total: ${itemSelect.price*count}</Text>
            <View style = {[styles.row, { columnGap: 31, alignItems:"center", justifyContent:"center",}]}>
                  <View style = {[styles.column, {
                alignItems:"center", justifyContent:"center",

                }]}>
            <Image source={itemSelect.img} style= {{height: 100, width: 100, }}/>
           
            </View>
            

            <View style = {[styles.row, {columnGap:20, alignItems:"center"}]}>
                <TouchableOpacity onPress={() =>setCount(count-1)}>      
                    <Icon size={35} name="remove" backgroundColor={"black"} color={"white"} style={{borderRadius:100}}/>
                </TouchableOpacity>
        
                    <Text style = {{fontSize:15}}>x{count}</Text>

                  <TouchableOpacity onPress={() =>setCount(count+1) }>      
                    <Icon size={35} name="add" backgroundColor={"black"} color={"white"} style={{borderRadius:100}}/>
                </TouchableOpacity>
            </View>

            </View>
          

            <TouchableOpacity style = {{
            backgroundColor:"black", width: 340, alignItems:"center", justifyContent:"center",
            paddingVertical: 10,
            borderRadius: 100,


            }} onPress={() =>{slideItemCartDown()}}><Text style = {{color:"white"}}>Add to cart</Text></TouchableOpacity>
    
        </Animated.View>
    )
}
)
 const TraditionalItemList = memo(({data}) =>{
    const render = useCallback(({item}) =>{
       
        return (
        <TouchableOpacity onPress={() => slideItemCartUp(item)} style = {{ borderRadius: 10,overflow: "hidden", margin: 5, paddingTop: 0, alignItems:"center", justifyContent:"flex-start", borderColor: "rgb(67, 67, 67)", borderWidth: 1, height: Dimensions.get("screen").height*.35, width: Dimensions.get("screen").width*.47}}>
           <Image source = {item.img} style = {{height: "60%"}} />

            <View id = "textArea" style = {{paddingHorizontal: 10, paddingVertical: 20}}>
            <Text style = {{ marginVertical:0, color:theme? "black" : "white", alignSelf: "left"}}>{item.title}</Text> 
            <Text style = {{ fontSize: 10, marginVertical:0, color:colors.innerTextCol}}>{item.description}</Text> 
            </View>
        </TouchableOpacity>
        )

    });

    return (
    <FlatList
    scrollEnabled = {false}
    numColumns={2}
    data = {data}
    horizontal = {false}
    columnWrapperStyle ={{columnGap: 1}}
    contentContainerStyle = {{alignItems:"center", justifyContent:"center", rowGap: 10, marginBottom: 30}}
    renderItem={render }
    />
    )
 }); 

 
const CircularHorizontalList = memo(({data}) =>{
    return(
    <FlatList
    
data = {data}
horizontal = {true}
contentContainerStyle = {{paddingHorizontal: 15, columnGap: 25, alignItems:"center", justifyContent:"center", rowGap: 10, paddingVertical: 25}}
renderItem={(item) =>{
    return(
    <TouchableOpacity onPress={() => slideItemCartUp(item.item)} style = {{ rowGap: 15, borderRadius: 100,overflow: "hidden", margin: 5, alignItems:"center", justifyContent:"center", borderColor: "rgb(67, 67, 67)", borderWidth: 1, height: Dimensions.get("screen").height*.22*.9, width: Dimensions.get("screen").width*.47*.9}}>
       <Image source = {item.item.img} style = {{height: "50%", width:"40%"}} />
        <View id = "textArea" style = {{paddingHorizontal: 10,}}>
        <Text style = {{ marginVertical:0, color:colors.innerTextCol, alignSelf: "left", fontSize: 12,}}>{item.item.title}</Text> 
        </View>
    </TouchableOpacity>
    )
}}
/>
    )
})


return(
    <>
 <SideNav buttonColor={"white"} style = {{top: 59, position: "relative", left: -170, marginBottom: 0}} />
 
 <View style = {[styles.row, { top: 28, columnGap: 10, right: -20, backgroundColor: "transparent", alignItems:"center", justifyContent:"center"}]}>
  <TextInput value = {search} placeholderTextColor={"rgba(255, 255, 255, 0.75)"} onEndEditing={hanfleFInalSearch} onChangeText={(val) => setSearch(val) } placeholder="search here.." style = {{fontSize: 15, textAlign:"center", borderColor: colors.outlineCol, borderWidth: theme? 0 : 1, backgroundColor: "transparent", width: Dimensions.get("screen").width * .7, borderRadius: 100, paddingHorizontal: 10, paddingVertical: 5}} />
  <TouchableOpacity onPress={() => setFinalSearch(search)} style = {{ position:"absolute", top: 7, left: 55}}>
  <Icon color={colors.innerTextCol} name = "search" style = {{}}/>
  </TouchableOpacity>
 
  <TouchableOpacity style = {[{justifyContent:"center", alignItems:"center", position: "relative", }, styles.row]}>
   <Icon color={colors.innerTextCol} name = "shopping-bag" size = {25}/>
    </TouchableOpacity>
    </View>

   

    <View style = {{position:"absolute", backgroundColor:"transparent", height: Dimensions.get("screen").height*.87, bottom: 0, width: Dimensions.get("screen").width}}>
   
    <ScrollView style = {{ }} horizontal = {false}>
    <CircularHorizontalList data = {horizontalItems}/>
    <TraditionalItemList data = {items}/>
    </ScrollView>

    </View>
    
    <ItemCarted/>
    
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

