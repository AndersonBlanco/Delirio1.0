import { configureStore, createSlice} from '@reduxjs/toolkit';
//import navigationReducer from "./navigationSlice"; 
const navSlice = createSlice({
    name: "navigator",

    initialState:{
        value: {
            routes:{
                "Intro":{
                    name: "Intro",
                    id: 0,
                    params: [],
                    style:{
                        backColor: "transparent"
                    }
                },
                "Auth":{
                    name: "Auth",
                    id: 1,
                    params:[],
                    style: {backColor: "white"}
                },
                "Home":{
                    name: "Home",
                    id: 2,
                    params:[],
                    style: {backColor: "rgb(26, 26, 26)"}
                }
            },

            currentRoute: "Home"
        }
    },

    reducers:{
        nav: (state, action) =>{
            state.value.currentRoute = action.payload; 
        },
        render: (state) =>{
          /*
            switch(state.value.currentRoute){
                case "Home": 
                    return <Home/>;
                case "Auth":
                    return <AuthScreen/>
            }
                    */ 
        }

    }
})



//main store: 
export const store = configureStore({
  reducer: {
    nav: navSlice.reducer,
  },
});


