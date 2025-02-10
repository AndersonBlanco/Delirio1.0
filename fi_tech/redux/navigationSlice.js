import {createSlice} from '@reduxjs/toolkit'; 
import Home from '../Pages/home';
import AuthScreen from '../Pages/Auth';
export const navSlice = createSlice({
    name: "navigator",

    initialState:{
        value: {
            routes:{
                "SignIn":{
                    name: "SignIn",
                    id: 0,
                    params: []
                },
                "SignUp":{
                    name: "SignUp",
                    id: 1,
                    params: []
                },
                "Home":{
                    name: "Home",
                    id: 2,
                    params:[]
                }
            },

            currentRoute: "AuthScreen"
        }
    },

    reducers:{
        nav: (state, action) =>{
            state.value.currentRoute = action.payload; 
        },
        render: (state) =>{
            switch(state.value.currentRoute){
                case "Home": 
                    return <Home/>;
                case "Auth":
                    return <AuthScreen/>
            }
        }

    }
})

export const {nav} = navSlice.actions; 
export const {render} = navSlice.actions; 
export const selectNavigation = (state) => state.navigation.value; 
export default navSlice.reducer; 
