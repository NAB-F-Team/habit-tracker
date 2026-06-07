import { createSlice } from "@reduxjs/toolkit";
import habits from "../../data/habits.json";

const initialState={
    list:habits,
    filters:{
        category:"",
        priority:"",
        status:""
    }
};

const habitSlice=createSlice({
    name:"habits",
    initialState,

    reducers:{

        addHabit:(state,action)=>{
            state.list.push(action.payload);
        },

        updateHabit:(state,action)=>{

            const index=state.list.findIndex(
                item=>item.id===action.payload.id
            );

            if(index!==-1){
                state.list[index]=action.payload;
            }
        },

        deleteHabit:(state,action)=>{
            state.list=
                state.list.filter(
                    item=>item.id!==action.payload
                );
        },

        setFilter:(state,action)=>{
            state.filters={
                ...state.filters,
                ...action.payload
            };
        }

    }
});

export const {
    addHabit,
    updateHabit,
    deleteHabit,
    setFilter
}=habitSlice.actions;

export default habitSlice.reducer;