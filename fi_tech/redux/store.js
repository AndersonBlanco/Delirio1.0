import { configureStore, createSlice} from '@reduxjs/toolkit';
//import navigationReducer from "./navigationSlice"; 
const navSlice = createSlice({
    name: "navigator",
//0 = black 

//1 = white
    initialState:{
        value: {
            routes:{
                "Intro":{
                    name: "Intro",
                    id: 0,
                    params: [],
                    style:{
                        backColor: "black",  uiColor: 1
                    }
                },
                "Auth":{
                    name: "Auth",
                    id: 1,
                    params:[],
                    style: {backColor: "white",  uiColor: 1}
                },
                "Home":{
                    name: "Home",
                    id: 2,
                    params:[],
                    style: {backColor: "rgb(0, 0, 0)", uiColor:0}
                },
                "Settings":{
                    name: "Settings",
                    id: 3,
                    params:[],
                    style: {backColor: "white", uiColor: 1}
                },
                "Shop":{
                    name: "Shop",
                    id: 4,
                    params:[],
                    style: {backColor: "white", uiColor: 1}
                }
            },

            currentRoute: "Intro"
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


