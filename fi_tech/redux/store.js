import { configureStore, createSlice} from '@reduxjs/toolkit';
//import navigationReducer from "./navigationSlice"; 
const navSlice = createSlice({
    name: "navigator",

    initialState:{
        value: {
            routes:{
                "Auth":{
                    name: "SignIn",
                    id: 0,
                    params: []
                },
                "Home":{
                    name: "Home",
                    id: 1,
                    params:[]
                }
            },

            currentRoute: "Auth"
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



//main store: 
export const store = configureStore({
  reducer: {
    nav: navSlice.reducer,
  },
});


