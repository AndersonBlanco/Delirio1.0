import {View, Text, TouchableOpacity} from "react-native"; 
import {useState} from "react"; 
import { useNavigation } from "@react-navigation/native";
import { TextInput } from "react-native-gesture-handler";

export default function Chat(){
    const [search, setSearch] = useState(""),
          [finalSearch, setFinalSearch] = useState(""); 

    const handleFinalSearch = e =>{
        setFinalSearch(e.nativeEvent.text); 
    }
    const InputBox = () =>{
        return(
            <TextInput value = {search} onChangeText = {v => setSearch(v)} placeholder="type here......"/>
        )
    }
    return(
        <View>
            <Text>Ask me anything!</Text>
        </View>
    )
}